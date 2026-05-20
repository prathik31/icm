# Runbook Agent

The **Runbook Agent** is a Python FastAPI service that generates telecom-style operational runbooks from change request input, retrieval-augmented runbook examples, asset inventory context, topology guidance, and LLM output. It is designed to turn a structured change request into a detailed execution plan with pre-checks, implementation steps, validation, rollback guidance, monitoring notes, and escalation conditions.

## What it does

The current production path is:

1. Receive a change request payload through the FastAPI API.
2. Build an embedding from the request title, description, domain, and change type.
3. Retrieve similar runbooks from ChromaDB.
4. Load asset details from the local network inventory.
5. Build topology and vendor-specific guidance.
6. Call the LLM to generate a structured runbook.
7. Clean placeholders and return a JSON response.

The service is centered around telecom and network operations, but the same pattern can be used for other enterprise change-management workflows.

## Repository Layout

```text
runbook-agent/
  app/
    main.py                # FastAPI entrypoint
    api/                   # HTTP routes
    core/                  # Environment/settings management
    models/                # Pydantic request and response schemas
    rag/                   # Retrieval and prompt/context building
    services/              # Embeddings, topology, inventory, LLM helpers
    kafka/                 # Kafka producer/consumer utilities
    utils/                 # Logging and helper utilities
  data/                    # CSV sources used by retrieval and enrichment
  chroma_db/                # Local ChromaDB persistence
  test_endpoint.py         # Manual endpoint smoke test
  test_retrieval.py        # Retrieval-only smoke test
  test_scenarios.py        # Local scenario test
  Dockerfile                # Container entrypoint placeholder
  requirements.txt
```

## Key Capabilities

- Retrieval-augmented runbook generation with ChromaDB.
- Telecom-oriented runbook structure with execution, validation, rollback, monitoring, and escalation sections.
- Asset enrichment from a local network inventory CSV.
- Topology-aware and vendor-aware guidance generation.
- Placeholder cleanup for generated operational commands.
- FastAPI-based HTTP interface for direct integration or manual validation.

## Main API Flow

The active FastAPI app is defined in [app/main.py](app/main.py). It exposes:

- `GET /health`
- `POST /v1/runbooks/generate`

The `/v1/runbooks/generate` route is implemented in [app/api/runbook_routes.py](app/api/runbook_routes.py) and uses the following flow:

- [app/rag/generator.py](app/rag/generator.py)
- [app/services/embedding_service.py](app/services/embedding_service.py)
- [app/rag/retriever.py](app/rag/retriever.py)
- [app/rag/context_builder.py](app/rag/context_builder.py)
- [app/services/inventory_service.py](app/services/inventory_service.py)
- [app/services/topology_service.py](app/services/topology_service.py)
- [app/services/groq_service.py](app/services/groq_service.py)
- [app/services/post_processor.py](app/services/post_processor.py)

## Request and Response Shape

### Request

The API expects a `RunbookRequest` payload defined in [app/models/runbook_request.py](app/models/runbook_request.py).

Required fields include:

- `cr_id`
- `title`
- `description`
- `domain`
- `change_type`
- `region`
- `scheduled_start`
- `scheduled_end`
- `rollback_available`
- `business_justification`
- `asset_ids`
- `risk_assessment`

The nested `risk_assessment` object must include:

- `risk_score`
- `risk_level`
- `blast_radius`
- `confidence`
- `recommendations`
- `risk_indicators`

### Response

The route returns a `RunbookOutput` payload defined in [app/models/runbook.py](app/models/runbook.py). The response includes:

- `runbook_id`
- `cr_id`
- `generated_at`
- `title`
- `estimated_duration_mins`
- `risk_notes`
- `steps`
- `generated_by`
- `rag_sources`

## Example Request

```json
{
  "cr_id": "581ee4d5-991d-481f-a386-fa3a0e160696",
  "title": "Core Router Upgrade",
  "description": "Upgrade WAN edge routers from IOS-XE 17.3 to IOS-XE 17.9 with rollback support.",
  "domain": "NETWORK",
  "change_type": "STANDARD",
  "region": "Mumbai",
  "scheduled_start": "2026-05-18T22:00:00",
  "scheduled_end": "2026-05-18T23:30:00",
  "rollback_available": true,
  "business_justification": "Critical firmware patching",
  "asset_ids": ["RTR-CORE-MUM-001", "RTR-CORE-MUM-002"],
  "risk_assessment": {
    "risk_score": 72.89,
    "risk_level": "HIGH",
    "blast_radius": "REGIONAL",
    "confidence": 0.91,
    "recommendations": [
      "Validate rollback readiness",
      "Perform KPI monitoring"
    ],
    "risk_indicators": ["HIGH_CORE_INFRA_EXPOSURE"]
  }
}
```

## Example Response

```json
{
  "runbook_id": "RB-581ee4d5",
  "cr_id": "581ee4d5-991d-481f-a386-fa3a0e160696",
  "generated_at": "2026-05-18T22:05:31.123456",
  "title": "Core Router Upgrade Runbook",
  "estimated_duration_mins": 90,
  "risk_notes": "High criticality routers require staged execution and validation checkpoints.",
  "steps": [
    {
      "step_number": 1,
      "action": "Verify HA sync and capture baseline metrics",
      "expected_output": "Redundancy status is healthy and KPIs are stable",
      "rollback_action": "Abort execution and notify NOC",
      "timeout_seconds": 300
    }
  ],
  "generated_by": "llama-3.3-70b-versatile",
  "rag_sources": [
    {
      "runbook_id": "RB-001",
      "title": "Core Router IOS-XE Upgrade",
      "domain": "NETWORK",
      "change_type": "STANDARD"
    }
  ]
}
```

