# Runbook Agent — API & Storage Reference

Location: runbook-agent/app

## Overview
- Framework: FastAPI (see [runbook-agent/app/main.py](runbook-agent/app/main.py#L1)).
- Primary persistent store for runbook embeddings: ChromaDB persisted to local SQLite in `chroma_db/` (see [runbook-agent/app/services/chroma_service.py](runbook-agent/app/services/chroma_service.py#L1) and `chroma_db/chroma.sqlite3`).
- Other data: CSV seed/fixtures under `runbook-agent/data/` (synthetic runbooks, historical change requests, network inventory).
- No MySQL-based persistence inside this agent. Configuration for Chroma DB directory is `CHROMA_DB_DIR` in [runbook-agent/app/core/config.py](runbook-agent/app/core/config.py#L1).

## Endpoints

### Health
- GET `/health` — simple health check (returns JSON `{"status": "healthy"}`) (see [runbook-agent/app/main.py](runbook-agent/app/main.py#L30)).

### POST /v1/runbooks/generate
- Fully-qualified path: `/v1/runbooks/generate` (router prefix `/v1/runbooks` included in `app.main`).
- Method: `POST`
- Headers: `Content-Type: application/json` (typical)
- Request model: `RunbookRequest` in [runbook-agent/app/models/runbook_request.py](runbook-agent/app/models/runbook_request.py#L1):
  - `cr_id` (string)
  - `title` (string)
  - `description` (string)
  - `domain` (string)
  - `change_type` (string)
  - `region` (string)
  - `scheduled_start` (string)
  - `scheduled_end` (string)
  - `rollback_available` (bool)
  - `business_justification` (string)
  - `asset_ids` (array of strings)
  - `risk_assessment` (object `RiskAssessment`) with:
    - `risk_score` (float)
    - `risk_level` (string)
    - `blast_radius` (string)
    - `confidence` (float)
    - `recommendations` (array of strings)
    - `risk_indicators` (array of strings)

- Response model: `RunbookResponse` in [runbook-agent/app/models/runbook_response.py](runbook-agent/app/models/runbook_response.py#L1) — fields include:
  - `runbook_id` (string)
  - `cr_id` (string)
  - `generated_at` (string)
  - `title` (string)
  - `estimated_duration_mins` (int)
  - `risk_level` (string)
  - `blast_radius` (string)
  - `risk_notes` (string)
  - `pre_checks` (array)
  - `execution_steps` (array of `ExecutionStep` objects)
  - `validation_steps`, `rollback_steps`, `monitoring_guidance`, `escalation_conditions`
  - `rag_sources` (array of `RagSource` objects identifying source runbooks)
  - `generated_by` (string)

### Other route file (not mounted)
- `app/api/routes.py` also defines a `POST /generate` using `GenerateRequest` -> `RunbookOutput` (see [runbook-agent/app/api/routes.py](runbook-agent/app/api/routes.py#L1)), but that router is not included in `app.main` so the active API is `/v1/runbooks`.

## Storage / Persistence

- Embeddings & vector search: ChromaDB persistent client is instantiated with `path=settings.CHROMA_DB_DIR` in [runbook-agent/app/services/chroma_service.py](runbook-agent/app/services/chroma_service.py#L1). The default project folder contains `runbook-agent/chroma_db/chroma.sqlite3`.

- Seed and fixture data: CSV files under `runbook-agent/data/` (for example `synthetic_runbooks.csv`, `historical_change_requests.csv`, `network_inventory.csv`) are used by retrieval/ingestion logic (see `runbook-agent/app/rag/ingest_runbooks.py` if present and data files).

- No SQLAlchemy models or MySQL tables are defined inside this agent. If you need MySQL persistence, integration code would need to be added (e.g., SQLAlchemy engine and models similar to `risk-assessment/persistence`).

## File references
- API entrypoint: [runbook-agent/app/main.py](runbook-agent/app/main.py#L1)
- Active router: [runbook-agent/app/api/runbook_routes.py](runbook-agent/app/api/runbook_routes.py#L1)
- Models: [runbook-agent/app/models/runbook_request.py](runbook-agent/app/models/runbook_request.py#L1), [runbook-agent/app/models/runbook_response.py](runbook-agent/app/models/runbook_response.py#L1)
- Chroma client: [runbook-agent/app/services/chroma_service.py](runbook-agent/app/services/chroma_service.py#L1)
