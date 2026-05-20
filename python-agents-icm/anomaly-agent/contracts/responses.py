from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from .models import AnomalousMetric


class EvaluateResponse(BaseModel):
    detection_id: str = Field(..., description="Unique detection identifier")
    cr_id: str = Field(..., description="Change request identifier")
    asset_id: str = Field(..., description="Asset identifier")
    severity: str = Field(..., description="Anomaly severity level")
    confidence: float = Field(..., description="Confidence score")
    explanation: str = Field(..., description="AI explanation for the anomaly")
    likely_cause: str = Field(..., description="Likely cause of the anomaly")
    isolation_forest_score: float = Field(..., description="Isolation Forest anomaly score")
    anomalous_metrics: List[AnomalousMetric]
    detected_at: datetime = Field(..., description="UTC timestamp when anomaly was detected")

    model_config = {
        "json_schema_extra": {}
    }
