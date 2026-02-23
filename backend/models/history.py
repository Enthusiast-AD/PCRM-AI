from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"))
    old_status = Column(String(30))
    new_status = Column(String(30))
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    note = Column(Text)
    action_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
