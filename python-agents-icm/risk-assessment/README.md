# Risk Assessment Agent — Developer Guide

## Overview

The **Risk Assessment Agent** is a Python-based microservice that consumes change request events from orchestration systems, enriches them with network topology and historical intelligence, predicts operational risk using trained XGBoost models, generates grounded LLM explanations via Groq, persists assessments to MySQL, and publishes standardized assessment events back to the enterprise event bus (Kafka).

### Key Capabilities
- **Contract-first Kafka integration** — JSON + Pydantic models for strict event validation (`contracts/`)
- **Multi-engine intelligence** — Feature engineering, topology analysis, historical similarity, and calibration
- **ML-powered risk scoring** — XGBoost regressor (risk_score: 0-100) + classifier (risk_level: LOW/MEDIUM/HIGH/CRITICAL)
- **LLM-grounded reasoning** — Groq LLaMA-2 with defensive JSON parsing for human-readable narratives
- **Transactional persistence** — MySQL ORM with audit trails and grounding evidence storage
- **Robust error handling** — Dead-letter queue (DLQ) for invalid/failed events; detailed logging
- **REST API** — FastAPI endpoint for synchronous risk analysis and health checks
- **Production-ready** — Retry logic, connection pooling, structured logging, model versioning

---

## Repository Layout & Module Guide

```
risk-assessment/
├── agent/                         # FastAPI app & routes
│   ├── main.py                   # FastAPI entrypoint, endpoints, request models
│   └── response_builder.py       # Merges predictions + LLM reasoning into RiskAssessmentEvent
├── config/
│   └── settings.py               # Environment variables & app settings (AppSettings dataclass)
├── contracts/                     # Kafka event schemas (Pydantic models)
│   ├── models.py                 # ChangeRequestEvent, RiskAssessmentEvent (contracts)
│   ├── change_request_event.json # Sample ChangeRequestEvent
│   └── risk_assessment_event.json# Sample RiskAssessmentEvent
├── data/                          # CSV training & enrichment data
│   ├── historical_change_requests.csv    # CR metadata for training
│   ├── historical_cr_assets.csv          # Asset mappings & criticality
│   ├── historical_cr_outcomes.csv        # Ground truth (success/rollback/outage)
│   ├── historical_risk_assessments.csv   # Pre-computed risk baselines
│   └── network_inventory.csv             # Topology & device metadata
├── intelligence/                  # Context & feature enrichment engines
│   ├── calibration_engine.py     # Confidence scoring & thresholds
│   ├── context_builder.py        # Loads data, computes historical metrics
│   ├── feature_engine.py         # Extracts ML features from context
│   ├── historical_engine.py      # Similarity matching with past changes
│   ├── similarity_engine.py      # Semantic similarity scoring
│   └── topology_engine.py        # Network topology analysis & blast radius
├── llm/                           # LLM integration (Groq)
│   ├── client.py                 # Groq API wrapper
│   ├── grounded_reasoner.py      # Reasoning prompt builder & response parsing
│   └── prompt_builder.py         # Templates for LLM reasoning
├── ml/                            # ML pipeline (feature engineering, training, inference)
│   ├── feature_schema.py         # Feature definitions & scaling
│   ├── predictor.py              # XGBoost inference (regressor + classifier)
│   └── trainer.py                # Training pipeline (run locally for model updates)
├── models/                        # Persisted trained model artifacts (pickle)
│   ├── risk_regressor.pkl        # XGBoost regressor (risk_score)
│   ├── risk_classifier.pkl       # XGBoost classifier (risk_level)
│   ├── feature_names.pkl         # Feature name mapping
│   └── risk_label_mapping.pkl    # Risk level label encoding
├── messaging/                     # Kafka producers/consumers
│   ├── consumer.py               # Listens to change-requests topic; runs full pipeline
│   ├── dlq_listener.py           # Monitors risk-assessments-dlq
│   └── producer.py               # Publishes RiskAssessmentEvent
├── persistence/                   # MySQL ORM & database schema
│   ├── db.py                     # SQLAlchemy engine & session factory
│   ├── init_db.py                # Schema initialization script
│   ├── models.py                 # SQLAlchemy ORM models (RiskAssessment, GroundingEvidence)
│   └── repository.py             # CRUD operations for assessments
├── requirements.txt              # Python dependencies
├── docker-compose.yml            # Kafka + Zookeeper services
└── README.md                      # This file
```

## Key Modules & Responsibilities

### 1. Agent (`agent/main.py`)
- **FastAPI app** with OpenAPI docs at `/docs`
- **Endpoints**:
  - `GET /health` — Service health check
  - `POST /analyze` — Synchronous risk analysis (REST API)
- **Request models**: AnalyzeRequest (Pydantic)
- **Response format**: RiskAssessmentEvent (see contracts)

### 2. Configuration (`config/settings.py`)
- Reads environment variables (`.env` file or system env)
- Defines AppSettings (database URL, Kafka brokers, Groq API key, model path, etc.)
- Instantiated as a singleton: `settings = AppSettings()`

### 3. Contracts (`contracts/`)
- **ChangeRequestEvent** (input): domain, change_type, region, asset_count, duration_minutes, etc.
- **RiskAssessmentEvent** (output): risk_score, risk_level, blast_radius, confidence, reasoning, grounding_evidence
- Enables schema validation and communication with upstream/downstream systems

