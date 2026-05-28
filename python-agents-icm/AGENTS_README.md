# Agents Overview — Runbook Agent & Risk Assessment Agent

## Executive Summary
- **Purpose**: Two complementary AI agents power automated change management within the Integrated Change Management (ICM) platform. The **Risk Assessment Agent** scores and contextualizes change requests using ML and LLM-grounded reasoning; the **Runbook Agent** generates operational runbooks from approved change requests plus enriched topology and asset context. Together they reduce manual triage, speed execution planning, and improve change success rates.
- **Audience**: Business stakeholders, product managers, and engineering leads who need a clear understanding of what each agent does, why it works, and the business value it delivers.

## High-Level Value Proposition
- **Faster decision-making**: Automated risk scores with grounded reasoning and suggested mitigations reduce time-to-decision.
- **Consistent operational plans**: The Runbook Agent produces repeatable, auditable, vendor-aware runbooks that reduce human error and standardize execution.
- **Better outcomes**: Combined insights from historical outcomes, network topology, and asset criticality reduce rollback events and outage risk.
- **Reduced operational toil**: Automated enrichment with inventory context, topology guidance, and pre/post-flight checks minimizes manual preparation.

## Repository Structure
```
python-agents-icm/
├── AGENTS_README.md              # This file
├── requirements.txt              # Root-level dependencies
├── shared-data/                  # Shared CSV data sources
├── risk-assessment/              # Risk Assessment Agent service
│   ├── README.md
│   ├── requirements.txt
│   ├── agent/
│   ├── config/
│   ├── contracts/                # Kafka event schemas
│   ├── data/                     # Training datasets
│   ├── intelligence/             # Feature & context engines
│   ├── llm/                      # LLM integration
│   ├── messaging/                # Kafka consumer/producer
│   ├── ml/                       # Model training & inference
│   ├── models/                   # Trained XGBoost artifacts
│   ├── persistence/              # MySQL ORM
│   └── docker-compose.yml
└── runbook-agent/                # Runbook Generation Agent service
    ├── README.md
    ├── requirements.txt
    ├── app/
    ├── data/                     # Runbook examples & inventory
    ├── chroma_db/                # Vector store for retrieval
    ├── test_*.py
    └── Dockerfile
```

## The Two Agents (At-a-Glance)

### Risk Assessment Agent
- **Role**: Convert incoming change request data into a structured risk score, risk level, blast radius estimate, and LLM-grounded narrative. Leverages historical change outcomes, network topology, and asset criticality.
- **Engines**: 
  - Feature engineering (asset criticality, topology risk, temporal features)
  - XGBoost risk classifier and regressor (trained on historical outcomes)
  - Groq LLM for grounded reasoning and CAB guidance generation
  - Historical similarity matching for contextual evidence
- **Where to look**: [risk-assessment README](risk-assessment/README.md) and `risk-assessment/` directory

### Runbook Agent
- **Role**: Turn an approved change request into a step-by-step operational runbook enriched with retrieved historical examples, asset inventory context, topology guidance, and LLM-generated execution steps.
- **Capabilities**:
  - Retrieval-augmented generation (RAG) powered by ChromaDB vector store
  - Asset enrichment from network inventory CSV
  - Vendor and topology-aware guidance (Cisco IOS-XE, ASR, etc.)
  - Structured output with pre-checks, implementation steps, validation, rollback, monitoring, and escalation
  - Placeholder cleanup for generated operational commands
- **Where to look**: [runbook-agent README](runbook-agent/README.md) and `runbook-agent/app/` directory

## Training Datasets and Provenance
All datasets are stored in `shared-data/` for shared reference and `data/` subdirectories within each agent for local copies:

- **`synthetic_runbooks.csv`** (Runbook Agent): ~200 curated examples used to seed the ChromaDB retrieval collection. Demonstrates runbook structure, phrasing, and domain/change-type categorization.
- **`historical_change_requests.csv`** (Risk Agent): Historical CR metadata used to derive features and labels for supervised risk-model training.
- **`historical_cr_assets.csv`** (Risk Agent): Asset mappings and criticality levels used in feature engineering.
- **`historical_cr_outcomes.csv`** (Risk Agent): Ground truth outcome records (success/rollback/outage) used for model validation, calibration, and similarity matching.
- **`network_inventory.csv`** (Runbook Agent): Authoritative device and asset metadata (hostname, vendor, OS, region, criticality). Used for runbook enrichment and vendor-specific guidance.
- **`historical_risk_assessments.csv`** (Risk Agent): Pre-computed risk assessments for benchmarking.

