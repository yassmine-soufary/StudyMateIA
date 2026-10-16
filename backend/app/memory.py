"""In-memory conversation history management for StudyMate AI."""

from typing import Dict, List


class ConversationMemoryManager:
    """Manages chat history isolated per conversation_id in memory."""

    def __init__(self) -> None:
        self._conversations: Dict[str, List[Dict[str, str]]] = {}

    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        """Return a copy of the history list for a conversation.

        Returns an empty list if the conversation does not exist yet.
        """
        return list(self._conversations.get(conversation_id, []))

    def add_message(self, conversation_id: str, role: str, content: str) -> None:
        """Append a message to the specified conversation's history."""
        if conversation_id not in self._conversations:
            self._conversations[conversation_id] = []
        self._conversations[conversation_id].append({"role": role, "content": content})

    def reset_conversation(self, conversation_id: str) -> bool:
        """Reset the conversation history for a given conversation_id.

        Returns True if the conversation existed and was reset, False if it was not found.
        """
        if conversation_id in self._conversations:
            self._conversations[conversation_id] = []
            return True
        return False

    def conversation_exists(self, conversation_id: str) -> bool:
        """Check if a conversation ID exists in memory."""
        return conversation_id in self._conversations

    def clear_all(self) -> None:
        """Clear all conversations (useful for testing)."""
        self._conversations.clear()


# Global singleton instance for the application
memory_manager = ConversationMemoryManager()
