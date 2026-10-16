"""Tests for conversation state, history persistence, reset, and session isolation."""

from unittest.mock import AsyncMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.memory import memory_manager
from app.routes.chat import get_ai_service


@pytest.fixture(autouse=True)
def reset_memory():
    """Ensure clean memory state before and after each test."""
    memory_manager.clear_all()
    yield
    memory_manager.clear_all()


@pytest.fixture
def mock_ai():
    """Create a mock for XAIService that produces deterministic answers."""
    mock = AsyncMock()
    mock.generate_response = AsyncMock(
        side_effect=lambda messages, **kwargs: f"Réponse simulée pour: {messages[-1]['content']}"
    )
    return mock


def test_conversation_history_creation(mock_ai):
    """Test that a conversation creates history entries for user and assistant."""
    app.dependency_overrides[get_ai_service] = lambda: mock_ai
    client = TestClient(app)

    conv_id = "test-conv-creation"
    response = client.post(
        "/chat",
        json={"conversation_id": conv_id, "message": "Qu'est-ce qu'une variable ?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == conv_id
    assert "Réponse simulée pour: Qu'est-ce qu'une variable ?" in data["response"]

    # Verify memory contains the interaction
    history = memory_manager.get_history(conv_id)
    assert len(history) == 2
    assert history[0] == {"role": "user", "content": "Qu'est-ce qu'une variable ?"}
    assert history[1]["role"] == "assistant"

    # Send second message in same conversation
    response2 = client.post(
        "/chat",
        json={"conversation_id": conv_id, "message": "Donne un exemple en Python."},
    )
    assert response2.status_code == 200
    history_after = memory_manager.get_history(conv_id)
    assert len(history_after) == 4

    app.dependency_overrides.clear()


def test_conversation_reset(mock_ai):
    """Test DELETE /chat/{conversation_id} resets the conversation history."""
    app.dependency_overrides[get_ai_service] = lambda: mock_ai
    client = TestClient(app)

    conv_id = "test-conv-reset"
    # Seed a message
    client.post(
        "/chat",
        json={"conversation_id": conv_id, "message": "Bonjour StudyMate"},
    )
    assert len(memory_manager.get_history(conv_id)) == 2

    # Reset
    delete_resp = client.delete(f"/chat/{conv_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["conversation_id"] == conv_id
    assert delete_resp.json()["message"] == "Conversation reset successfully"

    # Verify history is now empty
    assert len(memory_manager.get_history(conv_id)) == 0

    app.dependency_overrides.clear()


def test_conversations_isolation(mock_ai):
    """Test that conversation_A and conversation_B have strictly isolated histories."""
    app.dependency_overrides[get_ai_service] = lambda: mock_ai
    client = TestClient(app)

    conv_a = "conversation_A"
    conv_b = "conversation_B"

    # Send messages to conversation_A
    client.post("/chat", json={"conversation_id": conv_a, "message": "Message pour A 1"})
    client.post("/chat", json={"conversation_id": conv_a, "message": "Message pour A 2"})

    # Send messages to conversation_B
    client.post("/chat", json={"conversation_id": conv_b, "message": "Message pour B 1"})

    history_a = memory_manager.get_history(conv_a)
    history_b = memory_manager.get_history(conv_b)

    # Verify lengths
    assert len(history_a) == 4  # 2 user + 2 assistant
    assert len(history_b) == 2  # 1 user + 1 assistant

    # Verify content isolation
    contents_a = [m["content"] for m in history_a]
    contents_b = [m["content"] for m in history_b]

    assert "Message pour A 1" in contents_a
    assert "Message pour A 2" in contents_a
    assert "Message pour B 1" not in contents_a

    assert "Message pour B 1" in contents_b
    assert "Message pour A 1" not in contents_b

    # Resetting A does not affect B
    client.delete(f"/chat/{conv_a}")
    assert len(memory_manager.get_history(conv_a)) == 0
    assert len(memory_manager.get_history(conv_b)) == 2

    app.dependency_overrides.clear()


def test_reset_nonexistent_conversation():
    """Test resetting a conversation that does not exist returns 200 gracefully."""
    client = TestClient(app)
    response = client.delete("/chat/non-existent-id")
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == "non-existent-id"
    assert data["message"] == "Conversation reset successfully"
