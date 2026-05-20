from pathlib import Path
from typing import Dict

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


class HistoricalEngine:

    def __init__(self):

        self.cr_df = pd.read_csv(
            DATA_DIR / "historical_change_requests.csv"
        )

        self.outcomes_df = pd.read_csv(
            DATA_DIR / "historical_cr_outcomes.csv"
        )

        self.risk_df = pd.read_csv(
            DATA_DIR / "historical_risk_assessments.csv"
        )

    def _merged_col(self, df: pd.DataFrame, base: str) -> str:
        # Prefer outcome-specific column name if present, fall back to base
        candidates = [f"{base}_outcome", base, f"{base}_cr"]
        for c in candidates:
            if c in df.columns:
                return c
        raise KeyError(f"Column for '{base}' not found in merged frame")

    # =====================================================
    # GET SIMILAR CRS
    # =====================================================
    def get_similar_crs(
        self,
        domain: str,
        change_type: str,
        region: str
    ) -> pd.DataFrame:

        similar = self.cr_df[
            (self.cr_df["domain"] == domain) &
            (self.cr_df["change_type"] == change_type) &
            (self.cr_df["region"] == region)
        ]

        return similar.copy()

    # =====================================================
    # HISTORICAL FAILURE RATE
    # =====================================================
    def compute_historical_failure_rate(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        final_col = self._merged_col(merged, "final_status")

        failed = merged[merged[final_col] == "FAILED"]

        return float(len(failed) / max(len(merged), 1))

    # =====================================================
    # OUTAGE CORRELATION
    # =====================================================
    def compute_outage_correlation(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        outage_col = self._merged_col(merged, "outage_occurred")

        outages = merged[merged[outage_col] == True]

        return float(len(outages) / max(len(merged), 1))

    # =====================================================
    # ROLLBACK FAILURE RATE
    # =====================================================
    def compute_rollback_failure_rate(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        rollback_success_col = self._merged_col(merged, "rollback_successful")
        rollback_trigger_col = self._merged_col(merged, "rollback_triggered")

        rollback_failures = merged[merged[rollback_success_col] == False]
        rollback_attempts = merged[merged[rollback_trigger_col] == True]

        return float(len(rollback_failures) / max(len(rollback_attempts), 1))

    # =====================================================
    # UNDERPREDICTION FREQUENCY
    # =====================================================
    def compute_underprediction_frequency(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        under_col = self._merged_col(merged, "was_under_predicted")

        under = merged[merged[under_col] == True]

        return float(len(under) / max(len(merged), 1))

    # =====================================================
    # OVERPREDICTION FREQUENCY
    # =====================================================
    def compute_overprediction_frequency(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        over_col = self._merged_col(merged, "was_over_predicted")

        over = merged[merged[over_col] == True]

        return float(len(over) / max(len(merged), 1))

    # =====================================================
    # EXECUTION VARIANCE
    # =====================================================
    def compute_execution_variance(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        return float(
            similar_crs["duration_minutes"].std()
        )

    # =====================================================
    # SERVICE IMPACT EXPECTATION
    # =====================================================
    def compute_service_impact_expectation(
        self,
        similar_crs: pd.DataFrame
    ) -> float:

        if similar_crs.empty:
            return 0.0

        merged = similar_crs.merge(
            self.outcomes_df,
            on="cr_id",
            how="inner",
            suffixes=("_cr", "_outcome")
        )

        svc_imp_col = self._merged_col(merged, "services_impacted_count")

        return float(merged[svc_imp_col].mean())

    # =====================================================
    # MASTER HISTORICAL FEATURE EXTRACTION
    # =====================================================
    def extract_historical_features(
        self,
        domain: str,
        change_type: str,
        region: str
    ) -> Dict:

        similar_crs = self.get_similar_crs(
            domain,
            change_type,
            region
        )

        return {

            "historical_failure_rate":
                self.compute_historical_failure_rate(
                    similar_crs
                ),

            "outage_correlation":
                self.compute_outage_correlation(
                    similar_crs
                ),

            "rollback_failure_rate":
                self.compute_rollback_failure_rate(
                    similar_crs
                ),

            "underprediction_frequency":
                self.compute_underprediction_frequency(
                    similar_crs
                ),

            "overprediction_frequency":
                self.compute_overprediction_frequency(
                    similar_crs
                ),

            "execution_variance":
                self.compute_execution_variance(
                    similar_crs
                ),

            "service_impact_expectation":
                self.compute_service_impact_expectation(
                    similar_crs
                )
        }