**Data Governance Notes**:
- All datasets are project-local CSV artifacts intended for development and experimentation.
- For production deployments, replace with canonical, access-controlled sources (data warehouse, asset management system, historical KPI store).
- Ensure PII scrubbing, data encryption, and audit trail logging before moving to production.
- CSV data should be versioned in Git; large production datasets should use external storage (S3, blob, database).

## Architecture & Models

### Risk Assessment Agent
**Approach**: Supervised ML pipeline with LLM-grounded reasoning
- **Feature Engineering**: Topology risk, asset criticality, temporal features (peak hours, weekend), rollback availability, blast radius estimation
  - Implemented in `risk-assessment/intelligence/` (topology, historical, similarity engines)
  - Feature vector built in `risk-assessment/ml/feature_schema.py`
- **ML Models**: 
  - XGBoost regressor (outputs risk_score 0–100)
  - XGBoost classifier (outputs risk_level: LOW/MEDIUM/HIGH)
  - Trained on historical outcomes with cross-validation
  - Model artifacts persisted in `risk-assessment/models/` (pickle files)
- **LLM Reasoning**: 
  - Groq API (LLaMA 2 or later) for grounded explanations
  - Generates executive summary, technical analysis, CAB guidance, and recommendations
  - Accepts model predictions, topology context, and historical evidence
  - Defensive JSON parsing with retry logic
- **Database Persistence**: MySQL via SQLAlchemy ORM
  - Stores risk_assessments, grounding_evidence, and audit trails
  - Schema defined in `persistence/models.py`

### Runbook Agent
**Approach**: Retrieval-Augmented Generation (RAG)
1. **Embedding**: Generate embedding for incoming CR (title, description, domain, change_type) using `sentence-transformers/all-MiniLM-L6-v2` or deterministic fallback
2. **Retrieval**: Query ChromaDB for similar runbooks (same domain + change_type)
   - ChromaDB persisted in `chroma_db/` (SQLite-backed)
3. **Enrichment**: 
   - Load asset details from `network_inventory.csv`
   - Build topology context (critical paths, redundancy, regional impact)
   - Generate vendor-specific guidance (Cisco, ASR, etc.)
4. **LLM Generation**: 
   - Call Groq API with enriched prompt
   - Generate structured JSON runbook (pre-checks, steps, rollback, monitoring, escalation)
5. **Post-Processing**: 
   - Placeholder cleanup (e.g., `[VENDOR]` → `Cisco`)
   - JSON schema validation
- **Services**:
  - `embedding_service.py`: Embeddings with SentenceTransformers or fallback
  - `groq_service.py`: LLM integration with retry logic
  - `inventory_service.py`: Asset context loading
  - `topology_service.py`: Network topology reasoning
  - `post_processor.py`: Cleanup and validation

## Data Flow

```
┌────────────────┐
│ Change Request │
│ (CR metadata)  │
└────────┬────────┘
         │
    ┌────▼────┐
    │Risk Agent│  → Analyzes risk, consults historical outcomes
    │ (XGBoost)│     and topology, generates LLM-grounded narrative
    └────┬────┘
         │
    ┌────▼─────────────┐
    │Risk Assessment   │  → Publishes to Kafka topic
    │(score, guidance) │     "ai.risk.completed"
    └────┬─────────────┘
         │
    ┌────▼──────────┐
    │ Runbook Agent │  → Retrieves similar runbooks from ChromaDB
    │ (RAG)         │     Enriches with asset & topology context
    └────┬──────────┘     Generates LLM runbook JSON
         │
    ┌────▼──────────┐
    │ Operational   │
    │ Runbook       │
    │ (executable)  │
    └───────────────┘
```

## How Training & Validation are Performed

### Risk Model Training & Validation
1. **Data Preparation**: Load historical_change_requests + outcomes, engineer features
2. **Train/Validation Split**: Typically 80/20 or cross-validation folds
3. **Model Selection**: XGBoost classifier/regressor tuned on validation metrics
4. **Evaluation**: 
   - AUC-ROC (ranking performance)
   - Precision/recall at operational thresholds (LOW/MEDIUM/HIGH)
   - Calibration curves (actual vs. predicted risk)
5. **Holdout Testing**: Final accuracy reported on unseen historical outcomes
6. **Retraining Triggers**: Model drift detection, new outcome data, seasonal changes

**Reproducibility**: See `risk-assessment/ml/trainer.py` for the complete training pipeline.

