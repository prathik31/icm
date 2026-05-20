import json
import uuid
from datetime import datetime

from typing import Dict


class ResponseBuilder:

    def _safe_str(
        self,
        source: Dict,
        key: str,
        default: str = ""
    ) -> str:

        value = source.get(key, default)
        if value is None:
            return default
        return str(value)

    def _safe_float(
        self,
        source: Dict,
        key: str,
        default: float = 0.0
    ) -> float:

        value = source.get(key, default)
        if value is None:
            return default
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def _safe_list(
        self,
        source: Dict,
        key: str,
        default: list | None = None
    ) -> list:

        if default is None:
            default = []

        value = source.get(key, default)
        if value is None:
            return default
        if isinstance(value, list):
            return value
        return [str(value)]

    def _safe_dict(
        self,
        source: Dict,
        key: str,
        default: Dict | None = None
    ) -> Dict:

        if default is None:
            default = {}

        value = source.get(key, default)
        if value is None:
            return default
        if isinstance(value, dict):
            return value
        return default

    def _parse_reasoning(
        self,
        reasoning_result: str
    ) -> Dict:

        reasoning_text = (
            reasoning_result
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:
            return json.loads(reasoning_text)
        except Exception:
            return {}

    # =====================================================
    # PRODUCTION RESPONSE
    # =====================================================
    def build_production_response(
        self,
        prediction_result: Dict,
        reasoning_result: str
    ) -> Dict:

        reasoning = self._parse_reasoning(reasoning_result)

        executive_summary = self._safe_str(
            reasoning,
            "executive_summary"
        )

        technical_analysis = self._safe_str(
            reasoning,
            "technical_analysis"
        )

        recommendations = self._safe_list(
            reasoning,
            "recommendations",
            default=[]
        )

        cab_guidance = self._safe_str(
            reasoning,
            "cab_guidance"
        )

        grounding_evidence = self._safe_dict(
            prediction_result,
            "grounding_evidence",
            default={
                "similarChangesAnalyzed": 0,
                "similarChangesWithOutages": 0,
                "similarChangesWithRollbacks": 0,
                "similarChangesFailed": 0
            }
        )

        if grounding_evidence and isinstance(grounding_evidence, dict):
            grounding_evidence = {
                "similarChangesAnalyzed": grounding_evidence.get(
                    "similar_changes_analyzed",
                    grounding_evidence.get(
                        "similarChangesAnalyzed",
                        0
                    )
                ),
                "similarChangesWithOutages": grounding_evidence.get(
                    "similar_changes_with_outages",
                    grounding_evidence.get(
                        "similarChangesWithOutages",
                        0
                    )
                ),
                "similarChangesWithRollbacks": grounding_evidence.get(
                    "similar_changes_with_rollbacks",
                    grounding_evidence.get(
                        "similarChangesWithRollbacks",
                        0
                    )
                ),
                "similarChangesFailed": grounding_evidence.get(
                    "similar_changes_failed",
                    grounding_evidence.get(
                        "similarChangesFailed",
                        0
                    )
                )
            }

        return {

            # =============================================
            # REQUIRED CONTRACT IDENTIFIERS
            # =============================================
            "assessmentId": str(
                uuid.uuid4()
            ),

            "crId": self._safe_str(
                prediction_result,
                "cr_id"
            ),

            "generatedAt": datetime.utcnow().isoformat(),

            # =============================================
            # CORE RISK OUTPUT
            # =============================================
            "riskScore": self._safe_float(
                prediction_result,
                "risk_score",
                0.0
            ),

            "riskLevel": self._safe_str(
                prediction_result,
                "risk_level",
                "UNKNOWN"
            ),

            "blastRadius": self._safe_str(
                prediction_result,
                "blast_radius",
                "UNKNOWN"
            ),

            "confidence": self._safe_float(
                prediction_result,
                "confidence",
                0.0
            ),

            # =============================================
            # EXECUTIVE REASONING
            # =============================================
            "executiveSummary": executive_summary,

            "technicalAnalysis": technical_analysis,

            "recommendations": recommendations,

            "cabGuidance": cab_guidance,

            # =============================================
            # HIGH-LEVEL EVIDENCE
            # =============================================
            "riskIndicators": self._safe_list(
                prediction_result,
                "risk_indicators",
                default=[]
            ),

            "groundingEvidence": grounding_evidence,

            # =============================================
            # MODEL METADATA
            # =============================================
            "modelMetadata": {

                "predictionEngine":
                    "xgboost-hybrid-intelligence-v3",

                "reasoningEngine":
                    "grounded-operational-llm-v1",

                "groundingEnabled":
                    True
            }
        }

    # =====================================================
    # DEBUG RESPONSE
    # =====================================================
    def build_debug_response(
        self,
        prediction_result: Dict,
        reasoning_result: str
    ) -> Dict:

        production = self.build_production_response(
            prediction_result,
            reasoning_result
        )

        debug_payload = {

            "debug_intelligence": {

                "topology_intelligence":
                    prediction_result[
                        "topology_intelligence"
                    ],

                "historical_intelligence":
                    prediction_result[
                        "historical_intelligence"
                    ],

                "similarity_intelligence":
                    prediction_result[
                        "similarity_intelligence"
                    ]
            }
        }

        return {

            **production,

            **debug_payload
        }
