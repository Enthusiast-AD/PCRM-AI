from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class Constituency(Base):
    __tablename__ = "constituencies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    state = Column(String(100))
    type = Column(String(30))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
