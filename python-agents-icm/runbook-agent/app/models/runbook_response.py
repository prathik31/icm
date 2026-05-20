from typing import List, Any, Optional

from pydantic import BaseModel


class ExecutionStep(BaseModel):

    step_number: int

    action: str

    expected_output: str

    rollback_action: str

    timeout_seconds: int


class PreCheck(BaseModel):

    step_number: Optional[int] = None

    check_number: Optional[int] = None

    check_description: Optional[str] = None

    check_action: Optional[str] = None

    check_expected_output: Optional[str] = None

    action: Optional[str] = None

    expected_output: Optional[str] = None

    rollback_action: Optional[str] = None

    timeout_seconds: Optional[int] = None


class ValidationStep(BaseModel):

    step_number: Optional[int] = None

    validation_number: Optional[int] = None

    action: Optional[str] = None

    expected_output: Optional[str] = None

    rollback_action: Optional[str] = None

    timeout_seconds: Optional[int] = None


class RollbackStep(BaseModel):

    step_number: Optional[int] = None

    rollback_number: Optional[int] = None

    action: Optional[str] = None

    expected_output: Optional[str] = None

    rollback_action: Optional[str] = None

    timeout_seconds: Optional[int] = None

    cli_commands: Optional[List[str]] = None


class MonitoringStep(BaseModel):

    step_number: Optional[int] = None

    monitoring_number: Optional[int] = None

    action: Optional[str] = None

    expected_output: Optional[str] = None

    rollback_action: Optional[str] = None

    timeout_seconds: Optional[int] = None


class EscalationCondition(BaseModel):

    condition: Optional[str] = None

    action: Optional[str] = None

    timeout_seconds: Optional[int] = None


class RagSource(BaseModel):

    runbook_id: str

    title: str

    domain: str

    change_type: str


class RunbookResponse(BaseModel):

    runbook_id: str

    cr_id: str

    generated_at: str

    title: str

    estimated_duration_mins: int

    risk_level: str

    blast_radius: str

    risk_notes: str

    pre_checks: List[Any]

    execution_steps: List[ExecutionStep]

    validation_steps: List[Any]

    rollback_steps: List[Any]

    monitoring_guidance: List[Any]

    escalation_conditions: List[Any]

    rag_sources: List[RagSource]

    generated_by: Optional[str] = None

    generated_by: str
