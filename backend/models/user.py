from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from utils.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    email = Column(String(255), unique=True)
    role = Column(String(30), nullable=False) # Politician, PA, FieldWorker, Coordinator
    constituency_id = Column(UUID(as_uuid=True), ForeignKey("constituencies.id"))
    language_pref = Column(String(30), default="Hindi")
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String, nullable=False)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
