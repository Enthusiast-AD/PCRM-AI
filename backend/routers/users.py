from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from utils.database import get_db
from utils.dependencies import get_current_user, require_role
from models.user import User
from schemas.user import UserResponse
import uuid

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/workers", response_model=List[UserResponse])
def get_available_workers(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Politician", "PA", "Coordinator"]))
):
    # Fetch workers in the same constituency
    query = db.query(User).filter(User.role == "FieldWorker")
    if current_user.constituency_id:
        query = query.filter(User.constituency_id == current_user.constituency_id)
    
    return query.all()
