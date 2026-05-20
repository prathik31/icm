from typing import List

from pydantic import BaseModel


class RiskAssessment(BaseModel):

    risk_score: float

    risk_level: str

    blast_radius: str

    confidence: float

    recommendations: List[str]

    risk_indicators: List[str]


class RunbookRequest(BaseModel):

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

    asset_ids: List[str]

    risk_assessment: RiskAssessment
