/**
 * StudyMate AI - API Service
 * Handles communication with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Send a message to StudyMate AI backend
 * @param {string} conversationId 
 * @param {string} message 
 * @returns {Promise<{conversation_id: string, response: string}>}
 */
export async function sendChatMessage(conversationId, message) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 422) {
        throw new Error(errorData.detail?.[0]?.msg || 'Message ou identifiant de conversation invalide.');
      } else if (response.status >= 500) {
        throw new Error('Le service IA est momentanément indisponible. Réessayez dans quelques instants.');
      } else {
        throw new Error(errorData.detail || 'Une erreur est survenue lors de la communication.');
      }
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
    }
    throw error;
  }
}

/**
 * Reset conversation history on the backend
 * @param {string} conversationId 
 * @returns {Promise<{conversation_id: string, message: string}>}
 */
export async function resetConversation(conversationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.warn(`Could not reset conversation ${conversationId} on server`);
    }
    return await response.json().catch(() => ({}));
  } catch (err) {
    console.warn('Network error while resetting conversation on backend:', err);
    return {};
  }
}

/**
 * Check backend health status
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    return false;
  } catch {
    return false;
  }
}
