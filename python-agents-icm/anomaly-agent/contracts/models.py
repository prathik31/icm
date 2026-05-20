from pydantic import BaseModel, Field


class MetricPayload(BaseModel):
    metric_name: str = Field(..., description="Metric name")
    current_value: float = Field(..., description="Current metric value")
    unit: str = Field(..., description="Unit of the metric")
    baseline_mean: float = Field(..., description="Baseline mean for the metric")
    baseline_std: float = Field(..., description="Baseline standard deviation")
    baseline_p95: float = Field(..., description="Baseline 95th percentile")
    alert_threshold: float = Field(..., description="Alert threshold for the metric")


class AnomalousMetric(BaseModel):
    metric_name: str
    z_score: float
