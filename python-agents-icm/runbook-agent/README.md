# Runbook Agent — Developer Guide

The **Runbook Agent** is a Python FastAPI service that generates telecom-operational runbooks from change request input. It combines Retrieval-Augmented Generation (RAG), asset inventory enrichment, network topology analysis, and LLM-driven execution planning to produce detailed, actionable runbooks with pre-checks, implementation steps, validation gates, rollback procedures, monitoring notes, and escalation protocols.

## What It Does

**Input:** A structured change request (CR) with domain, change type, assets, risk assessment, and scheduling info

**Output:** A detailed operational runbook (JSON) with:
- Pre-flight checks (verify asset state, capture baseline metrics)
- Step-by-step execution plan (implementation procedures, expected outcomes)
- Validation gates (success criteria, monitoring queries)
- Rollback procedures (undo steps, recovery procedures)
- Monitoring & escalation (KPI tracking, SLA alerts, escalation contacts)
- Historical sources (which runbooks were retrieved and influenced the generation)

**Architecture:**
1. **Embedding** — Convert incoming CR metadata to vector using sentence-transformers
2. **Retrieval** — Query ChromaDB for similar historical runbooks (same domain + change_type)
3. **Enrichment** — Load asset details, topology context, vendor-specific guidance
4. **LLM Generation** — Call Groq LLaMA-2 with enriched prompt to generate structured JSON
5. **Post-Processing** — Cleanup placeholders, validate schema, return runbook

## Repository Layout

```
runbook-agent/
├── app/                              # FastAPI application
│   ├── main.py                      # FastAPI entrypoint, CORS config, router setup
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py                # Generic routes (if any)
│   │   └── runbook_routes.py        # Runbook generation endpoint POST /v1/runbooks/generate
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py                # Settings (Pydantic BaseSettings)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── runbook_request.py       # RunbookRequest schema (request body)
│   │   ├── runbook_response.py      # RunbookOutput schema (response)
│   │   └── runbook.py               # Runbook models (RunbookStep, etc.)
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── ingest_runbooks.py       # Script to load CSV into ChromaDB
│   │   ├── context_builder.py       # Merges CR + retrieved runbooks + enrichment
│   │   ├── generator.py             # Orchestrates full RAG pipeline
│   │   └── retriever.py             # ChromaDB query logic
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chroma_service.py        # ChromaDB client & initialization
│   │   ├── claude_service.py        # (Optional) Claude API integration
│   │   ├── embedding_service.py     # Embedding generation (sentence-transformers or fallback)
│   │   ├── grok_service.py          # (Optional) Grok API integration
│   │   ├── groq_service.py          # Groq LLM integration (primary)
│   │   ├── inventory_service.py     # Load network_inventory.csv for asset context
│   │   ├── orchestrator_service.py  # (Optional) External orchestration integration
│   │   ├── post_processor.py        # Cleanup, placeholder replacement, validation
│   │   └── ... (other service stubs)
│   ├── kafka/
│   │   ├── __init__.py
│   │   ├── consumer.py              # Kafka consumer (if event-driven)
│   │   └── producer.py              # Kafka producer (if publishing runbooks)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py                # Structured logging
│   │   └── ... (helper utilities)
│   └── __init__.py
├── data/                            # CSV data sources
│   ├── synthetic_runbooks.csv       # Runbook examples for retrieval (seeding ChromaDB)
│   ├── network_inventory.csv        # Asset metadata (hostname, vendor, OS, criticality)
│   ├── historical_change_requests.csv  # Historical CR metadata
│   └── historical_cr_outcomes.csv   # Historical CR outcomes
├── chroma_db/                       # ChromaDB persistence (SQLite-backed)
│   ├── chroma.sqlite3               # Vector store database
│   └── [uuid]/                      # Collections data
├── test_endpoint.py                 # Manual smoke test of /v1/runbooks/generate
├── test_retrieval.py                # Test retrieval logic only
├── test_scenarios.py                # End-to-end scenario test
├── Dockerfile                       # Container build (placeholder)
├── requirements.txt                 # Python dependencies
└── README.md                        # This file
```

## Key Capabilities

