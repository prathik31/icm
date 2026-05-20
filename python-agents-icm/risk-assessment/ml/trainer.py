from pathlib import Path
import joblib

import pandas as pd
import xgboost as xgb

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
	mean_absolute_error,
	classification_report
)

from intelligence.context_builder import ContextBuilder
from intelligence.feature_engine import FeatureEngine


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(exist_ok=True)


class RiskTrainer:

	def __init__(self):

		self.context_builder = ContextBuilder()

		self.feature_engine = FeatureEngine()

		# =========================================
		# RISK LEVEL ENCODING
		# =========================================
		self.risk_level_encoding = {

			"LOW": 0,
			"MEDIUM": 1,
			"HIGH": 2,
			"CRITICAL": 3
		}

		self.reverse_risk_encoding = {

			0: "LOW",
			1: "MEDIUM",
			2: "HIGH",
			3: "CRITICAL"
		}

		self.cr_df = pd.read_csv(
			DATA_DIR / "historical_change_requests.csv"
		)

		self.risk_df = pd.read_csv(
			DATA_DIR / "historical_risk_assessments.csv"
		)

		self.assets_df = pd.read_csv(
			DATA_DIR / "historical_cr_assets.csv"
		)

	# =====================================================
	# GET ASSET IDS FOR CR
	# =====================================================
	def get_asset_ids(
		self,
		cr_id
	):

		assets = self.assets_df[
			self.assets_df["cr_id"] == cr_id
		]

		return assets["asset_id"].tolist()

	# =====================================================
	# BUILD TRAINING DATASET
	# =====================================================
	def build_training_dataset(self):

		feature_rows = []

		merged = self.cr_df.merge(
			self.risk_df,
			on="cr_id",
			how="inner",
			suffixes=("_cr", "_risk")
		)

		print(
			f"Building intelligence features for "
			f"{len(merged)} historical CRs..."
		)

		for idx, row in merged.iterrows():

			try:

				asset_ids = self.get_asset_ids(
					row["cr_id"]
				)

				incoming_cr = {

					"domain":
						row["domain"],

					"change_type":
						row["change_type"],

					"region":
						row["region"],

					"asset_count":
						row["asset_count"],

					"duration_minutes":
						row["duration_minutes"],

					"is_peak_hours":
						row["is_peak_hours"],

					"is_weekend":
						row["is_weekend"],

					"rollback_available":
						row["rollback_available"],

					"has_core_asset":
						row["has_core_asset"],

					"any_internet_facing":
						row["any_internet_facing"],

					"all_assets_redundant":
						row["all_assets_redundant"],

					"max_asset_criticality":
						row["max_asset_criticality"],

					"asset_ids":
						asset_ids
				}

				# =========================================
				# BUILD CONTEXT
				# =========================================
				context = (
					self.context_builder.build_context(
						incoming_cr
					)
				)

				# =========================================
				# BUILD FEATURE VECTOR
				# =========================================
				feature_df = (
					self.feature_engine.build_feature_vector(
						incoming_cr,
						context
					)
				)

				feature_row = feature_df.iloc[0].to_dict()

				# =========================================
				# TARGETS
				# =========================================
				feature_row["risk_score"] = (
					row["risk_score"]
				)

				feature_row["risk_level"] = (
					row["risk_level"]
				)

				feature_rows.append(feature_row)

				if idx % 100 == 0:

					print(
						f"Processed {idx} CRs..."
					)

			except Exception as e:

				print(
					f"Failed processing "
					f"{row['cr_id']} -> {e}"
				)

		dataset = pd.DataFrame(feature_rows)

		return dataset

	# =====================================================
	# TRAIN MODELS
	# =====================================================
	def train_models(self):

		print(
			"\nBuilding intelligence-aware dataset...\n"
		)

		dataset = self.build_training_dataset()

		print(
			f"\nDataset shape: {dataset.shape}"
		)

		# ================================================
		# FEATURES
		# ================================================
		X = dataset.drop(
			columns=[
				"risk_score",
				"risk_level"
			]
		)

		# ================================================
		# TARGETS
		# ================================================
		y_score = dataset["risk_score"]

		y_level = dataset["risk_level"].map(
			self.risk_level_encoding
		)

		# ================================================
		# TRAIN TEST SPLIT
		# ================================================
		(
			X_train,
			X_test,
			y_score_train,
			y_score_test,
			y_level_train,
			y_level_test
		) = train_test_split(
			X,
			y_score,
			y_level,
			test_size=0.2,
			random_state=42
		)

		# ================================================
		# REGRESSOR
		# ================================================
		print(
			"\nTraining Risk Score Regressor...\n"
		)

		regressor = xgb.XGBRegressor(

			n_estimators=300,

			max_depth=8,

			learning_rate=0.05,

			subsample=0.9,

			colsample_bytree=0.9,

			random_state=42
		)

		regressor.fit(
			X_train,
			y_score_train
		)

		score_preds = regressor.predict(
			X_test
		)

		mae = mean_absolute_error(
			y_score_test,
			score_preds
		)

		print(f"Risk Score MAE: {mae:.2f}")

		# ================================================
		# CLASSIFIER
		# ================================================
		print(
			"\nTraining Risk Level Classifier...\n"
		)

		classifier = xgb.XGBClassifier(

			n_estimators=300,

			max_depth=8,

			learning_rate=0.05,

			subsample=0.9,

			colsample_bytree=0.9,

			eval_metric="mlogloss",

			random_state=42
		)

		classifier.fit(
			X_train,
			y_level_train
		)

		level_preds = classifier.predict(
			X_test
		)

		print(
			classification_report(
				y_level_test,
				level_preds
			)
		)

		# ================================================
		# SAVE MODELS
		# ================================================
		print("\nSaving models...\n")

		joblib.dump(
			regressor,
			MODEL_DIR / "risk_regressor.pkl"
		)

		joblib.dump(
			classifier,
			MODEL_DIR / "risk_classifier.pkl"
		)

		joblib.dump(
			self.feature_engine.get_feature_names(),
			MODEL_DIR / "feature_names.pkl"
		)

		joblib.dump(
			self.reverse_risk_encoding,
			MODEL_DIR / "risk_label_mapping.pkl"
		)

		print(
			"✅ Intelligence-aware models saved"
		)

		return {

			"dataset_shape":
				dataset.shape,

			"mae":
				mae
		}


if __name__ == "__main__":

	trainer = RiskTrainer()

	results = trainer.train_models()

	print("\nTRAINING COMPLETE")

	print(results)