### 4. Intelligence (`intelligence/`)
- **context_builder.py**: Orchestrates all context engines; loads CSV data and computes enrichment
- **feature_engine.py**: Extracts 20+ features from context (e.g., asset_count, internet_facing_ratio, core_asset_ratio)
- **topology_engine.py**: Computes blast radius (MINIMAL/LOCAL/REGIONAL/GLOBAL) based on network dependencies
- **similarity_engine.py**: Finds past changes most similar to the incoming CR (feature-space nearest neighbors)
- **historical_engine.py**: Computes grounding evidence (# similar changes, # with outages, # rolled back)
- **calibration_engine.py**: Adjusts confidence scores based on signal strength

### 5. ML (`ml/`)
- **feature_schema.py**: Defines 20+ features; handles scaling, normalization, feature name mapping
- **predictor.py**: Loads trained models (`.pkl` files); runs inference on feature vectors
  - Returns: risk_score (0-100), risk_level (LOW/MEDIUM/HIGH/CRITICAL), confidence (0.0-1.0)
- **trainer.py**: Full training pipeline (run locally with historical data to retrain models)

### 6. LLM (`llm/`)
- **client.py**: Thin wrapper around Groq API (handles retries, error handling)
- **grounded_reasoner.py**: 
  - Accepts risk predictions + grounding evidence
  - Calls LLM with structured prompt (see prompt_builder.py)
  - Parses JSON response defensively (fallback to safe defaults if LLM produces invalid JSON)
  - Returns: executive_summary, technical_analysis, cab_guidance, recommendations
- **prompt_builder.py**: Templates for LLM prompts (context-aware reasoning instructions)

### 7. Messaging (`messaging/`)
- **consumer.py**: Kafka consumer for `change-requests` topic
  - Validates ChangeRequestEvent (Pydantic)
  - Runs full pipeline: context → features → prediction → LLM → persistence → publish
  - On error: publishes to DLQ with error details
- **producer.py**: Kafka producer for `ai.risk.completed` topic
  - Publishes RiskAssessmentEvent (validated Pydantic)
- **dlq_listener.py**: Monitors `risk-assessments-dlq` for failed events (for debugging)

### 8. Persistence (`persistence/`)
- **db.py**: SQLAlchemy engine factory; connection pooling; session management
- **models.py**: ORM models
  - `RiskAssessment`: id, cr_id, risk_score, risk_level, blast_radius, confidence, executive_summary, technical_analysis, cab_guidance, recommendations, grounding_evidence_id, created_at, updated_at
  - `GroundingEvidence`: similar_changes_analyzed, with_outages, with_rollbacks, failed, created_at
  - `EventAudit`: event_id, event_type, correlation_id, payload, created_at
- **repository.py**: CRUD operations (save_assessment, get_assessment, get_recent_assessments, etc.)
- **init_db.py**: Creates database schema; run once at setup: `python -m risk-assessment.persistence.init_db`

---

## Setup Instructions

### Prerequisites
- **Python 3.10+** (virtualenv recommended)
- **MySQL 8.0+** (local, Docker, or managed cloud instance)
- **Docker & Docker Compose** (for Kafka + Zookeeper)
- **Groq API Key** (free tier at [groq.com](https://groq.com))
- **Network access** to Groq API and Kafka broker

### Step 1: Environment Setup

```powershell
# Navigate to risk-assessment directory
cd risk-assessment

# Create Python virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# On Linux/Mac:
# source venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Configure Environment

Create `.env` file in `risk-assessment/` directory:

```env
# API Configuration
APP_NAME=ICM Risk Intelligence Agent
APP_PORT=9010

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
CHANGE_REQUEST_TOPIC=change-requests
RISK_ASSESSMENT_TOPIC=ai.risk.completed
DLQ_TOPIC=risk-assessments-dlq

# Database Configuration
MYSQL_URL=mysql+pymysql://root:root@localhost:3306/icm_risk_db

# LLM Configuration (Groq)
GROQ_API_KEY=gsk_your_actual_key_here

# Model Path
MODEL_PATH=./models

# Feature Engineering
ENABLE_TOPOLOGY_FEATURES=true
ENABLE_HISTORICAL_FEATURES=true

# Logging
LOG_LEVEL=INFO
```

### Step 4: Database Setup

```powershell
# Option A: Use Docker (recommended for local dev)
docker run --name mysql_icm -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0

# Option B: Use existing MySQL instance
# Update MYSQL_URL in .env accordingly

# Initialize database schema
python -m risk-assessment.persistence.init_db
```

This creates:
- `icm_risk_db` database
- `risk_assessments` table (main assessment records)
- `grounding_evidence` table (historical evidence)
- `event_audit` table (audit trail)

### Step 5: Start Kafka (for event-driven mode)

```powershell
docker-compose up -d

# Verify services are running
docker-compose ps

# View Kafka logs
docker-compose logs -f kafka
```

---

## Running the Service

### Mode 1: REST API (Synchronous Analysis)

```powershell
python -m risk-assessment.agent.main
```

Output:
```
INFO:     Uvicorn running on http://127.0.0.1:9010 (Press CTRL+C to quit)
```

**Available endpoints:**
- `GET http://localhost:9010/health` — Health check
- `POST http://localhost:9010/analyze` — Risk analysis
- `GET http://localhost:9010/docs` — Swagger UI

Example request:
```bash
curl -X POST "http://localhost:9010/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "NETWORK",
    "change_type": "CONFIG_UPDATE",
    "region": "US-EAST-1",
    "asset_count": 5,
    "duration_minutes": 30,
    "is_peak_hours": false,
    "is_weekend": false,
    "rollback_available": true,
    "has_core_asset": true,
    "any_internet_facing": true,
    "all_assets_redundant": false,
    "max_asset_criticality": "HIGH",
    "asset_ids": ["ASSET-001", "ASSET-002", "ASSET-003"]
  }'
```

### Mode 2: Kafka Event Stream (Asynchronous)

Terminal 1 — Start API server:
```powershell
python -m risk-assessment.agent.main
```

Terminal 2 — Start Kafka consumer:
```powershell
python -m messaging.consumer
```

This service:
- Listens to `change-requests` topic
- Validates events (ChangeRequestEvent schema)
- Runs full analysis pipeline
- Persists to MySQL
- Publishes results to `ai.risk.completed` topic
- On error: publishes to `risk-assessments-dlq` (dead-letter queue)

### Mode 3: Monitor Dead-Letter Queue

Terminal 3 — Watch for failed events:
```powershell
python -m risk-assessment.messaging.dlq_listener
```

This helps debug:
- Invalid event schemas
- Processing failures
- Corrupted messages

---

## API Endpoints & Contracts

### 1. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "UP",
  "service": "ICM Risk Intelligence Agent",
  "version": "3.0.0"
}
```

### 2. Synchronous Risk Analysis

**Endpoint:** `POST /analyze`

**Request Schema** (AnalyzeRequest):
```json
{
  "domain": "NETWORK",                      // Change domain (NETWORK, DATABASE, APPLICATION, SECURITY, etc.)
  "change_type": "CONFIG_UPDATE",           // Type (CONFIG_UPDATE, VERSION_UPGRADE, HOTFIX, etc.)
  "region": "US-EAST-1",                    // Geographic region
  "asset_count": 5,                         // Number of affected assets
  "duration_minutes": 30,                   // Estimated change duration
  "is_peak_hours": false,                   // Whether change is during peak traffic
  "is_weekend": false,                      // Whether change is on weekend
  "rollback_available": true,               // Can rollback if needed
  "has_core_asset": true,                   // Change affects core infrastructure
  "any_internet_facing": true,              // Any affected assets are public-facing
  "all_assets_redundant": false,            // Are all affected assets redundant?
  "max_asset_criticality": "HIGH",          // Highest criticality level (LOW, MEDIUM, HIGH, CRITICAL)
  "asset_ids": ["ASSET-001", "ASSET-002", "ASSET-003"]  // Specific assets
}
```

**Response Schema** (RiskAssessmentEvent):
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "cr_id": null,
  "risk_score": 65.5,                       // 0-100 continuous score
  "risk_level": "MEDIUM",                   // LOW, MEDIUM, HIGH, CRITICAL
  "blast_radius": "REGIONAL",               // MINIMAL, LOCAL, REGIONAL, GLOBAL
  "confidence": 0.85,                       // 0.0-1.0 confidence in prediction
  "executive_summary": "This change carries moderate risk...",
  "technical_analysis": "The configuration change affects 5 assets...",
  "cab_guidance": "Recommend scheduling during maintenance window...",
  "recommendations": [
    "Execute during low-traffic window",
    "Pre-stage rollback configuration",
    "Monitor BGP changes during execution",
    "Have network team on standby"
  ],
  "risk_indicators": [                      // Risk flags
    "HIGH_CRITICALITY",
    "INTERNET_FACING",
    "REGIONAL_IMPACT"
  ],
  "grounding_evidence": {                   // Historical evidence
    "similar_changes_analyzed": 12,
    "similar_changes_with_outages": 2,
    "similar_changes_with_rollbacks": 3,
    "similar_changes_failed": 1
  },
  "model_metadata": {
    "prediction_engine": "XGBoost",
    "reasoning_engine": "Groq-LLaMA-2",
    "grounding_enabled": true
  },
  "generated_at": "2026-05-13T14:23:45.123456"
}
```

**Query Parameters:**
- `debug=true` (optional) — Returns additional model prediction details

### 3. Kafka: Change Request Event (Consumer)

**Topic:** `change-requests`

**Message Schema** (ChangeRequestEvent):
```json
{
  "cr_id": "CR-2026-001234",
  "title": "Update BGP Route Filters",
  "description": "Modify route filters on core routers to optimize traffic flow",
  "domain": "NETWORK",
  "change_type": "CONFIG_UPDATE",
  "region": "US-EAST-1",
  "scheduled_start": "2026-05-15T02:00:00Z",
  "scheduled_end": "2026-05-15T02:30:00Z",
  "rollback_available": true,
  "business_justification": "Performance optimization for peak hour traffic",
  "asset_count": 5,
  "is_peak_hours": false,
  "is_weekend": false,
  "duration_minutes": 30,
  "has_core_asset": true,
  "any_internet_facing": true,
  "all_assets_redundant": false,
  "max_asset_criticality": "HIGH",
  "asset_ids": ["CR-ASSET-001", "CR-ASSET-002", "CR-ASSET-003", "CR-ASSET-004", "CR-ASSET-005"]
}
```

### 4. Kafka: Risk Assessment Event (Producer)

**Topic:** `ai.risk.completed`

**Message Schema:** Same as `/analyze` response (see above)

### 5. Kafka: Dead-Letter Queue

**Topic:** `risk-assessments-dlq`

**Error Message Format:**
```json
{
  "original_event": {
    "cr_id": "CR-2026-001234",
    "domain": "NETWORK",
    ...
  },
  "error": {
    "error_type": "ValidationError",
    "error_message": "ChangeRequestEvent validation failed - missing required field 'asset_ids'",
    "timestamp": "2026-05-15T02:05:00.123456Z",
    "correlation_id": "corr-12345"
  }
}
```

---

## Training & Model Updates

### Model Files
Trained XGBoost models are persisted in `models/`:
- `risk_regressor.pkl` — Continuous risk score (0-100)
- `risk_classifier.pkl` — Risk level classification (LOW/MEDIUM/HIGH/CRITICAL)
- `feature_names.pkl` — Feature name mapping for consistency
- `risk_label_mapping.pkl` — Label encoding (class index → label name)

### Retraining Locally
To retrain models with updated historical data:

```powershell
# 1. Update CSV files in data/
cp ../shared-data/historical_change_requests.csv data/
cp ../shared-data/historical_cr_outcomes.csv data/

# 2. Run training pipeline
python -m risk-assessment.ml.trainer --output_dir ./models

# 3. Validate on holdout set
python -m risk-assessment.ml.trainer --validate_only
```

**Trainer outputs:**
- Trained model artifacts (`.pkl` files) → `models/`
- Training metrics (accuracy, AUC-ROC, precision/recall)
- Feature importance scores

---

## Common Tasks

### Check Service Health
```bash
curl http://localhost:9010/health
```

### Analyze a Change Request (REST)
```bash
curl -X POST "http://localhost:9010/analyze" \
  -H "Content-Type: application/json" \
  -d @sample_cr.json  # See API section above
```

### View API Documentation
```
http://localhost:9010/docs
```

### Check Kafka Topics
```bash
# List topics
docker-compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume from change-requests
docker-compose exec kafka kafka-console-consumer.sh \
  --topic change-requests \
  --bootstrap-server localhost:9092 \
  --from-beginning

# Consume from ai.risk.completed
docker-compose exec kafka kafka-console-consumer.sh \
  --topic ai.risk.completed \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

### View MySQL Data
```bash
mysql -u root -p icm_risk_db

SELECT * FROM risk_assessments ORDER BY created_at DESC LIMIT 5;
SELECT * FROM grounding_evidence ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'risk-assessment'` | Python path not configured | Ensure you're running from `python-agents-icm/` directory; use `-m` flag: `python -m risk-assessment.agent.main` |
| `SQLALCHEMY_DATABASE_URI connection failed` | MySQL not running or wrong credentials | Check `.env` file; verify MySQL is running (`docker ps`); run init_db: `python -m risk-assessment.persistence.init_db` |
| `GroqAPIKeyError` | Missing or invalid API key | Get key from [groq.com](https://groq.com); set in `.env`: `GROQ_API_KEY=gsk_...` |
| `Kafka broker not available` | Kafka not running | Start: `docker-compose up -d`; verify: `docker-compose ps` |
| `JSON decode error from LLM` | LLM returned invalid JSON | Grounded reasoner has defensive fallback; check logs; retry manually |
| `No suitable event found in CSV` | Historical data too small | Add more rows to `data/historical_change_requests.csv` and retrain |
| `Models not found in ./models/` | Model files missing | Run trainer: `python -m risk-assessment.ml.trainer` or copy from backup |

---

## Performance Notes

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| **API latency (REST)** | 1-3s | Includes feature engineering, prediction, LLM call (dominant), JSON parsing |
| **Kafka consumer latency** | 2-5s | Same as REST + Kafka serialization overhead |
| **Throughput** | 10-20 CRs/sec | Single process; horizontally scalable with Kafka consumer groups |
| **Model inference** | <500ms | XGBoost prediction only (no LLM) |
| **Feature engineering** | 200-500ms | CSV data load + context computation |
| **LLM reasoning** | 1-3s | Groq API call (network-dependent) |
| **Database write** | 50-100ms | MySQL transaction commit |
| **Memory per process** | ~500MB | Includes: loaded CSV data, models, LLM client connection |

---

## Advanced Configuration

### Custom Model Paths
```env
MODEL_PATH=/var/models/icm_risk_models
```

### LLM Model Selection
The service uses Groq models. Common options:
- `llama-2-70b-chat` — Larger, more accurate
- `mixtral-8x7b-32768` — Faster, good balance

Edit `llm/client.py` to change the model:
```python
LLM_MODEL = "mixtral-8x7b-32768"
```

### Feature Engineering Tuning
Enable/disable feature groups in `.env`:
```env
ENABLE_TOPOLOGY_FEATURES=true
ENABLE_HISTORICAL_FEATURES=true
ENABLE_TEMPORAL_FEATURES=true
ENABLE_CRITICALITY_FEATURES=true
```

### Confidence Thresholds
Adjust in `intelligence/calibration_engine.py`:
```python
HISTORICAL_CONFIDENCE_BOOST = 0.10
GROUNDING_CONFIDENCE_BOOST = 0.10
MIN_CONFIDENCE = 0.50  # Reject assessments below this
```

---

## Monitoring & Logging

### Structured Logging
All events are logged with correlation IDs:
```
timestamp=2026-05-15T02:05:00.123Z level=INFO service=risk-agent correlation_id=corr-12345 event=CR_RECEIVED cr_id=CR-2026-001234
timestamp=2026-05-15T02:05:00.456Z level=INFO service=risk-agent correlation_id=corr-12345 event=FEATURES_COMPUTED risk_score=65.5 risk_level=MEDIUM
timestamp=2026-05-15T02:05:00.789Z level=INFO service=risk-agent correlation_id=corr-12345 event=LLM_GROUNDING_COMPLETE cab_guidance_length=256
timestamp=2026-05-15T02:05:01.012Z level=INFO service=risk-agent correlation_id=corr-12345 event=ASSESSMENT_PERSISTED assessment_id=uuid db_latency_ms=45
timestamp=2026-05-15T02:05:01.234Z level=INFO service=risk-agent correlation_id=corr-12345 event=ASSESSMENT_PUBLISHED topic=ai.risk.completed
```

### Metrics to Monitor
- **Model accuracy**: Track actual outcomes vs. predictions on holdout set
- **LLM reasoning quality**: Measure coherence and actionability
- **Kafka lag**: Monitor consumer lag; alert if > 100 messages
- **Database connection pool**: Monitor active/idle connections
- **Error rate**: Track DLQ publish rate; investigate spikes

---

## Integration with Runbook Agent

After risk assessment completes, downstream systems (e.g., Runbook Agent) can:
1. Subscribe to `ai.risk.completed` topic
2. Extract risk_score, risk_level, blast_radius, recommendations
3. Use as context for runbook generation (see [runbook-agent README](../runbook-agent/README.md))

Example integration:
```python
# Runbook Agent receives
risk_assessment = {
  "risk_score": 65.5,
  "risk_level": "MEDIUM",
  "blast_radius": "REGIONAL",
  "recommendations": ["Execute during low-traffic window", ...]
}

# Uses in prompt:
prompt = f"""
Given the risk assessment: {risk_assessment}
Generate a detailed runbook with extra care for: {risk_assessment['recommendations']}
"""
```

---

## Next Steps

- [ ] Implement model performance monitoring dashboard
- [ ] Add support for additional ML algorithms (LightGBM, CatBoost)
- [ ] Integrate with external knowledge bases (runbooks, incident history)
- [ ] Fine-tune LLM prompts based on operator feedback
- [ ] Add multi-tenant support with tenant-specific models
- [ ] Implement A/B testing framework for model variants
    "similar_changes_with_rollbacks": 3,
    "similar_changes_failed": 1
  },
  "model_metadata": {
    "prediction_engine": "XGBoost",
    "reasoning_engine": "Groq-LLaMA-2",
    "grounding_enabled": true
  },
  "generated_at": "2026-05-13T14:23:45.123456"
}
```

---

### 5. Kafka: Dead-Letter Queue (DLQ)

**Topic:** `risk-assessments-dlq`

**Format:** JSON

**Message Schema (Failed Event):**
```json
{
  "failed_event": {
    "cr_id": "CR-2026-001234",
    "domain": "NETWORK",
    ...
  },
  "error": "Pydantic validation error: ChangeRequestEvent validation failed - missing required field 'asset_ids'"
}
```

---

## Data Flow Architecture

### End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION (Java/Spring)                    │
│                                                                     │
│  Change Request Event                                              │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     │ Publishes
                     ▼
        ┌─────────────────────────────┐
        │    KAFKA TOPIC              │
        │   "change-requests"         │
        └──────────┬──────────────────┘
                   │
                   │ Consumes
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  RISK AGENT (Python/FastAPI)                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 1. KAFKA CONSUMER                                             │ │
│  │    - Validates ChangeRequestEvent (Pydantic)                 │ │
│  │    - Assigns correlation_id                                  │ │
│  │    - Logs event reception                                    │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 2. CONTEXT BUILDER (intelligence/context_builder.py)         │ │
│  │    - Loads historical data from CSV                          │ │
│  │    - Computes historical metrics                             │ │
│  │    - Builds topology intelligence                            │ │
│  │    - Similarity scoring with past changes                    │ │
│  │    - Feature calibration                                     │ │
│  │                                                               │ │
│  │    Outputs:                                                  │ │
│  │    {                                                         │ │
│  │      "historical_intelligence": {...},                       │ │
│  │      "topology_intelligence": {...},                         │ │
│  │      "grounding_evidence": {...},                            │ │
│  │      "feature_context": {...}                                │ │
│  │    }                                                          │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 3. FEATURE ENGINEERING (ml/feature_engine.py)                │ │
│  │    - Extracts ML features from context                       │ │
│  │    - Applies feature scaling                                 │ │
│  │    - Maps to model feature names                             │ │
│  │                                                               │ │
│  │    Input features:                                           │ │
│  │    [asset_count, duration_minutes, peak_hours, is_weekend,   │ │
│  │     core_asset_ratio, internet_facing_ratio, ...]            │ │
│  │                                                               │ │
│  │    Output: [0.75, 0.45, 0, 0, 0.2, 0.4, ...]                │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 4. RISK PREDICTOR (ml/predictor.py)                          │ │
│  │                                                               │ │
│  │    a) XGBoost Regressor                                      │ │
│  │       - Predicts continuous risk_score (0-100)               │ │
│  │                                                               │ │
│  │    b) XGBoost Classifier                                     │ │
│  │       - Predicts risk_level class (LOW/MEDIUM/HIGH/CRITICAL) │ │
│  │                                                               │ │
│  │    c) Blast Radius Heuristics                                │ │
│  │       - If: blast_factor > 350 AND dependency_density > 70   │ │
│  │         Then: GLOBAL                                         │ │
│  │       - Else if: blast_factor > 200 AND dependency_density   │ │
│  │         > 40 Then: REGIONAL                                  │ │
│  │       - Else if: blast_factor > 100 Then: LOCAL              │ │
│  │       - Else: MINIMAL                                        │ │
│  │                                                               │ │
│  │    d) Confidence Scoring                                     │ │
│  │       - Historical signal confidence += 0.10                 │ │
│  │       - Grounding signal confidence += 0.10                  │ │
│  │       - Risk score stability adjustment                      │ │
│  │                                                               │ │
│  │    Output:                                                   │ │
│  │    {                                                         │ │
│  │      "risk_score": 65.5,                                     │ │
│  │      "risk_level": "MEDIUM",                                 │ │
│  │      "blast_radius": "REGIONAL",                             │ │
│  │      "confidence": 0.80                                      │ │
│  │    }                                                          │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 5. GROUNDED REASONER (llm/grounded_reasoner.py)              │ │
│  │    - Calls Groq LLaMA-2 API                                  │ │
│  │    - Generates human-readable explanations                   │ │
│  │    - Grounds reasoning in historical evidence                │ │
│  │    - Defensive JSON parsing (handles LLM inconsistencies)    │ │
│  │                                                               │ │
│  │    Input:                                                    │ │
│  │    {                                                         │ │
│  │      "risk_score": 65.5,                                     │ │
│  │      "blast_radius": "REGIONAL",                             │ │
│  │      "similar_changes_with_outages": 2,                      │ │
│  │      "similar_changes_analyzed": 12,                         │ │
│  │      ...                                                     │ │
│  │    }                                                          │ │
│  │                                                               │ │
│  │    Output:                                                   │ │
│  │    {                                                         │ │
│  │      "executive_summary": "...",                             │ │
│  │      "technical_analysis": "...",                            │ │
│  │      "cab_guidance": "..."                                   │ │
│  │    }                                                          │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 6. RESPONSE BUILDER (agent/response_builder.py)              │ │
│  │    - Merges prediction + reasoning                           │ │
│  │    - Validates against RiskAssessmentEvent schema            │ │
│  │    - Adds timestamps & assessment_id                         │ │
│  │    - Formats recommendations                                 │ │
│  │                                                               │ │
│  │    Output: RiskAssessmentEvent (see schema above)            │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 7. DATABASE PERSISTENCE (persistence/repository.py)          │ │
│  │    - Saves assessment to risk_assessments table              │ │
│  │    - Saves grounding_evidence to related table               │ │
│  │    - Saves audit trail (event_audit)                         │ │
│  │    - Transactional commit                                    │ │
│  │                                                               │ │
│  │    Tables:                                                   │ │
│  │    - risk_assessments (assessment_id PK)                     │ │
│  │      [assessment_id, cr_id, risk_score, risk_level,          │ │
│  │       blast_radius, confidence, executive_summary, ...]      │ │
│  │    - grounding_evidence (FK: assessment_id)                  │ │
│  │      [similar_changes_analyzed, with_outages, ...]           │ │
│  │    - event_audit (audit trail)                               │ │
│  │      [assessment_id, event_type, created_at, ...]            │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ 8. KAFKA PRODUCER (messaging/producer.py)                    │ │
│  │    - Publishes RiskAssessmentEvent                           │ │
│  │    - Validates against contract schema                       │ │
│  │    - Logs exact payload (JSON)                               │ │
│  │    - Flushes to ensure delivery                              │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│  ┌────────▼─────────────────────────────────────────────────────┐ │
│  │ ERROR HANDLING (Try-Catch)                                   │ │
│  │    - If validation fails → publish to DLQ                    │ │
│  │    - If prediction fails → log & DLQ                         │ │
│  │    - If DB save fails → rollback & DLQ                       │ │
│  │    - If Kafka publish fails → retry & DLQ                    │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
└───────────┼────────────────────────────────────────────────────────┘
            │
            │ Publishes (success)
            ▼
    ┌──────────────────────────────┐
    │    KAFKA TOPIC               │
    │  "ai.risk.completed"         │
    │  (or "risk-assessments-dlq"  │
    │   on error)                  │
    └──────────┬───────────────────┘
               │
               │ Subscribes
               ▼
