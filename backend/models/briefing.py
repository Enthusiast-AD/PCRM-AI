from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class Briefing(Base):
    __tablename__ = "briefings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    constituency_id = Column(UUID(as_uuid=True), ForeignKey("constituencies.id"))
    date = Column(Date, nullable=False)
    stats_snapshot = Column(JSONB)
    ai_summary = Column(Text)
    trend_alert = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
