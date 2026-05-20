from pathlib import Path
from typing import Dict, List

import pandas as pd
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


class SimilarityEngine:

    def __init__(self):

        self.cr_df = pd.read_csv(
            DATA_DIR / "historical_change_requests.csv"
        )

        self.risk_df = pd.read_csv(
            DATA_DIR / "historical_risk_assessments.csv"
        )

        self.outcomes_df = pd.read_csv(
            DATA_DIR / "historical_cr_outcomes.csv"
        )

    # =====================================================
    # NORMALIZED NUMERIC SIMILARITY
    # =====================================================
    def numeric_similarity(
        self,
        a,
        b,
        max_value
    ):

        return 1 - (
            abs(a - b) / max(max_value, 1)
        )

    # =====================================================
    # BOOLEAN SIMILARITY
    # =====================================================
    def bool_similarity(
        self,
        a,
        b
    ):

        return 1.0 if a == b else 0.0

    # =====================================================
    # OPERATIONAL SIMILARITY
    # =====================================================
    def compute_operational_similarity(
        self,
        incoming: Dict,
        historical: Dict
    ):

        score = 0

        score += (
            self.bool_similarity(
                incoming["domain"],
                historical["domain"]
            ) * 0.25
        )

        score += (
            self.bool_similarity(
                incoming["change_type"],
                historical["change_type"]
            ) * 0.25
        )

        score += (
            self.bool_similarity(
                incoming["region"],
                historical["region"]
            ) * 0.10
        )

        score += (
            self.numeric_similarity(
                incoming["asset_count"],
                historical["asset_count"],
                50
            ) * 0.15
        )

        score += (
            self.numeric_similarity(
                incoming["duration_minutes"],
                historical["duration_minutes"],
                300
            ) * 0.10
        )

        score += (
            self.bool_similarity(
                incoming["is_peak_hours"],
                historical["is_peak_hours"]
            ) * 0.10
        )

        score += (
            self.bool_similarity(
                incoming["rollback_available"],
                historical["rollback_available"]
            ) * 0.05
        )

        return score

    # =====================================================
    # TOPOLOGY SIMILARITY
    # =====================================================
    def compute_topology_similarity(
        self,
        incoming: Dict,
        historical: Dict
    ):

        score = 0

        score += (
            self.bool_similarity(
                incoming["has_core_asset"],
                historical["has_core_asset"]
            ) * 0.25
        )

        score += (
            self.bool_similarity(
                incoming["any_internet_facing"],
                historical["any_internet_facing"]
            ) * 0.20
        )

        score += (
            self.bool_similarity(
                incoming["all_assets_redundant"],
                historical["all_assets_redundant"]
            ) * 0.20
        )

        score += (
            self.numeric_similarity(
                incoming["asset_count"],
                historical["asset_count"],
                50
            ) * 0.15
        )

        criticality_map = {
            "LOW": 1,
            "MEDIUM": 2,
            "HIGH": 3,
            "CRITICAL": 4
        }

        score += (
            self.numeric_similarity(
                criticality_map.get(
                    incoming["max_asset_criticality"],
                    1
                ),
                criticality_map.get(
                    historical["max_asset_criticality"],
                    1
                ),
                4
            ) * 0.20
        )

        return score

    # =====================================================
    # HISTORICAL OUTCOME SIMILARITY
    # =====================================================
    def compute_outcome_similarity(
        self,
        historical_row
    ):

        score = 0

        if historical_row.get("prediction_accurate"):
            score += 0.3

        if historical_row.get("outage_occurred"):
            score += 0.4

        if historical_row.get("rollback_triggered"):
            score += 0.3

        return score

    # =====================================================
    # HYBRID SIMILARITY
    # =====================================================
    def compute_hybrid_similarity(
        self,
        incoming: Dict,
        historical: Dict,
        outcome_row: Dict
    ):

        operational = self.compute_operational_similarity(
            incoming,
            historical
        )

        topology = self.compute_topology_similarity(
            incoming,
            historical
        )

        outcome = self.compute_outcome_similarity(
            outcome_row
        )

        return (
            operational * 0.4 +
            topology * 0.4 +
            outcome * 0.2
        )

    # =====================================================
    # FIND MOST SIMILAR CRS
    # =====================================================
    def find_similar_changes(
        self,
        incoming_cr: Dict,
        top_k: int = 5
    ) -> List[Dict]:

        similarities = []

        merged = self.cr_df.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        for _, row in merged.iterrows():

            row_dict = row.to_dict()

            similarity = self.compute_hybrid_similarity(
                incoming_cr,
                row_dict,
                row_dict
            )

            similarities.append({

                "cr_id":
                    row_dict["cr_id"],

                "similarity_score":
                    round(similarity, 4),

                "domain":
                    row_dict["domain"],

                "change_type":
                    row_dict["change_type"],

                "final_status":
                    row_dict["final_status_outcome"],

                "outage_occurred":
                    row_dict.get("outage_occurred", row_dict.get("outage_occurred_outcome")),

                "rollback_triggered":
                    row_dict.get("rollback_triggered", row_dict.get("rollback_triggered_outcome")),

                "actual_severity_label":
                    row_dict["actual_severity_label"]
            })

        similarities = sorted(
            similarities,
            key=lambda x: x["similarity_score"],
            reverse=True
        )

        return similarities[:top_k]
