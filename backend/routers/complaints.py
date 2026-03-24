from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from utils.database import get_db
from utils.dependencies import get_current_user, require_role
from services.ai_service import classify_complaint_task
from models.complaint import Complaint
from models.user import User
from schemas.complaint import ComplaintCreate, ComplaintResponse, ComplaintAssign
import uuid
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/api/v1/complaints", tags=["complaints"])

def generate_ticket_id():
    now = datetime.now()
    return f"CMP-{now.strftime('%Y%m')}-{str(uuid.uuid4().int)[:5]}"

@router.post("", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id()
    
    # Default to first constituency if not provided (for prototype mapping)
    if not complaint.constituency_id:
        from models.constituency import Constituency
        default_constituency = db.query(Constituency).first()
        if default_constituency:
            complaint.constituency_id = default_constituency.id
            
    new_complaint = Complaint(**complaint.dict(), ticket_id=ticket_id)
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # Trigger Celery task for AI classification
    classify_complaint_task.delay(str(new_complaint.id), new_complaint.raw_text, new_complaint.channel)
    
    return new_complaint

@router.post("/upload")
def upload_image(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"photo_url": f"/uploads/{filename}"}

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Complaint)
    if current_user.role == "FieldWorker":
        return query.filter(Complaint.assigned_to == current_user.id).all()
    
    # For Politicians/PA/Coordinators, show complaints from their constituency
    if current_user.constituency_id:
        query = query.filter(Complaint.constituency_id == current_user.constituency_id)
        
    return query.all()

@router.patch("/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint(
    complaint_id: uuid.UUID, 
    assignment: ComplaintAssign, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Politician", "PA", "Coordinator"]))
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check if worker exists and belongs to the same constituency (optional but good practice)
    worker = db.query(User).filter(User.id == assignment.assigned_to, User.role == "FieldWorker").first()
    if not worker:
        raise HTTPException(status_code=400, detail="Worker not found")

    complaint.assigned_to = assignment.assigned_to
    if assignment.status:
        complaint.status = assignment.status
    
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/public", response_model=List[ComplaintResponse])
def get_public_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).filter(Complaint.publishedToPublic == True).all()
