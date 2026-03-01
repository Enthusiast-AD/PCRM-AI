from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.orm import Session
from services.whatsapp_service import send_whatsapp_message
from utils.database import get_db
from models.complaint import Complaint
from routers.complaints import generate_ticket_id
from services.ai_service import classify_complaint_task
import uuid

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])

@router.post("/whatsapp")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    incoming_msg = form_data.get('Body', '').strip()
    sender = form_data.get('From', '').replace('whatsapp:', '')
    
    if not incoming_msg:
        return Response(content="<Response></Response>", media_type="application/xml")
        
    # Check if user is asking for status (e.g., "CMP-202602-12345")
    if incoming_msg.upper().startswith("CMP-"):
        ticket_id = incoming_msg.upper()
        complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first()
        
        if complaint:
            reply = f"Status for {ticket_id}:\nCategory: {complaint.category}\nStatus: {complaint.status}\nPriority: {complaint.priority}"
        else:
            reply = f"Sorry, I couldn't find a ticket with ID {ticket_id}."
            
        send_whatsapp_message(sender, reply)
        return Response(content="<Response></Response>", media_type="application/xml")
        
    # Otherwise, treat it as a new complaint submission
    ticket_id = generate_ticket_id()
    
    # We need a default constituency for WhatsApp submissions if we don't know the user
    # In a real app, you'd ask them or look up their phone number.
    # For now, we'll just grab the first constituency in the DB.
    from models.constituency import Constituency
    default_constituency = db.query(Constituency).first()
    
    if not default_constituency:
        # Fallback if DB is completely empty
        reply = "System error: No constituency configured. Please contact support."
        send_whatsapp_message(sender, reply)
        return Response(content="<Response></Response>", media_type="application/xml")
        
    new_complaint = Complaint(
        ticket_id=ticket_id,
        citizen_phone=sender,
        channel="whatsapp",
        raw_text=incoming_msg,
        constituency_id=default_constituency.id
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # Trigger AI classification in background
    classify_complaint_task.delay(str(new_complaint.id), incoming_msg, "whatsapp")
    
    reply = f"Thank you! Your complaint has been registered.\nTicket ID: {ticket_id}\n\nWe will notify you of updates. Reply with your Ticket ID anytime to check the status."
    send_whatsapp_message(sender, reply)
    
    return Response(content="<Response></Response>", media_type="application/xml")