┌──────────────────────────────────────────────────────────────────┐
│         CAB SYSTEM / FRONTEND (Java/Spring/UI)                  │
│                                                                  │
│  - Consumes RiskAssessmentEvent                                │
│  - Displays risk score & recommendations                       │
│  - Records decision (approved/rejected)                        │
│  - Links assessment to change approval workflow                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Detailed Component Interactions

### Flow 1: Kafka Consumer → Python Prediction Pipeline

**Trigger:** Change request event arrives on `change-requests` topic

**Steps:**
1. Consumer validates JSON against `ChangeRequestEvent` Pydantic model
2. Extracts change attributes (domain, region, asset_count, etc.)
3. Builds enriched context using:
   - Historical intelligence (past changes in same domain)
   - Topology intelligence (network dependencies, blast radius)
   - Similarity scoring (find similar past changes)
   - Feature calibration (normalize features for ML model)
4. Runs XGBoost prediction models
5. Generates LLM-based reasoning
6. Saves to MySQL
7. Publishes to `ai.risk.completed` topic

### Flow 2: REST API → Synchronous Analysis

**Trigger:** POST request to `/analyze` endpoint

**Steps:**
1. FastAPI validates request body
2. Creates temporary `ChangeRequestEvent` object
3. Skips Kafka consumer (uses in-memory processing)
4. Runs all prediction & reasoning logic
5. Returns response immediately (no database save, no Kafka publish)
6. Useful for: real-time CAB queries, testing, integration with frontend

