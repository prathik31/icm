from typing import List, Optional

from pydantic import BaseModel


class ChangeRequestEvent(

    BaseModel
):

    cr_id: str

    title: str

    description: str

    domain: str

    change_type: str

    region: str

    scheduled_start: str

    scheduled_end: str

    rollback_available: bool

    business_justification: str

    asset_count: int

    is_peak_hours: bool

    is_weekend: bool

    duration_minutes: int

    has_core_asset: Optional[bool] = False

    any_internet_facing: Optional[bool] = False

    all_assets_redundant: Optional[bool] = False

    max_asset_criticality: Optional[str] = "MEDIUM"

    asset_ids: List[str]


class GroundingEvidence(

    BaseModel
):

    similarChangesAnalyzed: int

    similarChangesWithOutages: int

    similarChangesWithRollbacks: int

    similarChangesFailed: int


class ModelMetadata(

    BaseModel
):

    predictionEngine: str

    reasoningEngine: str

    groundingEnabled: bool


class RiskAssessmentEvent(

    BaseModel
):

    assessmentId: str

    crId: str

    riskScore: float

    riskLevel: str

    blastRadius: str

    confidence: float

    executiveSummary: str

    technicalAnalysis: str

    cabGuidance: str

    recommendations: list[str]

    riskIndicators: list[str]

    generatedAt: str

    groundingEvidence: GroundingEvidence

    modelMetadata: ModelMetadata