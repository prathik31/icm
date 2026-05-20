from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import Text
from sqlalchemy import TIMESTAMP
from sqlalchemy import ForeignKey

from sqlalchemy.sql import func

from persistence.db import Base


# =========================================================
# RISK ASSESSMENTS
# =========================================================
class RiskAssessment(Base):

    __tablename__ = "risk_assessments"

    assessment_id = Column(
        String(64),
        primary_key=True
    )

    cr_id = Column(
        String(128)
    )

    risk_score = Column(
        Float
    )

    risk_level = Column(
        String(32)
    )

    blast_radius = Column(
        String(32)
    )

    confidence = Column(
        Float
    )

    executive_summary = Column(
        Text
    )

    technical_analysis = Column(
        Text
    )

    cab_guidance = Column(
        Text
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )


# =========================================================
# GROUNDING EVIDENCE
# =========================================================
class GroundingEvidence(Base):

    __tablename__ = "grounding_evidence"

    evidence_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    assessment_id = Column(
        String(64),
        ForeignKey(
            "risk_assessments.assessment_id"
        )
    )

    similar_changes_analyzed = Column(
        Integer
    )

    similar_changes_with_outages = Column(
        Integer
    )

    similar_changes_with_rollbacks = Column(
        Integer
    )

    similar_changes_failed = Column(
        Integer
    )


# =========================================================
# EVENT AUDIT
# =========================================================
class EventAudit(Base):

    __tablename__ = "event_audit"

    audit_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    event_type = Column(
        String(64)
    )

    topic_name = Column(
        String(128)
    )

    processing_status = Column(
        String(32)
    )

    processed_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )
