from fastapi.testclient import TestClient
from agent.main import app


def test_evaluate_endpoint() -> None:
    client = TestClient(app)
    payload = {
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
                "alert_threshold": 85.0,
            }
        ],
    }

    response = client.post("/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cr_id"] == payload["cr_id"]
    assert data["asset_id"] == payload["asset_id"]
    assert data["severity"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert isinstance(data["confidence"], float)
    assert data["anomalous_metrics"]
    assert "detected_at" in data
