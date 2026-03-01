from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.database import get_db
from utils.dependencies import get_current_user, require_role
from models.user import User
from models.complaint import Complaint
from models.briefing import Briefing
from schemas.copilot import ChatRequest, BriefingResponse
from services.ai_service import chat_with_data, generate_morning_briefing
from datetime import date, datetime, timedelta
from sqlalchemy import func

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Politician"]))):
    # Fetch real context from DB based on query_type
    context_data = ""
    
    if request.query_type == "data":
        # Fetch high-level stats for data queries
        open_count = db.query(Complaint).filter(
            Complaint.constituency_id == current_user.constituency_id,
            Complaint.status.in_(["New", "Acknowledged", "In Progress"])
        ).count()
        
        urgent_count = db.query(Complaint).filter(
            Complaint.constituency_id == current_user.constituency_id,
            Complaint.priority == 5,
            Complaint.status != "Resolved"
        ).count()
        
        context_data = f"Current Constituency Stats: {open_count} total open complaints. {urgent_count} urgent (Priority 5) complaints."
        
    elif request.query_type in ["speech", "media"]:
        # Fetch recent resolved complaints for positive PR/speeches
        thirty_days_ago = datetime.now() - timedelta(days=30)
        resolved_recent = db.query(Complaint.category, func.count(Complaint.id)).filter(
            Complaint.constituency_id == current_user.constituency_id,
            Complaint.status == "Resolved",
            Complaint.resolved_at >= thirty_days_ago
        ).group_by(Complaint.category).all()
        
        resolved_str = ", ".join([f"{count} {cat} issues" for cat, count in resolved_recent])
        context_data = f"Accomplishments in last 30 days: Resolved {resolved_str}."

    response_text = chat_with_data(request.message, request.history, request.query_type, context_data)
    return {"response": response_text}

@router.get("/briefing/today", response_model=BriefingResponse)
def get_briefing_today(db: Session = Depends(get_db), current_user: User = Depends(require_role(["PA", "Politician"]))):
    today = date.today()
    
    # Check if briefing already exists for today
    existing_briefing = db.query(Briefing).filter(
        Briefing.constituency_id == current_user.constituency_id,
        Briefing.date == today
    ).first()
    
    # Calculate real stats
    yesterday = datetime.now() - timedelta(days=1)
    
    total_open = db.query(Complaint).filter(
        Complaint.constituency_id == current_user.constituency_id,
        Complaint.status.in_(["New", "Acknowledged", "In Progress"])
    ).count()
    
    new_since_yesterday = db.query(Complaint).filter(
        Complaint.constituency_id == current_user.constituency_id,
        Complaint.created_at >= yesterday
    ).count()
    
    resolved_today = db.query(Complaint).filter(
        Complaint.constituency_id == current_user.constituency_id,
        Complaint.status == "Resolved",
        func.date(Complaint.resolved_at) == today
    ).count()
    
    sla_breaches = db.query(Complaint).filter(
        Complaint.constituency_id == current_user.constituency_id,
        Complaint.is_sla_breached == True,
        Complaint.status != "Resolved"
    ).count()
    
    stats = {
        "total_open": total_open,
        "new_since_yesterday": new_since_yesterday,
        "resolved_today": resolved_today,
        "sla_breaches": sla_breaches
    }
    
    if existing_briefing:
        return {
            "briefing": existing_briefing,
            "stats": stats
        }
        
    # If no briefing exists, generate one using Gemini
    ai_response = generate_morning_briefing(stats)
    
    new_briefing = Briefing(
        constituency_id=current_user.constituency_id,
        date=today,
        stats_snapshot=stats,
        ai_summary=ai_response.get("ai_summary", "No summary generated."),
        trend_alert=ai_response.get("trend_alert", "No alerts today.")
    )
    
    db.add(new_briefing)
    db.commit()
    db.refresh(new_briefing)
    
    return {
        "briefing": new_briefing,
        "stats": stats
    }
