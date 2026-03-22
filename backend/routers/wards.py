from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from models.ward import Ward
from utils.database import get_db

router = APIRouter(prefix="/api/v1/wards", tags=["wards"])

class WardResponse(BaseModel):
    id: UUID
    ward_name: str
    ward_number: Optional[int] = None
    
    class Config:
        from_attributes = True

@router.get("", response_model=List[WardResponse])
def get_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).all()
    # If no wards exist, return mock data wrapped as Ward objects, but better to return empty list.
    # However, to help frontend development, let's create them if they don't exist?
    # No, that's brittle. Let's just return what's in DB.
    return wards