### Flow 3: Database Persistence

**Tables:**
- `risk_assessments` — Main assessment record (1:1 with Kafka event)
- `grounding_evidence` — Historical context (FK to assessment)
- `event_audit` — Audit trail (tracks all state changes)

**Persistence Logic:**
```python
# Transactional save
db = SessionLocal()
try:
    assessment = RiskAssessment(...)  # insert
    db.add(assessment)
    db.flush()
    
    evidence = GroundingEvidence(...)  # insert
    db.add(evidence)
    
    audit = EventAudit(...)  # insert
    db.add(audit)
    
    db.commit()  # all-or-nothing
except Exception as e:
    db.rollback()
    publish_to_dlq(event, error_message)
```

### Flow 4: Error Handling & DLQ

**Errors caught:**
- Schema validation failures
- Missing required fields
- Type mismatches (e.g., asset_count as string instead of int)
- Database connection failures
- LLM API timeouts
- Kafka publish failures

**DLQ Publishing:**
```python
publish_to_dlq(
    failed_event={...},
    error_message="Pydantic validation error: ..."
)
```

Frontend or monitoring system listens on `risk-assessments-dlq` topic for alerts.

---

## Kafka Topics Summary

| Topic | Direction | Schema | Purpose |
|-------|-----------|--------|---------|
| `change-requests` | **Inbound** | `contracts/change_request_event.json` | Change requests from orchestration system |
| `ai.risk.completed` | **Outbound** | `contracts/risk_assessment_event.json` | Risk assessments published to CAB |
| `risk-assessments-dlq` | **Error** | `{failed_event, error}` | Failed event handling & monitoring |

