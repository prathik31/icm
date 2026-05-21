# ICM Risk Intelligence Agent — Complete Developer Guide

## Overview

The **ICM Risk Intelligence Agent** is a Python-based microservice that consumes change request events from orchestration (Java/Spring) services, enriches them with topology and historical intelligence, predicts operational risk using XGBoost models, generates grounded LLM explanations, persists assessments to MySQL, and publishes standardized assessment events back to the enterprise event bus (Kafka).

### Key Capabilities
- **Contract-first Kafka integration** — JSON + Pydantic models in `contracts/`
- **Deterministic risk scoring** — XGBoost regressor + classifier
- **Grounded reasoning** — Groq LLM with defensive JSON parsing
- **Transactional persistence** — MySQL with audit trails
- **Dead-letter queue (DLQ)** — For invalid or failed events
- **REST API** — FastAPI endpoint for direct risk analysis
- **Multi-layered intelligence** — Topology, historical, similarity, and feature engineering

---

## Mandatory Setup Instructions

### Prerequisites
- **Python 3.10+** (virtualenv recommended)
- **MySQL 8+** (local or hosted)
- **Docker & Docker Compose** (recommended for Kafka + Zookeeper)
- **Groq API Key** (free tier available at groq.com)
- **Network access** — Groq API and Kafka broker

### Step 1: Clone & Initialize Environment

```powershell
# Clone the repository
cd C:\Users\sweta.singh5\Desktop\capstone\python-agents-icm\risk-assessment

# Create Python virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# On Linux/Mac, use: source venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Key dependencies:**
- `fastapi`, `uvicorn` — REST API framework
- `kafka-python` — Kafka producer/consumer
- `sqlalchemy`, `pymysql` — Database ORM & MySQL driver
- `pydantic` — Data validation
- `joblib`, `xgboost` — ML model serialization & prediction
- `groq` — LLM reasoning engine
- `python-dotenv` — Environment variable management

### Step 3: Create Environment Configuration

Create a `.env` file in the project root:

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
MYSQL_URL=mysql+pymysql://root:password@localhost/icm_risk_intelligence

# LLM Configuration (Groq)
GROQ_API_KEY=your_actual_groq_api_key_here

# Model Path
MODEL_PATH=./models
```

### Step 4: Initialize Database Schema

```powershell
# Create MySQL database
mysql -u root -p
CREATE DATABASE icm_db;
EXIT;

# Initialize schema
python -m persistence.init_db
```

This creates:
- `risk_assessments` — Main assessment records
- `grounding_evidence` — Supporting historical evidence
- `event_audit` — Audit trail of all events

### Step 5: Start Kafka & Zookeeper (Docker)

```powershell
# Start services in background
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f kafka
```

---

## Running the System

### 1. Start REST API Server

```powershell
python -m agent.main
```

**Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:9010 (Press CTRL+C to quit)
```

**Available endpoints:**
- `GET /health` — Health check
- `POST /analyze` — Synchronous risk analysis

### 2. Start Kafka Consumer (Event Pipeline)

```powershell
python -m messaging.consumer
```

This service:
- Listens on `change-requests` topic
- Validates incoming change request events
- Runs risk prediction & reasoning
- Persists to MySQL
- Publishes results to `ai.risk.completed` topic

### 3. Monitor Dead-Letter Queue (DLQ)

```powershell
python -m messaging.dlq_listener
```

Watches `risk-assessments-dlq` for:
- Invalid event schemas
- Processing failures
- Corrupted messages

---

## Backend APIs

### 1. Health Check Endpoint

**Endpoint:** `GET /health`

**Purpose:** Verify service is running and healthy

**Response:**
```json
{
  "status": "UP",
  "service": "ICM Risk Intelligence Agent",
  "version": "3.0.0"
}
```

---

### 2. Synchronous Risk Analysis Endpoint

**Endpoint:** `POST /analyze`

**Purpose:** Analyze a change request and return risk assessment synchronously

**Request Body:**
```json
{
  "domain": "NETWORK",
  "change_type": "CONFIG_UPDATE",
  "region": "US-EAST-1",
  "asset_count": 5,
  "duration_minutes": 30,
  "is_peak_hours": false,
  "is_weekend": false,
  "rollback_available": true,
  "has_core_asset": false,
  "any_internet_facing": true,
  "all_assets_redundant": false,
  "max_asset_criticality": "HIGH",
  "asset_ids": ["ASSET-001", "ASSET-002", "ASSET-003", "ASSET-004", "ASSET-005"]
}
```

**Response:**
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "cr_id": null,
  "risk_score": 65.5,
  "risk_level": "MEDIUM",
  "blast_radius": "REGIONAL",
  "confidence": 0.8,
  "executive_summary": "This change carries moderate risk due to multiple internet-facing assets and high criticality components. Regional impact is likely if rollback is required.",
  "technical_analysis": "The configuration change affects 5 assets including high-criticality components. Network topology shows regional dependencies with 3 redundant paths available.",
  "cab_guidance": "Recommend scheduling during maintenance window. Ensure rollback procedures are tested. Consider phased deployment approach.",
  "recommendations": [
    "Execute during low-traffic window",
    "Pre-stage rollback configuration",
    "Monitor BGP changes during execution",
    "Have network team on standby"
  ],
  "risk_indicators": ["HIGH_CRITICALITY", "INTERNET_FACING", "REGIONAL_IMPACT"],
  "grounding_evidence": {
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
- `debug=true` (optional) — Returns additional model prediction details for troubleshooting

---

### 3. Kafka: Change Request Event (Consumer)

**Topic:** `change-requests`

**Format:** JSON

**Message Schema:**
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

---

### 4. Kafka: Risk Assessment Event (Producer)

**Topic:** `ai.risk.completed`

**Format:** JSON

**Message Schema:**
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "cr_id": "CR-2026-001234",
  "risk_score": 65.5,
  "risk_level": "MEDIUM",
  "blast_radius": "REGIONAL",
  "confidence": 0.8,
  "executive_summary": "This change carries moderate risk due to multiple internet-facing assets and high criticality components. Regional impact is likely if rollback is required.",
  "technical_analysis": "The configuration change affects 5 assets including high-criticality components. Network topology shows regional dependencies with 3 redundant paths available.",
  "cab_guidance": "Recommend scheduling during maintenance window. Ensure rollback procedures are tested. Consider phased deployment approach.",
  "recommendations": [
    "Execute during low-traffic window",
    "Pre-stage rollback configuration",
    "Monitor BGP changes during execution",
    "Have network team on standby"
  ],
  "risk_indicators": ["HIGH_CRITICALITY", "INTERNET_FACING", "REGIONAL_IMPACT"],
  "grounding_evidence": {
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