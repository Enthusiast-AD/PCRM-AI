from pydantic import BaseModel
from typing import Dict, Any, List
from uuid import UUID

class SummaryResponse(BaseModel):
    total: int
    open: int
    resolved: int
    avg_resolution_hours: float
    by_category: Dict[str, int]
    by_status: Dict[str, int]
    by_ward: Dict[str, int]

class WardHeatmap(BaseModel):
    ward_id: UUID
    ward_name: str
    geojson: Any
    complaint_count: int
    top_category: str

class HeatmapResponse(BaseModel):
    wards: List[WardHeatmap]
