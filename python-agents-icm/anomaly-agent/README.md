# Anomaly Agent

`anomaly-agent` is a production-grade telecom KPI anomaly detection microservice for the Intelligent Change Management platform.

## Architecture

- FastAPI service exposes `/`, `/health`, and `/evaluate`
- Z-score and Isolation Forest detectors identify anomalous KPI behavior
- Groq LLM provides AI-powered explanations and likely causes
- Redis caches baseline artifacts and fails gracefully when unavailable
- Kafka publishes anomaly and AI events and supports dead-letter topic failover
- SQLAlchemy/MySQL client is prepared for persistence

## Setup

1. Clone repository and change into `anomaly-agent`:

```bash
cd anomaly-agent
```

2. Create a Python 3.11 virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. Copy environment variables:

```bash
cp .env.example .env
```

5. Set `GROQ_API_KEY` if using Groq.

## Running locally

Start the FastAPI app:

```bash
uvicorn agent.main:app --host 0.0.0.0 --port 8000
```

Then visit Swagger UI:

```text
http://localhost:8000/docs
```

## Docker setup

Build and start all services:

```bash
docker-compose up --build
```

Service endpoints:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Redis: `localhost:6379`
- Kafka: `localhost:9092`

## Kafka topic creation

The service uses these topics:

- `kpi.events`
- `ai.events`
- `kpi.events.dlq`

The `docker-compose.yml` container uses Kafka broker `kafka:9092` and advertises `localhost:29092` for host access.

If you need to create topics manually, use Kafka CLI tools after Kafka is ready.

## Swagger usage

Open Swagger UI at `/docs` to inspect request and response models.

## Sample request

```json
POST /evaluate
{
  "cr_id": "CR-1234",
  "asset_id": "SITE-001",
  "window_start": "2026-05-19T08:00:00Z",
  "window_end": "2026-05-19T08:05:00Z",
  "metrics": [
    {
      "metric_name": "cpu_usage",
      "current_value": 95.0,
      "unit": "%",
      "baseline_mean": 45.0,
      "baseline_std": 8.0,
      "baseline_p95": 70.0,
      "alert_threshold": 85.0
    }
  ]
}
```

## Sample response

```json
{
  "detection_id": "uuid",
  "cr_id": "CR-1234",
  "asset_id": "SITE-001",
  "severity": "CRITICAL",
  "confidence": 0.95,
  "explanation": "Severe KPI degradation detected.",
  "likely_cause": "Potential overloaded router.",
  "isolation_forest_score": -0.23,
  "anomalous_metrics": [
    {
      "metric_name": "cpu_usage",
      "z_score": 6.25
    }
  ],
  "detected_at": "2026-05-19T18:05:11.123456+00:00"
}
```

## Troubleshooting

- If Redis is unavailable, the service still starts and the API remains functional.
- If Kafka is unavailable, event publishing is skipped while the API continues to respond.
- If Groq fails, the service returns a fallback explanation rather than crashing.
- Use logs from the container or local service to diagnose startup issues.

## Testing

Run the provided health check test:

```bash
pytest tests/test_health.py
```