| Feature | Details |
|---------|---------|
| **RAG-powered Generation** | ChromaDB retrieval + LLM prompt engineering |
| **Asset Enrichment** | Load vendor, OS, criticality, region from CSV |
| **Topology Analysis** | Identify critical paths, redundancy, regional dependencies |
| **Vendor-Aware Guidance** | Generate OS/vendor-specific pre-checks and commands |
| **Placeholder Cleanup** | Replace `[VENDOR]` → `Cisco`, `[OS]` → `IOS-XE 17.9`, etc. |
| **Schema Validation** | Pydantic + JSON schema validation |
| **Multiple LLM Backends** | Groq (primary), Claude (optional), Grok (optional) |
| **Historical Source Tracking** | Return which runbooks influenced generation |
| **FastAPI + OpenAPI** | Swagger UI at `/docs`; interactive testing |
| **CORS-enabled** | Ready for React frontend integration |
| **Structured Logging** | Correlation IDs, request/response logging |

## API Flow

### Main Endpoint

**Endpoint:** `POST /v1/runbooks/generate`

**Implementation:** [app/api/runbook_routes.py](app/api/runbook_routes.py)

**Processing Pipeline:**
```
POST /v1/runbooks/generate (RunbookRequest)
    ↓
[app/rag/generator.py] — Main orchestrator
    ↓
[app/services/embedding_service.py] — Embed CR
    ↓
[app/rag/retriever.py] — Query ChromaDB
    ↓
[app/rag/context_builder.py] — Merge contexts
    ↓
[app/services/inventory_service.py] — Load assets
    ↓
[app/services/topology_service.py] — Build topology context
    ↓
[app/services/groq_service.py] — Call LLM
    ↓
[app/services/post_processor.py] — Cleanup & validate
    ↓
RunbookOutput (JSON)
```

## Setup Instructions

