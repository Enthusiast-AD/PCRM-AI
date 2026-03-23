from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(String(20), unique=True, nullable=False)
    citizen_name = Column(String(100))
    citizen_phone = Column(String(15), nullable=False)
    channel = Column(String(20), nullable=False)
    raw_text = Column(Text, nullable=False)
    photo_url = Column(Text)
    voice_url = Column(Text)
    category = Column(String(50), default="Unclassified")
    subcategory = Column(String(100))
    priority = Column(Integer, default=3)
    priority_reason = Column(Text)
    summary = Column(Text)
    status = Column(String(30), default="New")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"))
    constituency_id = Column(UUID(as_uuid=True), ForeignKey("constituencies.id"), nullable=True)
    language = Column(String(30), default="Hindi")
    tags = Column(ARRAY(String))
    ai_overview = Column(Text)
    suggested_action = Column(Text)
    suggested_assignee_role = Column(String(50))
    ai_draft_reply = Column(Text)
    resolution_note = Column(Text)
    sla_deadline = Column(DateTime(timezone=True))
    is_sla_breached = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True))
    closed_at = Column(DateTime(timezone=True))
