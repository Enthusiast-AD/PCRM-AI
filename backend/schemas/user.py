from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    role: str
    language_pref: str = "Hindi"

class UserCreate(UserBase):
    password: str
    constituency_id: Optional[UUID] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    constituency_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
