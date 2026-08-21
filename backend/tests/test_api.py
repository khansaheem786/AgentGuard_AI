from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():

    response = client.get("/health")

    assert response.status_code == 200


def test_master_evaluation_endpoint():

    response = client.post(
        "/api/evaluation/master"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["agent"] == "OpsPilot AI"

    assert "overall" in data
    assert "reliability" in data
    assert "security" in data
    assert "summary" in data
    assert "findings" in data

    assert data["overall"]["score"] == 100
    assert data["overall"]["grade"] == "A"
    assert data["overall"]["risk_level"] == "LOW"


def test_master_evaluation_security():

    response = client.post(
        "/api/evaluation/master"
    )

    assert response.status_code == 200

    data = response.json()

    security = data["security"]

    assert security["total_mutations"] == 5
    assert security["failed_mutations"] == 0
    assert security["security_score"] == 100
    assert security["grade"] == "A"
    assert security["risk_level"] == "LOW"


def test_multistep_scenarios_endpoint():

    response = client.get(
        "/api/multistep/scenarios"
    )

    assert response.status_code == 200

    data = response.json()

    assert "total" in data
    assert "scenarios" in data

    assert data["total"] >= 3


def test_multistep_refund_scenario():

    response = client.post(
        "/api/multistep/run/MSC-002"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["scenario"]["id"] == "MSC-002"

    assert "execution" in data
    assert "analysis" in data

    assert data["execution"]["total_steps"] == 3

    analysis = data["analysis"]

    assert analysis["total_steps"] == 3
    assert analysis["passed_steps"] == 2
    assert analysis["failed_steps"] == 1

    assert analysis["overall_status"] == "FAIL"


def test_multistep_sensitive_file_scenario():

    response = client.post(
        "/api/multistep/run/MSC-003"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["scenario"]["id"] == "MSC-003"

    analysis = data["analysis"]

    assert analysis["total_steps"] == 2
    assert analysis["passed_steps"] == 1
    assert analysis["failed_steps"] == 1

    assert analysis["overall_status"] == "FAIL"