## Local Setup

### 1. Create and activate a virtual environment

```powershell
cd C:\Users\sweta.singh5\Desktop\capstone\python-agents-icm\runbook-agent
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Create a `.env` file

The current code reads settings from environment variables. A practical starting point is:

```env
APP_NAME=Runbook Agent
APP_PORT=8000
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
KAFKA_BROKERS=localhost:9092
ORCHESTRATOR_URL=http://localhost:8080
CHROMA_DB_DIR=./chroma_db
EMBED_MODEL=all-MiniLM-L6-v2
```

Notes:

- [app/services/embedding_service.py](app/services/embedding_service.py) uses `EMBED_MODEL` if SentenceTransformers is available.
- [app/services/groq_service.py](app/services/groq_service.py) uses the Groq API key and model name.
- [app/core/config.py](app/core/config.py) currently defines the application settings shape used by the codebase.

## Run the Service

Start the FastAPI app with Uvicorn:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Available endpoints:

- `GET http://localhost:8000/health`
- `POST http://localhost:8000/v1/runbooks/generate`
- `GET http://localhost:8000/docs`

## Manual Validation Scripts

The repository includes a few local scripts you can run directly from the `runbook-agent` folder:

- [test_endpoint.py](test_endpoint.py) - sends a sample request to the runbook generation endpoint.
- [test_retrieval.py](test_retrieval.py) - prints retrieved runbook context and source metadata.
- [test_scenarios.py](test_scenarios.py) - runs a fuller end-to-end sample scenario.

## Data Sources

The generated runbooks are grounded in the local data under [data/](data):

- `synthetic_runbooks.csv` - seed runbook examples for retrieval.
- `network_inventory.csv` - asset inventory used for topology and vendor guidance.
- `historical_cr_outcomes.csv` - historical change outcome data.
- `historical_change_requests.csv` - historical change request data.

The vector store is persisted in [chroma_db/](chroma_db), which contains the local ChromaDB SQLite database.

## How Retrieval Works

The retrieval layer uses ChromaDB to find similar runbooks with the same `domain` and `change_type`.

- [app/rag/retriever.py](app/rag/retriever.py) queries the `runbooks` collection.
- [app/rag/context_builder.py](app/rag/context_builder.py) merges retrieved documents into prompt context.
- [app/services/embedding_service.py](app/services/embedding_service.py) generates embeddings with a local fallback if SentenceTransformers is unavailable.

## How Enrichment Works

The generator adds operational context before calling the LLM:

- [app/services/inventory_service.py](app/services/inventory_service.py) maps asset IDs to device details.
- [app/services/topology_service.py](app/services/topology_service.py) creates topology summaries from inventory data.
- [app/services/topology_service.py](app/services/topology_service.py) also emits vendor-specific guidance for Cisco, Juniper, and Nokia assets.
- [app/services/post_processor.py](app/services/post_processor.py) replaces placeholders with asset-specific values.

## LLM Output

The LLM is asked to return valid JSON only. The system prompt in [app/services/groq_service.py](app/services/groq_service.py) emphasizes:

- detailed telecom operational steps
- rollback planning
- validation checkpoints
- KPI monitoring
- escalation conditions
- deterministic operational reasoning

The final response is then normalized and returned by the API.

## Kafka and Integration Notes

The repository also includes Kafka producer and consumer utilities under [app/kafka/](app/kafka/). If you connect this service to an orchestration platform, the runbook generation input can be produced from Kafka and the generated output can be published downstream.

If Kafka is part of your workflow, make sure the broker address in `.env` matches your local or containerized Kafka deployment.

## Troubleshooting

### Embeddings are slow or unavailable

If SentenceTransformers cannot be loaded, [app/services/embedding_service.py](app/services/embedding_service.py) falls back to a deterministic hash-based embedding. That keeps the app usable, but retrieval quality will be lower than with the real model.

### ChromaDB is empty

If the retrieved context is sparse, make sure the `runbooks` collection has been populated and that [chroma_db/chroma.sqlite3](chroma_db/chroma.sqlite3) exists.

### LLM call fails

Check these items first:

- `GROQ_API_KEY` is valid.
- The machine has outbound network access.
- The selected `GROQ_MODEL` is available to your Groq account.

### Asset details are missing

If a change request references unknown asset IDs, [app/services/inventory_service.py](app/services/inventory_service.py) will simply skip them. Add the asset to `data/network_inventory.csv` if you want it to be part of the generated runbook.

### API returns schema errors

Make sure the request body matches [app/models/runbook_request.py](app/models/runbook_request.py), especially the nested `risk_assessment` object.

## Current Implementation Notes

- The active HTTP path is `app/main.py -> app/api/runbook_routes.py -> app/rag/generator.py`.
- There is also a second route module in [app/api/routes.py](app/api/routes.py) that exposes a similar endpoint shape and may be used for experimentation or future refactoring.
- The `Dockerfile` currently contains a placeholder comment, so the recommended local workflow is to run the app directly with Uvicorn.

## Suggested Next Steps

1. Add a proper Dockerfile for the service.
2. Add automated tests for the `/v1/runbooks/generate` endpoint.
3. Add a small ingestion command for seeding ChromaDB from `data/synthetic_runbooks.csv`.
4. Align the environment settings and service naming if you want to standardize the older and newer generation paths.
