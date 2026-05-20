from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel, Field


class KPIEvent(BaseModel):
    cr_id: str
    asset_id: str
    detected_at: datetime
    severity: str
    anomalous_metrics: List[Dict[str, Any]]
    details: Dict[str, Any]


class AIEvent(BaseModel):
    cr_id: str
    asset_id: str
    explanation: str
    likely_cause: str
    detected_at: datetime


class DLQEvent(BaseModel):
    source_topic: str
    payload: Dict[str, Any]
    error_message: str
    failed_at: datetime