### Runbook Retrieval & Quality Validation
1. **Seeding**: Load synthetic_runbooks.csv into ChromaDB (domain + change_type collections)
2. **Retrieval Validation**: 
   - Measure retrieval precision (do retrieved runbooks match the incoming CR domain/type?)
   - Evaluate semantic similarity of retrieved examples
3. **LLM Output Validation**:
   - Schema validation (JSON must match RunbookOutput shape)
   - Required sections check (pre-checks, steps, rollback, monitoring, escalation)
   - Placeholder cleanup verification
   - Human-in-the-loop review for actionable accuracy
4. **End-to-End Testing**: Integration tests in `runbook-agent/test_*.py`

## Performance Characteristics

| Aspect | Notes |
|--------|-------|
| **Risk Scoring Latency** | <500ms (model inference only); ~2-5s with LLM reasoning |
| **Runbook Generation Latency** | ~3-10s (dominated by LLM call; retrieval <100ms, enrichment <200ms) |
| **Model Accuracy** | Depends on training data quality; typically 75-90% on holdout set |
| **Retrieval Precision** | Typically 80-95% for exact domain/change-type matches |
| **Throughput** | Single-threaded: ~10 CRs/min; horizontally scalable via Kafka consumer groups |
| **Operational Monitoring** | Track model drift, retrieval success rate, human edit rates, rollback events |

## Typical Business Use Cases

### Risk Agent
- **Pre-change approval**: Score incoming CRs before CAB review; flag high-risk changes for extra scrutiny
- **Trend analysis**: Track risk trends over time; identify high-risk change patterns (time of day, asset type, domain)
- **Predictive analytics**: Forecast blast radius and rollback likelihood before execution

### Runbook Agent
- **Day-2 operations**: Automated runbook generation for standard changes; operators focus on exceptions
- **Knowledge capture**: Runbooks serve as living documentation of best practices and organizational standards
- **Compliance & audit**: Audit trail of all runbook generation decisions, sources, and modifications

## Operational Governance

### Human-in-the-Loop
- **Risk Assessment**: Model scores are decision-support tools, not sole decision-makers. Human CAB review remains mandatory until production monitoring is mature.
- **Runbook Generation**: Operators should review and approve generated runbooks before execution, especially for high-risk changes.

### Data Governance
- Scrub sensitive fields (PII, credentials, internal IP ranges) before ingesting data
- Access-control historical datasets; log all queries and model uses
- Version all training data; maintain audit trail of model versions and retraining events

### Logging & Audit
- Log all CR inputs, risk assessments, runbook generations, and LLM outputs
- Persist logs to centralized system (e.g., ELK stack, Splunk)
- Enable post-mortem analysis and compliance reporting

## Getting Started (Developer Checklist)

1. **Clone the repository**:
   ```bash
   git clone <repo>
   cd python-agents-icm
   ```

2. **Set up virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   .\venv\Scripts\Activate.ps1  # Windows
   ```

3. **Install root dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Risk Agent** (see [risk-assessment/README.md](risk-assessment/README.md)):
   - Create MySQL database
   - Initialize schema: `python -m risk-assessment.persistence.init_db`
   - Verify API: `GET http://localhost:9010/health`

5. **Set up Runbook Agent** (see [runbook-agent/README.md](runbook-agent/README.md)):
   - Seed ChromaDB: synthetic_runbooks.csv is auto-loaded on first startup
   - Verify API: `GET http://localhost:8101/health`

6. **Start Kafka** (optional, for event-driven mode):
   ```bash
   cd risk-assessment
   docker-compose up -d
   ```

7. **Run manual validation tests**:
   ```bash
   cd runbook-agent
   python test_scenarios.py
   ```

## Recommended Next Steps (Product Roadmap)

### Immediate (v1)
- [ ] Operationalize training data with versioning and refresh schedules
- [ ] Add production-grade feature stores and vector DB (managed Pinecone, Weaviate)
- [ ] Implement automated evaluation dashboards (model performance, runbook quality metrics)
- [ ] Add support for additional LLM providers (OpenAI, Azure OpenAI)

### Medium-term (v2)
- [ ] Multi-tenant support with tenant-specific models and runbooks
- [ ] Fine-tune LLM models on organizational runbooks for better domain adaptation
- [ ] Real-time model monitoring (drift detection, prediction confidence tracking)
- [ ] Automated rollback recommendation based on risk thresholds

### Long-term (v3)
- [ ] Closed-loop feedback: ingest actual execution outcomes to retrain models
- [ ] Cross-domain runbook generation (not just network changes)
- [ ] Integration with external incident management systems (PagerDuty, etc.)
- [ ] Cost optimization: recommend cheapest execution time windows based on risk/SLA trade-offs
