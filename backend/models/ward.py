from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class Ward(Base):
    __tablename__ = "wards"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ward_name = Column(String(100), nullable=False)
    ward_number = Column(Integer)
    constituency_id = Column(UUID(as_uuid=True), ForeignKey("constituencies.id"))
    geojson = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
