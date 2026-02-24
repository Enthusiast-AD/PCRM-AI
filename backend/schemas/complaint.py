from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ComplaintCreate(BaseModel):
    citizen_name: Optional[str] = None
    citizen_phone: str
    channel: str = "web"
    raw_text: str
    ward_id: Optional[UUID] = None
    constituency_id: UUID
    photo_url: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: UUID
    ticket_id: str
    citizen_name: Optional[str]
    citizen_phone: str
    channel: str
    raw_text: str
    category: str
    priority: int
    status: str
    assigned_to: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
