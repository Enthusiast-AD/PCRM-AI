from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import date

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    query_type: str # "data" | "speech" | "media" | "reply" | "complaint"
    complaint_id: Optional[UUID] = None


class BriefingSchema(BaseModel):
    date: date
    stats_snapshot: Dict[str, Any]
    ai_summary: str
    trend_alert: str

class BriefingResponse(BaseModel):
    briefing: BriefingSchema
    stats: Dict[str, Any]
