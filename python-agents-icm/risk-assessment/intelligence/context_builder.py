from typing import Dict, List

from intelligence.topology_engine import TopologyEngine
from intelligence.historical_engine import HistoricalEngine
from intelligence.similarity_engine import SimilarityEngine


class ContextBuilder:

    def __init__(self):

        self.topology_engine = TopologyEngine()

        self.historical_engine = HistoricalEngine()

        self.similarity_engine = SimilarityEngine()

    # =====================================================
    # BUILD TOPOLOGY CONTEXT
    # =====================================================
    def build_topology_context(
        self,
        asset_ids: List[str]
    ) -> Dict:

        topology_features = (
            self.topology_engine.extract_topology_features(
                asset_ids
            )
        )

        return {

            "topology_intelligence": {

                "topology_centrality_score":
                    topology_features[
                        "topology_centrality_score"
                    ],

                "dependency_density":
                    topology_features[
                        "dependency_density"
                    ],

                "core_infra_ratio":
                    topology_features[
                        "core_infra_ratio"
                    ],

                "internet_exposure_score":
                    topology_features[
                        "internet_exposure_score"
                    ],

                "regional_hub_risk":
                    topology_features[
                        "regional_hub_risk"
                    ],

                "redundancy_coverage_ratio":
                    topology_features[
                        "redundancy_coverage_ratio"
                    ],

                "single_point_of_failure_score":
                    topology_features[
                        "single_point_of_failure_score"
                    ],

                "infra_blast_factor":
                    topology_features[
                        "infra_blast_factor"
                    ]
            }
        }

    # =====================================================
    # BUILD HISTORICAL CONTEXT
    # =====================================================
    def build_historical_context(
        self,
        domain: str,
        change_type: str,
        region: str
    ) -> Dict:

        historical_features = (
            self.historical_engine.extract_historical_features(
                domain,
                change_type,
                region
            )
        )

        return {

            "historical_intelligence": {

                "historical_failure_rate":
                    historical_features[
                        "historical_failure_rate"
                    ],

                "outage_correlation":
                    historical_features[
                        "outage_correlation"
                    ],

                "rollback_failure_rate":
                    historical_features[
                        "rollback_failure_rate"
                    ],

                "underprediction_frequency":
                    historical_features[
                        "underprediction_frequency"
                    ],

                "overprediction_frequency":
                    historical_features[
                        "overprediction_frequency"
                    ],

                "execution_variance":
                    historical_features[
                        "execution_variance"
                    ],

                "service_impact_expectation":
                    historical_features[
                        "service_impact_expectation"
                    ]
            }
        }

    # =====================================================
    # BUILD SIMILARITY CONTEXT
    # =====================================================
    def build_similarity_context(
        self,
        incoming_cr: Dict
    ) -> Dict:

        similar_changes = (
            self.similarity_engine.find_similar_changes(
                incoming_cr,
                top_k=5
            )
        )

        return {

            "similarity_intelligence": {

                "similar_change_count":
                    len(similar_changes),

                "top_similar_changes":
                    similar_changes
            }
        }

    # =====================================================
    # BUILD RISK INDICATORS
    # =====================================================
    def build_risk_indicators(
        self,
        topology_context: Dict,
        historical_context: Dict
    ) -> Dict:

        topology = topology_context[
            "topology_intelligence"
        ]

        historical = historical_context[
            "historical_intelligence"
        ]

        indicators = []

        # =================================================
        # TOPOLOGY RISK SIGNALS
        # =================================================
        if topology[
            "core_infra_ratio"
        ] > 0.5:

            indicators.append(
                "HIGH_CORE_INFRA_EXPOSURE"
            )

        if topology[
            "infra_blast_factor"
        ] > 250:

            indicators.append(
                "HIGH_BLAST_RADIUS_POTENTIAL"
            )

        if topology[
            "single_point_of_failure_score"
        ] > 40:

            indicators.append(
                "SINGLE_POINT_OF_FAILURE_RISK"
            )

        # =================================================
        # HISTORICAL RISK SIGNALS
        # =================================================
        if historical[
            "historical_failure_rate"
        ] > 0.2:

            indicators.append(
                "HIGH_HISTORICAL_FAILURE_RATE"
            )

        if historical[
            "outage_correlation"
        ] > 0.3:

            indicators.append(
                "HIGH_OUTAGE_CORRELATION"
            )

        if historical[
            "underprediction_frequency"
        ] > 0.25:

            indicators.append(
                "MODEL_UNDERPREDICTION_RISK"
            )

        return {

            "risk_indicators": indicators
        }

    # =====================================================
    # BUILD GROUNDING EVIDENCE
    # =====================================================
    def build_grounding_evidence(
        self,
        similarity_context: Dict
    ) -> Dict:

        similar_changes = similarity_context[
            "similarity_intelligence"
        ][
            "top_similar_changes"
        ]

        outage_count = sum(
            1 for x in similar_changes
            if x["outage_occurred"]
        )

        rollback_count = sum(
            1 for x in similar_changes
            if x["rollback_triggered"]
        )

        failed_count = sum(
            1 for x in similar_changes
            if x["final_status"] in [
                "FAILED",
                "ROLLED_BACK"
            ]
        )

        return {

            "grounding_evidence": {

                "similar_changes_analyzed":
                    len(similar_changes),

                "similar_changes_with_outages":
                    outage_count,

                "similar_changes_with_rollbacks":
                    rollback_count,

                "similar_changes_failed":
                    failed_count
            }
        }

    # =====================================================
    # MASTER CONTEXT BUILDER
    # =====================================================
    def build_context(
        self,
        incoming_cr: Dict
    ) -> Dict:

        asset_ids = incoming_cr.get(
            "asset_ids",
            []
        )

        topology_context = (
            self.build_topology_context(
                asset_ids
            )
        )

        historical_context = (
            self.build_historical_context(
                domain=incoming_cr["domain"],
                change_type=incoming_cr["change_type"],
                region=incoming_cr["region"]
            )
        )

        similarity_context = (
            self.build_similarity_context(
                incoming_cr
            )
        )

        risk_indicators = (
            self.build_risk_indicators(
                topology_context,
                historical_context
            )
        )

        grounding_evidence = (
            self.build_grounding_evidence(
                similarity_context
            )
        )

        return {

            **topology_context,

            **historical_context,

            **similarity_context,

            **risk_indicators,

            **grounding_evidence
        }
