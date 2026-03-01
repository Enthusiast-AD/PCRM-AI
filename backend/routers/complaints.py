from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from utils.database import get_db
from utils.dependencies import get_current_user, require_role
from models.complaint import Complaint
from models.user import User
from schemas.complaint import ComplaintCreate, ComplaintResponse
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])

def generate_ticket_id():
    now = datetime.now()
    return f"CMP-{now.strftime('%Y%m')}-{str(uuid.uuid4().int)[:5]}"

@router.post("", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id()
    new_complaint = Complaint(**complaint.dict(), ticket_id=ticket_id)
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    # TODO: Trigger Celery task for AI classification here
    return new_complaint

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "FieldWorker":
        return db.query(Complaint).filter(Complaint.assigned_to == current_user.id).all()
    return db.query(Complaint).all()
