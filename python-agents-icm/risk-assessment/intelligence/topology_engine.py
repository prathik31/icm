from pathlib import Path
from typing import List, Dict

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


class TopologyEngine:

	def __init__(self):

		self.inventory_df = pd.read_csv(
			DATA_DIR / "network_inventory.csv"
		)

		self.cr_assets_df = pd.read_csv(
			DATA_DIR / "historical_cr_assets.csv"
		)

	# =====================================================
	# LOAD ASSET DETAILS
	# =====================================================
	def get_asset_details(
		self,
		asset_ids: List[str]
	) -> pd.DataFrame:

		return self.inventory_df[
			self.inventory_df["asset_id"].isin(asset_ids)
		].copy()

	# =====================================================
	# TOPOLOGY CENTRALITY
	# =====================================================
	def compute_topology_centrality(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		return float(
			assets_df["connected_asset_count"].mean()
		)

	# =====================================================
	# DEPENDENCY DENSITY
	# =====================================================
	def compute_dependency_density(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		total_connections = assets_df[
			"connected_asset_count"
		].sum()

		asset_count = len(assets_df)

		return float(total_connections / max(asset_count, 1))

	# =====================================================
	# CORE INFRA RATIO
	# =====================================================
	def compute_core_infra_ratio(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		core_assets = assets_df[
			assets_df["is_core_infrastructure"] == True
		]

		return float(
			len(core_assets) / len(assets_df)
		)

	# =====================================================
	# INTERNET EXPOSURE SCORE
	# =====================================================
	def compute_internet_exposure_score(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		internet_assets = assets_df[
			assets_df["is_internet_facing"] == True
		]

		exposure_ratio = (
			len(internet_assets) / len(assets_df)
		)

		return float(exposure_ratio * 100)

	# =====================================================
	# REGIONAL HUB RISK
	# =====================================================
	def compute_regional_hub_risk(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		return float(
			assets_df["region_hub_weight"].mean()
		)

	# =====================================================
	# REDUNDANCY COVERAGE
	# =====================================================
	def compute_redundancy_coverage_ratio(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		redundant_assets = assets_df[
			assets_df["redundancy_available"] == True
		]

		return float(
			len(redundant_assets) / len(assets_df)
		)

	# =====================================================
	# SINGLE POINT OF FAILURE SCORE
	# =====================================================
	def compute_single_point_of_failure_score(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		non_redundant = assets_df[
			assets_df["redundancy_available"] == False
		]

		if non_redundant.empty:
			return 0.0

		spof_score = (
			non_redundant["connected_asset_count"].sum()
			/ max(
				assets_df["connected_asset_count"].sum(),
				1
			)
		)

		return float(spof_score * 100)

	# =====================================================
	# INFRA BLAST FACTOR
	# =====================================================
	def compute_infra_blast_factor(
		self,
		assets_df: pd.DataFrame
	) -> float:

		if assets_df.empty:
			return 0.0

		criticality_weights = {
			"LOW": 1,
			"MEDIUM": 2,
			"HIGH": 3,
			"CRITICAL": 5
		}

		score = 0

		for _, row in assets_df.iterrows():

			weight = criticality_weights.get(
				row["criticality_level"],
				1
			)

			connections = row["connected_asset_count"]

			score += weight * connections

		return float(score / max(len(assets_df), 1))

	# =====================================================
	# MASTER TOPOLOGY FEATURE EXTRACTION
	# =====================================================
	def extract_topology_features(
		self,
		asset_ids: List[str]
	) -> Dict:

		assets_df = self.get_asset_details(asset_ids)

		return {

			"topology_centrality_score":
				self.compute_topology_centrality(
					assets_df
				),

			"dependency_density":
				self.compute_dependency_density(
					assets_df
				),

			"core_infra_ratio":
				self.compute_core_infra_ratio(
					assets_df
				),

			"internet_exposure_score":
				self.compute_internet_exposure_score(
					assets_df
				),

			"regional_hub_risk":
				self.compute_regional_hub_risk(
					assets_df
				),

			"redundancy_coverage_ratio":
				self.compute_redundancy_coverage_ratio(
					assets_df
				),

			"single_point_of_failure_score":
				self.compute_single_point_of_failure_score(
					assets_df
				),

			"infra_blast_factor":
				self.compute_infra_blast_factor(
					assets_df
				)
		}

