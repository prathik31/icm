from fastapi.testclient import TestClient
from agent.main import app


def test_health_endpoint() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "anomaly-agent"
    assert "checked_at" in data
