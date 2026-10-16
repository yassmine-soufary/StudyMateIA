"""Unit tests for chat validation and request handling."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_empty_message_rejected():
    """Verify that an empty message string is rejected with HTTP 422."""
    payload = {"conversation_id": "test-conv-1", "message": ""}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422
    errors = response.json().get("detail", [])
    assert any("message" in str(err) for err in errors)


def test_whitespace_only_message_rejected():
    """Verify that a message containing only whitespaces is rejected with HTTP 422."""
    payload = {"conversation_id": "test-conv-2", "message": "    "}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422
    errors = response.json().get("detail", [])
    assert any("message" in str(err) for err in errors)


def test_empty_conversation_id_rejected():
    """Verify that an empty conversation_id is rejected with HTTP 422."""
    payload = {"conversation_id": "", "message": "Explique-moi Python"}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422
    errors = response.json().get("detail", [])
    assert any("conversation_id" in str(err) for err in errors)


def test_whitespace_only_conversation_id_rejected():
    """Verify that whitespace-only conversation_id is rejected with HTTP 422."""
    payload = {"conversation_id": "   ", "message": "Explique-moi Python"}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422
    errors = response.json().get("detail", [])
    assert any("conversation_id" in str(err) for err in errors)


def test_missing_fields_rejected():
    """Verify that missing required fields are rejected with HTTP 422."""
    response = client.post("/chat", json={})
    assert response.status_code == 422