---

## Database Schema

### `risk_assessments` Table
```sql
CREATE TABLE risk_assessments (
    assessment_id VARCHAR(64) PRIMARY KEY,
    cr_id VARCHAR(128),
    risk_score FLOAT,
    risk_level VARCHAR(32),
    blast_radius VARCHAR(32),
    confidence FLOAT,
    executive_summary TEXT,
    technical_analysis TEXT,
    cab_guidance TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `grounding_evidence` Table
```sql
CREATE TABLE grounding_evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64) UNIQUE,
    similar_changes_analyzed INT,
    similar_changes_with_outages INT,
    similar_changes_with_rollbacks INT,
    similar_changes_failed INT,
    FOREIGN KEY (assessment_id) REFERENCES risk_assessments(assessment_id)
);
```

### `event_audit` Table
```sql
CREATE TABLE event_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64),
    event_type VARCHAR(64),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES risk_assessments(assessment_id)
);
```

---

## Troubleshooting

### Kafka Consumer Not Receiving Events
- Check Kafka is running: `docker-compose logs kafka`
- Verify topic exists: `kafka-topics --list --bootstrap-server localhost:9092`
- Check consumer group: `kafka-consumer-groups --describe --group risk-agent-group`

### Database Connection Error
- Verify MySQL running: `mysql -u root -p`
- Check `.env` has correct `MYSQL_URL`
- Ensure database exists: `SHOW DATABASES;`

### Models Not Loading
- Verify `./models/` directory contains:
  - `risk_regressor.pkl`
  - `risk_classifier.pkl`
  - `feature_names.pkl`
  - `risk_label_mapping.pkl`

### LLM Timeout
- Check Groq API key in `.env`
- Verify internet connectivity to `api.groq.com`
- Check Groq account quota

---

## Integration Testing

### 1. Test REST API Endpoint
```powershell
$body = @{
    domain = "NETWORK"
    change_type = "CONFIG_UPDATE"
    region = "US-EAST-1"
    asset_count = 5
    duration_minutes = 30
    is_peak_hours = $false
    is_weekend = $false
    rollback_available = $true
    has_core_asset = $false
    any_internet_facing = $true
    all_assets_redundant = $false
    max_asset_criticality = "HIGH"
    asset_ids = @("A1", "A2", "A3", "A4", "A5")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:9010/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 2. Test Kafka Publishing (from Java/Spring)
```java
producer.send(
    new ProducerRecord<>(
        "change-requests",
        changeRequestJson
    )
);
```

### 3. Monitor Output Kafka Topic
```powershell
docker exec -it kafka kafka-console-consumer \
    --bootstrap-server localhost:9092 \
    --topic ai.risk.completed \
    --from-beginning
```

---

## Contracts & Pydantic Models

Contracts are source-of-truth in `contracts/*.json` and validated by Pydantic models in `contracts/models.py`.

ChangeRequest (Java -> Python) key fields (contract):

```json
{
   "cr_id": "string",
   "title": "string",
   "description": "string",
   "domain": "string",
   "change_type": "string",
   "region": "string",
   "scheduled_start": "datetime",
   "scheduled_end": "datetime",
   "rollback_available": true,
   "business_justification": "string",
   "asset_count": 0,
   "is_peak_hours": false,
   "is_weekend": false,
   "duration_minutes": 0,
   "has_core_asset": false,
   "any_internet_facing": false,
   "all_assets_redundant": false,
   "max_asset_criticality": "MEDIUM",
   "asset_ids": []
}
```

Notes:
- `has_core_asset`, `any_internet_facing`, `all_assets_redundant`, `max_asset_criticality` are `Optional[...]` in the Pydantic model with safe defaults so upstreams can omit them.

RiskAssessment (Python -> Java) key fields (contract):

```json
{
   "assessment_id": "string",
   "cr_id": "string",
   "risk_score": 0.0,
   "risk_level": "LOW",
   "blast_radius": "LOCAL",
   "confidence": 0.0,
   "executive_summary": "string",
   "technical_analysis": "string",
   "cab_guidance": "string",
   "recommendations": [],
   "risk_indicators": [],
   "grounding_evidence": {"similar_changes_analyzed":0, "similar_changes_with_outages":0, "similar_changes_with_rollbacks":0, "similar_changes_failed":0},
   "model_metadata": {"prediction_engine":"string","reasoning_engine":"string","grounding_enabled": true},
   "generated_at": "datetime"
}
```

Important integration notes
---------------------------

- Python publishes `snake_case` JSON; Java DTOs should map to camelCase (e.g., `assessment_id` -> `assessmentId`).
- The producer ensures `assessment_id` (UUID) and `generated_at` (UTC ISO) are present before publish.
- The producer prints the final JSON payload to stdout prior to sending — use this for integration validation.

HTTP API (FastAPI)
------------------

1) `GET /health`

