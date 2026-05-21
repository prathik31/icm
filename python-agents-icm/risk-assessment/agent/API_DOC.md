# Risk Assessment Agent — API & Persistence Reference

Location: risk-assessment/agent

## Overview
- Framework: FastAPI (see [risk-assessment/agent/main.py](risk-assessment/agent/main.py#L1))
- DB: MySQL via SQLAlchemy. Connection string in [risk-assessment/config/settings.py](risk-assessment/config/settings.py#L1) as `MYSQL_URL` (example: `mysql+pymysql://.../icm_risk_intelligence`).

## Endpoints

### GET /health
- Path: `/health` (app root)
- Method: `GET`
- Headers: `Accept: application/json` (typical)
- Query/body: none
- Response (200):
  - `status` (string) — e.g. `UP`
  - `service` (string) — service name from settings
  - `version` (string) — agent version
  - Implementation: [risk-assessment/agent/main.py](risk-assessment/agent/main.py#L53-L72)

### POST /analyze
- Path: `/analyze` (app root)
- Method: `POST`
- Headers: `Content-Type: application/json`, `Accept: application/json`
- Query params: `debug` (optional, boolean) — when true returns debug payload
- Request body JSON schema (Pydantic `AnalyzeRequest` in [risk-assessment/agent/main.py](risk-assessment/agent/main.py#L30)):
  - `domain` (string)
  - `change_type` (string)
  - `region` (string)
  - `asset_count` (int)
  - `duration_minutes` (int)
  - `is_peak_hours` (bool)
  - `is_weekend` (bool)
  - `rollback_available` (bool)
  - `has_core_asset` (bool)
  - `any_internet_facing` (bool)
  - `all_assets_redundant` (bool)
  - `max_asset_criticality` (string)
  - `asset_ids` (array of strings)

- Response (production) — keys created by `ResponseBuilder.build_production_response` ([risk-assessment/agent/response_builder.py](risk-assessment/agent/response_builder.py#L1)):
  - `assessmentId` (string UUID)
  - `crId` (string)
  - `generatedAt` (ISO datetime string)
  - `riskScore` (float)
  - `riskLevel` (string)
  - `blastRadius` (string)
  - `confidence` (float)
  - `executiveSummary` (string)
  - `technicalAnalysis` (string)
  - `recommendations` (array of strings)
  - `cabGuidance` (string)
  - `riskIndicators` (array)
  - `groundingEvidence` (object) with keys:
    - `similarChangesAnalyzed` (int)
    - `similarChangesWithOutages` (int)
    - `similarChangesWithRollbacks` (int)
    - `similarChangesFailed` (int)
  - `modelMetadata` (object)

- Debug response: includes above plus `debug_intelligence` containing `topology_intelligence`, `historical_intelligence`, `similarity_intelligence` when `debug=true`.

## Persistence (MySQL)
Files: [persistence/models.py](risk-assessment/persistence/models.py#L1), [persistence/repository.py](risk-assessment/persistence/repository.py#L1), [persistence/db.py](risk-assessment/persistence/db.py#L1)

- Connection: `DATABASE_URL = settings.MYSQL_URL` (see [risk-assessment/config/settings.py](risk-assessment/config/settings.py#L1)). SQLAlchemy `engine` & `SessionLocal` created in `persistence/db.py`.

- Tables / ORM models (SQLAlchemy)
  1. `risk_assessments` (class `RiskAssessment`) — columns:
     - `assessment_id` (String(64), PRIMARY KEY)
     - `cr_id` (String(128))
     - `risk_score` (Float)
     - `risk_level` (String(32))
     - `blast_radius` (String(32))
     - `confidence` (Float)
     - `executive_summary` (Text)
     - `technical_analysis` (Text)
     - `cab_guidance` (Text)
     - `created_at` (TIMESTAMP, server_default=now())

  2. `grounding_evidence` (class `GroundingEvidence`) — columns:
     - `evidence_id` (Integer, PRIMARY KEY, autoincrement)
     - `assessment_id` (String(64), FOREIGN KEY -> `risk_assessments.assessment_id`)
     - `similar_changes_analyzed` (Integer)
     - `similar_changes_with_outages` (Integer)
     - `similar_changes_with_rollbacks` (Integer)
     - `similar_changes_failed` (Integer)

  3. `event_audit` (class `EventAudit`) — columns:
     - `audit_id` (Integer, PRIMARY KEY, autoincrement)
     - `event_type` (String(64))
     - `topic_name` (String(128))
     - `processing_status` (String(32))
     - `processed_at` (TIMESTAMP, server_default=now())

- Where responses are written: `RiskRepository.save_assessment()` in [persistence/repository.py](risk-assessment/persistence/repository.py#L1) creates rows in `risk_assessments`, `grounding_evidence`, and `event_audit`.

## Notes & file references
- Request validation models: `AnalyzeRequest` in [risk-assessment/agent/main.py](risk-assessment/agent/main.py#L30).
- Response shaping: [risk-assessment/agent/response_builder.py](risk-assessment/agent/response_builder.py#L1).
- Persistence implementation and examples: [risk-assessment/persistence/repository.py](risk-assessment/persistence/repository.py#L1).
