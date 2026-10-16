"""Pydantic data models for StudyMate AI API."""

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    """Request model for sending a message to StudyMate AI."""

    conversation_id: str = Field(
        ...,
        description="Identifiant unique de la conversation",
        examples=["conv-abc-123"],
    )
    message: str = Field(
        ...,
        description="Message de l'étudiant à destination du tuteur IA",
        examples=["Explique-moi ce qu'est une fonction en Python."],
    )

    @field_validator("conversation_id")
    @classmethod
    def validate_conversation_id(cls, value: str) -> str:
        """Ensure conversation_id is not empty or whitespace-only."""
        stripped = value.strip()
        if not stripped:
            raise ValueError("L'identifiant de conversation (conversation_id) ne peut pas être vide.")
        return stripped

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        """Ensure message is not empty or whitespace-only."""
        stripped = value.strip()
        if not stripped:
            raise ValueError("Le message ne peut pas être vide ou composé uniquement d'espaces.")
        return stripped


class ChatResponse(BaseModel):
    """Response model returning the assistant's answer."""

    conversation_id: str = Field(
        ...,
        description="Identifiant unique de la conversation",
    )
    response: str = Field(
        ...,
        description="Réponse pédagogique générée par StudyMate AI",
    )


class HealthResponse(BaseModel):
    """Response model for health check route."""

    status: str = Field(
        default="ok",
        description="État du service",
    )
    service: str = Field(
        default="StudyMate AI",
        description="Nom du service",
    )


class ResetResponse(BaseModel):
    """Response model when resetting a conversation."""

    conversation_id: str = Field(
        ...,
        description="Identifiant de la conversation réinitialisée",
    )
    message: str = Field(
        default="Conversation reset successfully",
        description="Message de confirmation de la réinitialisation",
    )
