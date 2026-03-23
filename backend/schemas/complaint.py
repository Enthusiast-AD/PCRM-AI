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
    constituency_id: Optional[UUID] = None
    photo_url: Optional[str] = None
    category: Optional[str] = "Unclassified"

class ComplaintResponse(BaseModel):
    id: UUID
    ticket_id: str
    citizen_name: Optional[str]
    citizen_phone: str
    channel: str
    raw_text: str
    category: str
    subcategory: Optional[str] = None
    priority: int
    priority_reason: Optional[str] = None
    status: str
    assigned_to: Optional[UUID]
    ward_id: Optional[UUID] = None
    created_at: datetime
    summary: Optional[str] = None
    ai_overview: Optional[str] = None
    suggested_action: Optional[str] = None
    suggested_assignee_role: Optional[str] = None
    ai_draft_reply: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = []
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True
