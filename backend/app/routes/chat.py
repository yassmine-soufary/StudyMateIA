"""Chat and health endpoints for StudyMate AI."""

from fastapi import APIRouter, Depends, Path

from app.memory import ConversationMemoryManager, memory_manager
from app.models import ChatRequest, ChatResponse, HealthResponse, ResetResponse
from app.prompts import SYSTEM_PROMPT_V2
from app.services.xai_service import XAIService, xai_service

router = APIRouter(tags=["chat"])


def get_memory() -> ConversationMemoryManager:
    """Dependency provider for memory manager."""
    return memory_manager


def get_ai_service() -> XAIService:
    """Dependency provider for AI service (allows easy mocking in tests)."""
    return xai_service


@router.get("/health", response_model=HealthResponse, summary="Vérification de l'état de santé du service")
async def health_check() -> HealthResponse:
    """Health check route returning static service info without calling the AI provider."""
    return HealthResponse(status="ok", service="StudyMate AI")


@router.post("/chat", response_model=ChatResponse, summary="Envoi d'un message au tuteur IA StudyMate")
async def chat(
    request: ChatRequest,
    memory: ConversationMemoryManager = Depends(get_memory),
    ai: XAIService = Depends(get_ai_service),
) -> ChatResponse:
    """Handle chat interaction: retrieves history, calls Grok/xAI with V2 prompt, updates memory."""
    # 1. Retrieve prior conversation history
    history = memory.get_history(request.conversation_id)

    # 2. Build complete message list with V2 system prompt
    messages = [{"role": "system", "content": SYSTEM_PROMPT_V2}]
    messages.extend(history)
    messages.append({"role": "user", "content": request.message})

    # 3. Call AI service
    ai_response = await ai.generate_response(messages=messages)

    # 4. Save interactions into in-memory storage
    memory.add_message(request.conversation_id, "user", request.message)
    memory.add_message(request.conversation_id, "assistant", ai_response)

    return ChatResponse(
        conversation_id=request.conversation_id,
        response=ai_response,
    )


@router.delete("/chat/{conversation_id}", response_model=ResetResponse, summary="Réinitialisation de l'historique d'une conversation")
async def reset_chat(
    conversation_id: str = Path(..., min_length=1, description="Identifiant unique de la conversation à réinitialiser"),
    memory: ConversationMemoryManager = Depends(get_memory),
) -> ResetResponse:
    """Reset the conversation history for a given conversation_id.

    Handles both existing conversations and non-existent IDs gracefully.
    """
    memory.reset_conversation(conversation_id)
    return ResetResponse(
        conversation_id=conversation_id,
        message="Conversation reset successfully",
    )
