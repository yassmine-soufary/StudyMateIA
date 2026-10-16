"""Service for interacting with xAI / Grok API."""

import logging
from typing import Dict, List, Optional
import httpx
from fastapi import HTTPException, status

from app.config import get_settings

logger = logging.getLogger(__name__)


class XAIService:
    """Handles communications with xAI / Grok chat completions endpoint."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        settings = get_settings()
        self.api_key = api_key if api_key is not None else settings.xai_api_key
        self.model = model if model is not None else settings.xai_model
        self.base_url = (base_url if base_url is not None else settings.xai_base_url).rstrip("/")
        self.timeout = timeout if timeout is not None else settings.xai_timeout

    def _resolve_endpoint_and_model(self) -> tuple[str, str]:
        """Determine actual endpoint and model based on API key format and config."""
        url = f"{self.base_url}/chat/completions"
        model = self.model

        # Smart adaptation: if user provided a Groq key (starts with 'gsk_') and default xAI URL
        if self.api_key.startswith("gsk_") and "api.x.ai" in self.base_url:
            url = "https://api.groq.com/openai/v1/chat/completions"
            if model.startswith("grok") or "grok" in model:
                model = "openai/gpt-oss-120b"

        return url, model

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
    ) -> str:
        """Send chat messages to the AI model and return the generated text.

        Raises HTTPException on error without leaking secrets or stack traces.
        """
        if not self.api_key or not self.api_key.strip():
            logger.error("xAI API key is missing.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="La clé API xAI n'est pas configurée dans l'environnement du serveur.",
            )

        endpoint, model_to_use = self._resolve_endpoint_and_model()

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model_to_use,
            "messages": messages,
            "temperature": temperature,
            "stream": False,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

                choices = data.get("choices")
                if not choices or not isinstance(choices, list):
                    logger.error("Invalid response format received from AI provider.")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Le fournisseur d'IA a retourné un format de réponse inattendu.",
                    )

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    logger.warning("Empty response content received from AI provider.")
                    return "Je n'ai pas pu formuler de réponse à cette demande."

                return content.strip()

        except httpx.TimeoutException:
            logger.error(f"Timeout ({self.timeout}s) while calling AI endpoint.")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Le délai d'attente pour la réponse de l'IA a expiré. Veuillez réessayer.",
            )
        except httpx.ConnectError:
            logger.error("Connection error to AI endpoint.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Impossible de contacter le service d'intelligence artificielle. Vérifiez la connexion réseau.",
            )
        except httpx.HTTPStatusError as exc:
            print("Erreur du fournisseur IA :", exc.response.text)
            status_code = exc.response.status_code
            logger.error(f"AI Provider returned HTTP {status_code}: {exc.response.text}")
            if status_code == 401:
                detail_msg = "Échec d'authentification auprès de l'API IA (clé API invalide ou expirée)."
            elif status_code == 429:
                detail_msg = "Quota de requêtes de l'API IA dépassé. Veuillez patienter un instant."
            else:
                detail_msg = f"Erreur retournée par le fournisseur d'IA (Code {status_code})."

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=detail_msg,
            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Unexpected error in XAIService: {str(exc)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la communication avec l'assistant.",
            )


# Default service instance
xai_service = XAIService()
