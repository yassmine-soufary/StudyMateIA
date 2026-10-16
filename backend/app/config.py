"""Configuration module for StudyMate AI."""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Determine root directory where .env might reside
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment and .env file."""

    # xAI / Grok API configuration
    xai_api_key: str = ""
    xai_model: str = "grok-4"
    xai_base_url: str = "https://api.x.ai/v1"
    xai_timeout: float = 30.0

    # Server configuration
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000

    # CORS configuration
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Retrieve cached application settings instance."""
    return Settings()
