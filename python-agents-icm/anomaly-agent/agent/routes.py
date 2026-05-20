from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Any

from contracts.requests import EvaluateRequest
from contracts.responses import EvaluateResponse
from contracts.events import KPIEvent, AIEvent
from intelligence.anomaly_engine import AnomalyEngine
from agent.dependencies import attach_components

router = APIRouter()


def get_app_components(request: Request) -> Any:
    if not hasattr(request.app.state, "settings"):
        attach_components(request.app)
    return request.app.state


@router.get("/", summary="Root endpoint")
def root() -> JSONResponse:
    return JSONResponse({"service": "anomaly-agent", "status": "running"})


@router.get("/health", summary="Health check")
def health(app_components: Any = Depends(get_app_components)) -> JSONResponse:
    settings = app_components.settings
    redis_available = app_components.redis_cache.client is not None
    kafka_available = app_components.kafka_producer.producer is not None

    return JSONResponse(
        {
            "service": settings.app_name,
            "environment": settings.app_env,
            "redis_available": redis_available,
            "kafka_available": kafka_available,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }
    )


@router.post("/evaluate", response_model=EvaluateResponse, summary="Evaluate KPI anomaly")
def evaluate(request: EvaluateRequest, app_components: Any = Depends(get_app_components)) -> Any:
    anomaly_engine = AnomalyEngine()
    payload = request.model_dump()
    try:
        result = anomaly_engine.evaluate(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    summary = {
        "cr_id": result["cr_id"],
        "asset_id": result["asset_id"],
        "severity": result["severity"],
    }

    explanation, likely_cause = app_components.groq_reasoner.explain(summary, result["anomalous_metrics"])
    result["explanation"] = explanation
    result["likely_cause"] = likely_cause

    # Remove internal-only diagnostic fields from the API response
    result.pop("anomaly", None)

    kafka_payload = KPIEvent(
        cr_id=result["cr_id"],
        asset_id=result["asset_id"],
        detected_at=result["detected_at"],
        severity=result["severity"],
        anomalous_metrics=result["anomalous_metrics"],
        details={
            "confidence": result["confidence"],
            "isolation_forest_score": result["isolation_forest_score"],
        },
    ).model_dump()

    app_components.kafka_producer.send(app_components.settings.kafka_topic_kpi, kafka_payload)
    app_components.kafka_producer.send(
        app_components.settings.kafka_topic_ai,
        AIEvent(
            cr_id=result["cr_id"],
            asset_id=result["asset_id"],
            explanation=explanation,
            likely_cause=likely_cause,
            detected_at=result["detected_at"],
        ).model_dump(),
    )

    try:
        app_components.repository.save_event(result)
    except Exception:
        pass

    builder = app_components.response_builder
    return builder.build(result)