- Description: service health
- Response: `{ "status": "UP", "service": "ICM Risk Intelligence Agent", "version": "3.0.0" }`

2) `POST /analyze?debug={true|false}`

- Description: Accepts a change request payload, returns a risk assessment. If `debug=true` the response includes intelligence internals.
- Example request body (subset / same as ChangeRequest contract):

```json
{
   "cr_id": "cr-123",
   "domain": "NETWORK",
   "change_type": "MAINTENANCE",
   "region": "ap-south-1",
   "asset_count": 3,
   "duration_minutes": 60,
   "is_peak_hours": false,
   "is_weekend": false,
   "rollback_available": true,
   "asset_ids": ["asset-1","asset-2"]
}
```

- Example production response (abridged):

```json
{
   "assessment_id": "uuid",
   "cr_id": "cr-123",
   "generated_at": "2026-05-11T12:34:56.789Z",
   "risk_score": 42.5,
   "risk_level": "MEDIUM",
   "blast_radius": "REGIONAL",
   "confidence": 0.78,
   "executive_summary": "...",
   "technical_analysis": "...",
   "recommendations": ["..."],
   "model_metadata": { ... }
}
```

Feature extraction and ML
-------------------------

- `intelligence/topology_engine.py` computes topology-derived features (centrality, dependency density, blast factors) from `data/network_inventory.csv`.
- `intelligence/historical_engine.py` computes historical failure/rollback statistics from historical CSVs.
- `intelligence/similarity_engine.py` finds top-k similar historical CRs for grounding/evidence.
- `intelligence/feature_engine.py` encodes categorical fields and derives composite indices used by the models.
- `ml/trainer.py` builds training data and trains XGBoost regressor/classifier and writes artifacts to `models/`.
- `ml/predictor.py` loads artifacts and produces prediction payloads consumed by the reasoner and response builder.

