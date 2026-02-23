from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class SMSLog(Base):
    __tablename__ = "sms_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_id = Column(UUID(as_uuid=True), ForeignKey("complaints.id"))
    to_phone = Column(String(15), nullable=False)
    message = Column(Text, nullable=False)
    provider = Column(String(30), default="MSG91")
    status = Column(String(20))
    provider_msg_id = Column(String(100))
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
