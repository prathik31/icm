from pathlib import Path
from typing import Dict

import joblib

from config.settings import (
    settings
)

from intelligence.context_builder import ContextBuilder
from intelligence.feature_engine import FeatureEngine


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / settings.MODEL_PATH


class RiskPredictor:

    def __init__(self):

        # =================================================
        # LOAD MODELS
        # =================================================
        self.regressor = joblib.load(
            MODEL_DIR / "risk_regressor.pkl"
        )

        self.classifier = joblib.load(
            MODEL_DIR / "risk_classifier.pkl"
        )

        self.feature_names = joblib.load(
            MODEL_DIR / "feature_names.pkl"
        )

        self.risk_label_mapping = joblib.load(
            MODEL_DIR / "risk_label_mapping.pkl"
        )

        # =================================================
        # INTELLIGENCE ENGINES
        # =================================================
        self.context_builder = ContextBuilder()

        self.feature_engine = FeatureEngine()

    # =====================================================
    # COMPUTE BLAST RADIUS
    # =====================================================
    def compute_blast_radius(
        self,
        context: Dict
    ) -> str:

        topology = context[
            "topology_intelligence"
        ]

        blast_factor = topology[
            "infra_blast_factor"
        ]

        dependency_density = topology[
            "dependency_density"
        ]

        core_ratio = topology[
            "core_infra_ratio"
        ]

        # ================================================
        # BLAST HEURISTICS
        # ================================================
        if (
            blast_factor > 350 and
            dependency_density > 70 and
            core_ratio > 0.5
        ):

            return "GLOBAL"

        elif (
            blast_factor > 200 and
            dependency_density > 40
        ):

            return "REGIONAL"

        elif (
            blast_factor > 100
        ):

            return "LOCAL"

        return "MINIMAL"

    # =====================================================
    # COMPUTE CONFIDENCE
    # =====================================================
    def compute_confidence(
        self,
        risk_score: float,
        context: Dict
    ) -> float:

        historical = context[
            "historical_intelligence"
        ]

        grounding = context[
            "grounding_evidence"
        ]

        confidence = 0.5

        # ================================================
        # HISTORICAL CONFIDENCE SIGNALS
        # ================================================
        if historical[
            "underprediction_frequency"
        ] < 0.2:

            confidence += 0.10

        if historical[
            "historical_failure_rate"
        ] > 0.2:

            confidence += 0.10

        # ================================================
        # GROUNDING SIGNALS
        # ================================================
        if grounding[
            "similar_changes_analyzed"
        ] >= 5:

            confidence += 0.10

        if grounding[
            "similar_changes_with_outages"
        ] >= 3:

            confidence += 0.10

        # ================================================
        # RISK SCORE STABILITY
        # ================================================
        if risk_score > 80:

            confidence += 0.10

        confidence = min(confidence, 0.95)

        return round(confidence, 2)

    # =====================================================
    # PREDICT RISK
    # =====================================================
    def predict_risk(
        self,
        incoming_cr: Dict
    ) -> Dict:

        # ================================================
        # BUILD CONTEXT
        # ================================================
        context = (
            self.context_builder.build_context(
                incoming_cr
            )
        )

        # ================================================
        # BUILD FEATURES
        # ================================================
        feature_df = (
            self.feature_engine.build_feature_vector(
                incoming_cr,
                context
            )
        )

        # ================================================
        # ALIGN FEATURES
        # ================================================
        feature_df = feature_df[
            self.feature_names
        ]

        # ================================================
        # PREDICT RISK SCORE
        # ================================================
        risk_score = float(

            self.regressor.predict(
                feature_df
            )[0]
        )

        risk_score = round(risk_score, 2)

        # ================================================
        # PREDICT RISK LEVEL
        # ================================================
        risk_level_encoded = int(

            self.classifier.predict(
                feature_df
            )[0]
        )

        risk_level = self.risk_label_mapping[
            risk_level_encoded
        ]

        # ================================================
        # BLAST RADIUS
        # ================================================
        blast_radius = (
            self.compute_blast_radius(
                context
            )
        )

        # ================================================
        # CONFIDENCE
        # ================================================
        confidence = (
            self.compute_confidence(
                risk_score,
                context
            )
        )

        return {

            "risk_score":
                risk_score,

            "risk_level":
                risk_level,

            "blast_radius":
                blast_radius,

            "confidence":
                confidence,

            # ============================================
            # GROUNDING CONTEXT
            # ============================================
            "risk_indicators":
                context[
                    "risk_indicators"
                ],

            "grounding_evidence":
                context[
                    "grounding_evidence"
                ],

            "topology_intelligence":
                context[
                    "topology_intelligence"
                ],

            "historical_intelligence":
                context[
                    "historical_intelligence"
                ],

            "similarity_intelligence":
                context[
                    "similarity_intelligence"
                ]
        }