Persistence
-----------

- SQLAlchemy models are defined in `persistence/models.py` and persisted via `persistence/repository.py`.
- `persistence.init_db` creates the schema.
- The repository writes `RiskAssessment`, `GroundingEvidence`, and `EventAudit` records within a transaction and uses `flush()` to preserve FK integrity.

Messaging behavior
-----------------

- Consumer (`messaging/consumer.py`) validates incoming change requests vs `ChangeRequestEvent` and rejects malformed events to `risk-assessments-dlq`.
- Producer (`messaging/producer.py`) validates outbound `RiskAssessmentEvent` and prints the final JSON before sending to `ai.risk.completed`.

Folder structure (high level)
----------------------------

```
agent/
config/
contracts/
data/
intelligence/
llm/
messaging/
ml/
models/         # trained artifacts (generated at runtime)
persistence/
README.md
requirements.txt
docker-compose.yml
.env
```

Data files
----------

- All CSVs live under `data/`. They are used for training and grounding. Keep them read-only for reproducibility.

Operational tips
----------------

- Use the printed JSON from the producer to create the Java DTO mapping and unit tests.
- In production, use a secrets manager to populate `GROQ_API_KEY` and `MYSQL_URL` (do not commit `.env`).
- Add a schema registry or publish the `contracts/*.json` to a shared repo for Java consumption.

Troubleshooting
---------------

- If Kafka connection fails, verify `KAFKA_BOOTSTRAP_SERVERS` and `docker-compose ps`.
- If MySQL errors occur, verify `MYSQL_URL` and that MySQL is accepting connections.
- If LLM calls fail, verify `GROQ_API_KEY` and network connectivity.

Contact / Ownership
-------------------

This README was generated and maintained by the code owners of the ICM Risk Intelligence Agent. Keep `contracts/` up-to-date as the canonical API/contract source for cross-team integrations.