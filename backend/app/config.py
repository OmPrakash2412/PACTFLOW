from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # PayPal Developer Sandbox
    PAYPAL_ENVIRONMENT: str = "sandbox"
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_WEBHOOK_ID: str = ""
    PAYPAL_SANDBOX_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    PAYPAL_LIVE_BASE_URL: str = "https://api-m.paypal.com"

    # Google Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Supabase (PostgreSQL & Auth)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    DATABASE_URL: Optional[str] = None

    # Security & JWT
    JWT_SECRET: str = "pactflow_hackathon_super_secure_jwt_secret_key_32bytes!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    @property
    def paypal_base_url(self) -> str:
        if self.PAYPAL_ENVIRONMENT.lower() == "production" or self.PAYPAL_ENVIRONMENT.lower() == "live":
            return self.PAYPAL_LIVE_BASE_URL
        return self.PAYPAL_SANDBOX_BASE_URL

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
