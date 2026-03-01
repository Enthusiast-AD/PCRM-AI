from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utils.database import get_db
from utils.dependencies import get_current_user, require_role
from models.user import User
from models.complaint import Complaint
from models.ward import Ward
from schemas.analytics import SummaryResponse, HeatmapResponse
from sqlalchemy import func
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(require_role(["PA", "Politician"]))):
    # Base query filtered by the user's constituency
    base_query = db.query(Complaint).filter(Complaint.constituency_id == current_user.constituency_id)
    
    total = base_query.count()
    open_count = base_query.filter(Complaint.status.in_(["New", "Acknowledged", "In Progress"])).count()
    resolved = base_query.filter(Complaint.status == "Resolved").count()
    
    # Calculate average resolution time
    resolved_complaints = base_query.filter(Complaint.status == "Resolved", Complaint.resolved_at.isnot(None)).all()
    avg_resolution_hours = 0.0
    if resolved_complaints:
        total_hours = sum((c.resolved_at - c.created_at).total_seconds() / 3600 for c in resolved_complaints)
        avg_resolution_hours = round(total_hours / len(resolved_complaints), 1)
    
    # Group by category
    category_counts = db.query(Complaint.category, func.count(Complaint.id)).filter(
        Complaint.constituency_id == current_user.constituency_id
    ).group_by(Complaint.category).all()
    by_category = {cat: count for cat, count in category_counts if cat}
    
    # Group by status
    status_counts = db.query(Complaint.status, func.count(Complaint.id)).filter(
        Complaint.constituency_id == current_user.constituency_id
    ).group_by(Complaint.status).all()
    by_status = {stat: count for stat, count in status_counts if stat}
    
    # Group by ward
    ward_counts = db.query(Ward.ward_name, func.count(Complaint.id)).join(
        Complaint, Ward.id == Complaint.ward_id
    ).filter(
        Complaint.constituency_id == current_user.constituency_id
    ).group_by(Ward.ward_name).all()
    by_ward = {ward: count for ward, count in ward_counts if ward}
    
    return {
        "total": total,
        "open": open_count,
        "resolved": resolved,
        "avg_resolution_hours": avg_resolution_hours,
        "by_category": by_category,
        "by_status": by_status,
        "by_ward": by_ward
    }

@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(db: Session = Depends(get_db), current_user: User = Depends(require_role(["PA", "Politician"]))):
    wards = db.query(Ward).filter(Ward.constituency_id == current_user.constituency_id).all()
    
    heatmap_data = []
    for ward in wards:
        complaint_count = db.query(Complaint).filter(Complaint.ward_id == ward.id).count()
        
        # Get top category for this ward
        top_category_row = db.query(Complaint.category, func.count(Complaint.id).label('count')).filter(
            Complaint.ward_id == ward.id
        ).group_by(Complaint.category).order_by(func.count(Complaint.id).desc()).first()
        
        top_category = top_category_row.category if top_category_row else "None"
        
        heatmap_data.append({
            "ward_id": ward.id,
            "ward_name": ward.ward_name,
            "geojson": ward.geojson,
            "complaint_count": complaint_count,
            "top_category": top_category
        })
        
    return {"wards": heatmap_data}