### Prerequisites
- **Python 3.10+** (virtualenv recommended)
- **Groq API Key** (free tier at [groq.com](https://groq.com))
- **SentenceTransformers** (optional, for embeddings; fallback available)
- **Network access** to Groq API

### Step 1: Environment Setup

```powershell
cd runbook-agent

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Activate (Linux/Mac)
# source venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Key dependencies:**
- `fastapi`, `uvicorn` — REST framework
- `pydantic` — Data validation
- `chromadb` — Vector store (RAG)
- `sentence-transformers` — Embedding generation
- `groq` — LLM integration
- `pandas` — CSV handling
- `python-dotenv` — Environment variables
- `kafka-python` — (Optional) Kafka integration

### Step 3: Configure Environment

Create `.env` file in `runbook-agent/`:

```env
# API Configuration
APP_NAME=Runbook Generation Agent
APP_PORT=8101

# LLM Configuration
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# ChromaDB Configuration
CHROMA_DB_DIR=./chroma_db

# Embedding Model
EMBED_MODEL=all-MiniLM-L6-v2

# Kafka (optional)
KAFKA_BROKERS=localhost:9092

# Orchestrator Integration (optional)
ORCHESTRATOR_URL=http://localhost:8080

# Logging
LOG_LEVEL=INFO
DEBUG=false
```

### Step 4: Seed ChromaDB

On first startup, ChromaDB is automatically initialized. To manually seed with runbook examples:

```powershell
python -m app.rag.ingest_runbooks
```

This:
- Reads `data/synthetic_runbooks.csv`
- Creates embeddings for each runbook
- Stores in ChromaDB (`chroma_db/`)
- Indexes by domain + change_type

### Step 5: Verify Setup

```bash
# Check API is running
curl http://localhost:8101/health

# View Swagger UI
http://localhost:8101/docs
```

---

## Running the Service

### Mode 1: Development (with auto-reload)

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8101
```

### Mode 2: Production

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8101 --workers 4
```

### Mode 3: Direct Python

```powershell
python app/main.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8101 (Press CTRL+C to quit)
```

---

## API Endpoints & Schemas

### 1. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy"
}
```

### 2. Runbook Generation

**Endpoint:** `POST /v1/runbooks/generate`

**Request Schema** (RunbookRequest):

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
  "business_justification": "Critical firmware patching to fix BGP route propagation bug",
  "asset_ids": ["RTR-CORE-MUM-001", "RTR-CORE-MUM-002"],
  "risk_assessment": {
    "risk_score": 72.89,
    "risk_level": "HIGH",
    "blast_radius": "REGIONAL",
    "confidence": 0.91,
    "recommendations": [
      "Validate rollback readiness",
      "Perform KPI monitoring",
      "Have network team on standby"
    ],
    "risk_indicators": ["HIGH_CORE_INFRA_EXPOSURE", "INTERNET_FACING"]
  }
}
```

**Response Schema** (RunbookOutput):
```json
{
  "runbook_id": "RB-581ee4d5",
  "cr_id": "581ee4d5-991d-481f-a386-fa3a0e160696",
  "generated_at": "2026-05-18T22:05:31.123456",
  "title": "Core Router Upgrade Runbook",
  "estimated_duration_mins": 90,
  "risk_notes": "High criticality routers require staged execution and validation checkpoints.",
  "pre_checks": [
    {
      "check_number": 1,
      "description": "Verify HA sync on RTR-CORE-MUM-001",
      "expected_output": "Primary/Secondary sync status is healthy",
      "validation_query": "show redundancy states"
    },
    {
      "check_number": 2,
      "description": "Capture baseline BGP route count",
      "expected_output": "BGP table has normal number of routes",
      "validation_query": "show ip bgp summary"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "action": "Stage IOS-XE 17.9 image on both routers",
      "commands": [
        "copy tftp://[TFTP_SERVER]/cat9k_iosxe.17.09.04.SPA.bin bootflash:",
        "verify /md5 bootflash:cat9k_iosxe.17.09.04.SPA.bin 1a2b3c4d5e6f7g8h9i0j..."
      ],
      "expected_output": "Image file verified, free space available",
      "timeout_seconds": 600,
      "rollback_action": "Delete staged image, verify space freed"
    },
    {
      "step_number": 2,
      "action": "Set boot image and perform in-place upgrade on primary",
      "commands": [
        "configure terminal",
        "boot system bootflash:cat9k_iosxe.17.09.04.SPA.bin",
        "end",
        "copy running-config startup-config",
        "reload"
      ],
      "expected_output": "Device boots successfully with new image",
      "timeout_seconds": 900,
      "rollback_action": "Boot from backup image: boot system bootflash:cat9k_iosxe.17.03.06.SPA.bin"
    },
    {
      "step_number": 3,
      "action": "Verify primary router health",
      "commands": [
        "show version",
        "show processes cpu",
        "show interfaces summary"
      ],
      "expected_output": "IOS-XE 17.9.4 running; CPU < 80%; all interfaces up",
      "timeout_seconds": 300,
      "rollback_action": "Reload to previous image"
    }
  ],
  "validation": [
    {
      "validation_number": 1,
      "name": "BGP Convergence",
      "query": "show ip bgp summary",
      "success_criteria": "All BGP peers established; received/sent routes match expected"
    },
    {
      "validation_number": 2,
      "name": "Traffic Flow",
      "query": "show policy-map interface",
      "success_criteria": "Traffic flowing through expected paths; no packet loss"
    }
  ],
  "rollback_procedure": [
    {
      "step_number": 1,
      "description": "Boot from previous image",
      "commands": [
        "configure terminal",
        "boot system bootflash:cat9k_iosxe.17.03.06.SPA.bin",
        "end",
        "copy running-config startup-config",
        "reload"
      ]
    },
    {
      "step_number": 2,
      "description": "Verify restoration",
      "commands": ["show version", "show ip bgp summary"],
      "expected_output": "IOS-XE 17.3.6 running; BGP converged"
    }
  ],
  "monitoring": {
    "kpis_to_track": [
      "BGP route count (delta < 5%)",
      "CPU utilization (< 80%)",
      "Memory usage (< 85%)",
      "Interface error rates (< 0.1%)"
    ],
    "monitoring_frequency_seconds": 30,
    "sla_threshold_minutes": 15,
    "escalation_triggers": [
      "If BGP routes drop >10%",
      "If CPU exceeds 90% for >2 minutes",
      "If packet loss detected"
    ]
  },
  "escalation": {
    "level_1": "Network Operations Center (NOC): +1-555-0100",
    "level_2": "Network Engineering: network-eng@company.com",
    "level_3": "On-call Director: +1-555-0200"
  },
  "generated_by": "llama-3.3-70b-versatile",
  "rag_sources": [
    {
      "runbook_id": "RB-001",
      "title": "Cisco IOS-XE Router Upgrade (Standard Process)",
      "domain": "NETWORK",
      "change_type": "STANDARD",
      "similarity_score": 0.94
    },
    {
      "runbook_id": "RB-042",
      "title": "BGP Route Propagation Fix on Core Routers",
      "domain": "NETWORK",
      "change_type": "HOTFIX",
      "similarity_score": 0.87
    }
  ]
}
```

**Response Status Codes:**
- `200 OK` — Runbook generated successfully
- `400 Bad Request` — Invalid request schema (missing required fields)
- `500 Internal Server Error` — LLM call failed, ChromaDB error, or other internal issue

---

## Manual Validation Scripts

The repository includes helper scripts for testing:

### 1. Test Endpoint

```powershell
python test_endpoint.py
```

Sends a sample RunbookRequest to `/v1/runbooks/generate`; prints response.

### 2. Test Retrieval

```powershell
python test_retrieval.py
```

Tests retrieval logic without LLM; shows what runbooks are retrieved for a sample CR.

### 3. Test Scenarios

```powershell
python test_scenarios.py
```

Runs a fuller end-to-end scenario with multiple CR types; validates response schemas.

---

## Data Sources & Enrichment

### CSV Data Files

All data is stored in `data/`:

| File | Purpose | Used By |
|------|---------|---------|
| `synthetic_runbooks.csv` | Runbook examples for RAG retrieval | ChromaDB seeding |
| `network_inventory.csv` | Asset metadata (hostname, vendor, OS, criticality, region) | Asset enrichment service |
| `historical_change_requests.csv` | Historical CR metadata | Context building |
| `historical_cr_outcomes.csv` | Historical CR outcomes (success/rollback/incident) | Analytics (optional) |

### How Retrieval Works

[app/rag/retriever.py](app/rag/retriever.py):
1. Receives embedding of incoming CR (title + description + domain + change_type)
2. Queries ChromaDB collection `runbooks` for top-K similar docs (K=3-5)
3. Filters by domain + change_type match
4. Returns list of runbooks with metadata & similarity scores

### How Enrichment Works

[app/services/inventory_service.py](app/services/inventory_service.py):
1. Loads `data/network_inventory.csv`
2. Looks up each asset_id from the CR
3. Returns vendor, OS, region, criticality, redundancy info
4. Merged into LLM prompt context

[app/services/topology_service.py](app/services/topology_service.py):
1. Analyzes network dependencies from inventory metadata
2. Computes regional dependencies, critical path analysis
3. Generates vendor-specific guidance (e.g., "Cisco ASR requires graceful shutdown before upgrade")
4. Returns topology context for LLM

---

## LLM Configuration

### Groq API

Default model: `llama-3.3-70b-versatile`

To change the model, edit [app/services/groq_service.py](app/services/groq_service.py):

```python
LLM_MODEL = "mixtral-8x7b-32768"  # Faster, good balance
# or
LLM_MODEL = "llama-2-70b-chat"    # Larger, more accurate
```

### Other LLM Providers (Optional)

Stubs exist for Claude and Grok in `app/services/`. To enable:
1. Install provider SDK (e.g., `pip install anthropic`)
2. Edit [app/services/claude_service.py](app/services/claude_service.py) with API key & model
3. Update generator.py to use alternative service

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'sentence_transformers'` | Dependency not installed | Run `pip install sentence-transformers` |
| `chromadb.errors.InvalidCollectionException` | ChromaDB not initialized | Run `python -m app.rag.ingest_runbooks` to seed |
| `GroqAPIKeyError` | Missing or invalid API key | Set `GROQ_API_KEY` in `.env` file |
| `JSON decode error from LLM` | LLM returned malformed JSON | Post-processor has fallback; check logs for details |
| `No similar runbooks found` | Retrieval returned zero results | Check domain/change_type in synthetic_runbooks.csv; may need more examples |
| `Asset not found in inventory` | asset_ids don't match inventory | Verify asset_ids exist in network_inventory.csv |
| `CORS error from frontend` | CORS not enabled | CORS is enabled in main.py; check frontend origin in allow_origins |

---

## Performance Notes

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| **API latency** | 3-10s | Dominated by LLM call (1-3s); retrieval <100ms; enrichment <200ms |
| **Throughput** | 5-10 runbooks/min | Single process; horizontally scalable with load balancer |
| **Memory usage** | ~800MB | Includes: ChromaDB in-memory cache, embedding model, LLM client connection |
| **ChromaDB latency** | <100ms | Local SQLite-backed store; no network latency |
| **Embedding generation** | 50-200ms | sentence-transformers or fallback |
| **LLM call** | 1-3s | Groq API call; network-dependent |
| **Post-processing** | <100ms | Placeholder cleanup & JSON validation |

---

## Integration with Risk Assessment Agent

After risk assessment completes (see [../risk-assessment/README.md](../risk-assessment/README.md)), downstream systems can:

1. Subscribe to Kafka topic `ai.risk.completed`
2. Extract risk assessment (risk_score, risk_level, blast_radius, recommendations)
3. Use as context for runbook generation

Example flow:
```
Risk Assessment Agent publishes to ai.risk.completed
    ↓
Runbook Agent subscribes to ai.risk.completed
    ↓
Runbook Agent receives: { risk_score: 72, risk_level: "HIGH", blast_radius: "REGIONAL", ... }
    ↓
Runbook Agent embeds the CR, retrieves similar runbooks, enriches with risk context
    ↓
LLM generates runbook with extra care for risk mitigations
    ↓
Runbook published to operational team (UI, Kafka, email, etc.)
```

---

## Common Tasks

### Generate Runbook (REST API)

The generator adds operational context before calling the LLM:

- [app/services/inventory_service.py](app/services/inventory_service.py) maps asset IDs to device details.
- [app/services/topology_service.py](app/services/topology_service.py) creates topology summaries from inventory data.
- [app/services/topology_service.py](app/services/topology_service.py) also emits vendor-specific guidance for Cisco, Juniper, and Nokia assets.
- [app/services/post_processor.py](app/services/post_processor.py) replaces placeholders with asset-specific values.

---

## Advanced Usage

### Check Service Health

```bash
curl http://localhost:8101/health
```

### Generate Runbook (REST API)

```bash
curl -X POST "http://localhost:8101/v1/runbooks/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "cr_id": "CR-001",
    "title": "Router Upgrade",
    "description": "Upgrade IOS-XE version",
    "domain": "NETWORK",
    "change_type": "STANDARD",
    "region": "US-EAST-1",
    "scheduled_start": "2026-05-20T02:00:00",
    "scheduled_end": "2026-05-20T03:30:00",
    "rollback_available": true,
    "business_justification": "Bug fix",
    "asset_ids": ["RTR-CORE-001"],
    "risk_assessment": {
      "risk_score": 65.0,
      "risk_level": "MEDIUM",
      "blast_radius": "REGIONAL",
      "confidence": 0.85,
      "recommendations": ["Schedule during maintenance", "Have team on standby"],
      "risk_indicators": ["CORE_INFRASTRUCTURE"]
    }
  }'
```

### View API Documentation

```
http://localhost:8101/docs
```

Interactive Swagger UI for testing endpoints directly in browser.

---

## Advanced Configuration

### Disable SentenceTransformers Fallback

If you want to require SentenceTransformers:

In [app/services/embedding_service.py](app/services/embedding_service.py):
```python
REQUIRE_SENTENCE_TRANSFORMERS = True
```

If SentenceTransformers is not available, an exception will be raised (instead of using fallback).

### Increase ChromaDB Collection Retention

For larger runbook corpora, adjust collection settings in [app/services/chroma_service.py](app/services/chroma_service.py):

```python
COLLECTION_METADATA = {
    "hnsw:space": "cosine",
    "hnsw:batch_size": 100,
    "hnsw:ef_construction": 200,
    "hnsw:ef": 10,
}
```

### Custom Prompt Templates

Edit [app/rag/context_builder.py](app/rag/context_builder.py) to customize LLM prompt:

```python
LLM_SYSTEM_PROMPT = """You are an expert network operations runbook generator...
[customize instructions, examples, constraints]
"""
```

---

## Production Checklist

- [ ] Replace hardcoded paths with environment variables
- [ ] Enable request authentication (API key or OAuth2)
- [ ] Add rate limiting (e.g., FastAPI slowdown middleware)
- [ ] Enable request/response logging with correlation IDs
- [ ] Monitor LLM API costs; implement usage tracking
- [ ] Set up alerting for LLM API failures
- [ ] Implement graceful degradation (cached runbooks as fallback)
- [ ] Add metrics collection (Prometheus endpoint)
- [ ] Set up health check monitoring (e.g., every 30s)
- [ ] Implement request queuing for high load scenarios
- [ ] Add data retention policy for generated runbooks
- [ ] Backup ChromaDB regularly

---

## Next Steps

- [ ] Fine-tune LLM prompts based on operator feedback
- [ ] Add support for additional domains (database, application, security)
- [ ] Implement runbook versioning & approval workflow
- [ ] Add integration with incident management systems
- [ ] Implement closed-loop feedback (capture actual execution outcomes)
- [ ] Create UI for runbook review & approval
- [ ] Add support for runbook templates & reusable modules
- [ ] Implement cost optimization analysis (recommend cheapest execution windows)
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
