import json
import uuid

from persistence.db import (
    SessionLocal
)

from persistence.models import (
    RiskAssessment,
    GroundingEvidence,
    EventAudit
)


class RiskRepository:

    def _json_stringify(self, value):

        if value is None:
            return "[]"

        if isinstance(value, str):
            return value

        return json.dumps(value)

    # =====================================================
    # SAVE FULL ASSESSMENT
    # =====================================================
    def save_assessment(
        self,
        assessment_response
    ):

        db = SessionLocal()

        try:

            assessment_id = str(
                uuid.uuid4()
            )

            # =============================================
            # RISK ASSESSMENT
            # =============================================
            assessment = RiskAssessment(

                assessment_id=assessment_id,

                cr_id=assessment_response.get(
                    "crId",
                    "CR-KAFKA-EVENT"
                ),

                risk_score=assessment_response[
                    "riskScore"
                ],

                risk_level=assessment_response[
                    "riskLevel"
                ],

                blast_radius=assessment_response[
                    "blastRadius"
                ],

                confidence=assessment_response[
                    "confidence"
                ],

                executive_summary=assessment_response[
                    "executiveSummary"
                ],

                technical_analysis=assessment_response[
                    "technicalAnalysis"
                ],

                cab_guidance=assessment_response[
                    "cabGuidance"
                ],

                recommendations=self._json_stringify(
                    assessment_response.get(
                        "recommendations",
                        []
                    )
                ),

                risk_indicators=self._json_stringify(
                    assessment_response.get(
                        "riskIndicators",
                        []
                    )
                )
            )

            db.add(assessment)

            db.flush()

            # =============================================
            # GROUNDING EVIDENCE
            # =============================================
            grounding = assessment_response[
                "groundingEvidence"
            ]

            evidence = GroundingEvidence(

                assessment_id=assessment_id,

                similar_changes_analyzed=
                    grounding.get(
                        "similarChangesAnalyzed",
                        grounding.get(
                            "similar_changes_analyzed",
                            0
                        )
                    ),

                similar_changes_with_outages=
                    grounding.get(
                        "similarChangesWithOutages",
                        grounding.get(
                            "similar_changes_with_outages",
                            0
                        )
                    ),

                similar_changes_with_rollbacks=
                    grounding.get(
                        "similarChangesWithRollbacks",
                        grounding.get(
                            "similar_changes_with_rollbacks",
                            0
                        )
                    ),

                similar_changes_failed=
                    grounding.get(
                        "similarChangesFailed",
                        grounding.get(
                            "similar_changes_failed",
                            0
                        )
                    )
            )

            db.add(evidence)

            # =============================================
            # EVENT AUDIT
            # =============================================
            audit = EventAudit(

                event_type=
                    "RISK_ASSESSMENT",

                topic_name=
                    "ai.risk.completed",

                processing_status=
                    "SUCCESS"
            )

            db.add(audit)

            db.commit()

            print(
                "\nAssessment persisted successfully"
            )

        except Exception as e:

            db.rollback()

            print(
                f"\nPersistence Error: {e}"
            )

        finally:

            db.close()
