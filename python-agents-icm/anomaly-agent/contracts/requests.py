from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from .models import MetricPayload


class EvaluateRequest(BaseModel):
    cr_id: str = Field(..., description="Change request identifier")
    asset_id: str = Field(..., description="Asset identifier")
    window_start: datetime = Field(..., description="Start of the KPI window in UTC")
    window_end: datetime = Field(..., description="End of the KPI window in UTC")
    metrics: List[MetricPayload]

    model_config = {
        "json_schema_extra": {
            "example": {
                "cr_id": "CR-1234",
                "asset_id": "SITE-001",
                "window_start": "2026-05-19T08:00:00Z",
                "window_end": "2026-05-19T08:05:00Z",
                "metrics": [
                    {
                        "metric_name": "cpu_usage",
                        "current_value": 95.0,
                        "unit": "%",
                        "baseline_mean": 45.0,
                        "baseline_std": 8.0,
                        "baseline_p95": 70.0,
                        "alert_threshold": 85.0,
                    }
                ],
            }
        }
    }
