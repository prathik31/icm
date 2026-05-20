from pydantic import BaseModel
from typing import List, Optional


class RunbookStep(BaseModel):
    step_number: int
    action: str
    expected_output: str
    rollback_action: str
    timeout_seconds: int


class RunbookOutput(BaseModel):
    runbook_id: str
    title: str
    estimated_duration_mins: int
    risk_notes: str
    steps: List[RunbookStep]
    generated_by: str
    rag_sources: List[str]


class GenerateRequest(BaseModel):

    cr_id: str

    title: str

    description: str

    domain: str

    change_type: str

    region: str

    assets: list

    risk_level: str

    risk_score: float

    recommendations: list[str]

    scheduled_start: str

    rollback_available: bool


class RunbookStep(BaseModel):
    id: str
    description: str


class Runbook(BaseModel):
    id: str
    title: str
    steps: List[RunbookStep] = []
    summary: Optional[str]
