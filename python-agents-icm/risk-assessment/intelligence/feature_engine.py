from typing import Dict

import pandas as pd


class FeatureEngine:

    def __init__(self):

        # =================================================
        # CATEGORICAL ENCODING MAPS
        # =================================================
        self.domain_encoding = {
            "NETWORK": 4,
            "DATABASE": 3,
            "SERVER": 2,
            "APPLICATION": 2,
            "SECURITY": 5,
            "CLOUD": 3
        }

        self.change_type_encoding = {
            "STANDARD": 1,
            "NORMAL": 2,
            "MAJOR": 4,
            "EMERGENCY": 5
        }

        self.criticality_encoding = {
            "LOW": 1,
            "MEDIUM": 2,
            "HIGH": 3,
            "CRITICAL": 4
        }

    # =====================================================
    # SAFE GETTER
    # =====================================================
    def safe_get(
        self,
        data: Dict,
        key: str,
        default=0
    ):

        value = data.get(key, default)

        if value is None:
            return default

        return value

    # =====================================================
    # BUILD FEATURE VECTOR
    # =====================================================
    def build_feature_vector(
        self,
        incoming_cr: Dict,
        context: Dict
    ) -> pd.DataFrame:

        topology = context[
            "topology_intelligence"
        ]

        historical = context[
            "historical_intelligence"
        ]

        grounding = context[
            "grounding_evidence"
        ]

        # =================================================
        # BUILD FEATURES
        # =================================================
        features = {

            # =============================================
            # CR CONTEXT FEATURES
            # =============================================
            "domain_encoded":
                self.domain_encoding.get(
                    incoming_cr["domain"],
                    0
                ),

            "change_type_encoded":
                self.change_type_encoding.get(
                    incoming_cr["change_type"],
                    0
                ),

            "asset_count":
                self.safe_get(
                    incoming_cr,
                    "asset_count"
                ),

            "duration_minutes":
                self.safe_get(
                    incoming_cr,
                    "duration_minutes"
                ),

            "is_peak_hours":
                int(
                    self.safe_get(
                        incoming_cr,
                        "is_peak_hours"
                    )
                ),

            "is_weekend":
                int(
                    self.safe_get(
                        incoming_cr,
                        "is_weekend"
                    )
                ),

            "rollback_available":
                int(
                    self.safe_get(
                        incoming_cr,
                        "rollback_available"
                    )
                ),

            # =============================================
            # TOPOLOGY FEATURES
            # =============================================
            "topology_centrality_score":
                topology[
                    "topology_centrality_score"
                ],

            "dependency_density":
                topology[
                    "dependency_density"
                ],

            "core_infra_ratio":
                topology[
                    "core_infra_ratio"
                ],

            "internet_exposure_score":
                topology[
                    "internet_exposure_score"
                ],

            "regional_hub_risk":
                topology[
                    "regional_hub_risk"
                ],

            "redundancy_coverage_ratio":
                topology[
                    "redundancy_coverage_ratio"
                ],

            "single_point_of_failure_score":
                topology[
                    "single_point_of_failure_score"
                ],

            "infra_blast_factor":
                topology[
                    "infra_blast_factor"
                ],

            # =============================================
            # HISTORICAL FEATURES
            # =============================================
            "historical_failure_rate":
                historical[
                    "historical_failure_rate"
                ],

            "outage_correlation":
                historical[
                    "outage_correlation"
                ],

            "rollback_failure_rate":
                historical[
                    "rollback_failure_rate"
                ],

            "underprediction_frequency":
                historical[
                    "underprediction_frequency"
                ],

            "overprediction_frequency":
                historical[
                    "overprediction_frequency"
                ],

            "execution_variance":
                historical[
                    "execution_variance"
                ],

            "service_impact_expectation":
                historical[
                    "service_impact_expectation"
                ],

            # =============================================
            # GROUNDING EVIDENCE FEATURES
            # =============================================
            "similar_changes_analyzed":
                grounding[
                    "similar_changes_analyzed"
                ],

            "similar_changes_with_outages":
                grounding[
                    "similar_changes_with_outages"
                ],

            "similar_changes_with_rollbacks":
                grounding[
                    "similar_changes_with_rollbacks"
                ],

            "similar_changes_failed":
                grounding[
                    "similar_changes_failed"
                ],

            # =============================================
            # ADVANCED DERIVED FEATURES
            # =============================================
            "blast_risk_index":
                topology[
                    "infra_blast_factor"
                ] *
                historical[
                    "outage_correlation"
                ],

            "operational_instability":
                historical[
                    "execution_variance"
                ] *
                historical[
                    "historical_failure_rate"
                ],

            "recovery_risk_index":
                (
                    1 -
                    topology[
                        "redundancy_coverage_ratio"
                    ]
                ) *
                historical[
                    "rollback_failure_rate"
                ],

            "historical_risk_pressure":
                (
                    historical[
                        "historical_failure_rate"
                    ] +
                    historical[
                        "outage_correlation"
                    ]
                ) / 2
        }

        return pd.DataFrame([features])

    # =====================================================
    # GET FEATURE NAMES
    # =====================================================
    def get_feature_names(self):

        return [

            "domain_encoded",
            "change_type_encoded",

            "asset_count",
            "duration_minutes",

            "is_peak_hours",
            "is_weekend",
            "rollback_available",

            "topology_centrality_score",
            "dependency_density",

            "core_infra_ratio",
            "internet_exposure_score",

            "regional_hub_risk",

            "redundancy_coverage_ratio",

            "single_point_of_failure_score",

            "infra_blast_factor",

            "historical_failure_rate",

            "outage_correlation",

            "rollback_failure_rate",

            "underprediction_frequency",

            "overprediction_frequency",

            "execution_variance",

            "service_impact_expectation",

            "similar_changes_analyzed",

            "similar_changes_with_outages",

            "similar_changes_with_rollbacks",

            "similar_changes_failed",

            "blast_risk_index",

            "operational_instability",

            "recovery_risk_index",

            "historical_risk_pressure"
        ]
