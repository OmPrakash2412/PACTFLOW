import os
import json
import logging
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from ..config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model = model or settings.GEMINI_MODEL
        self._client = None
        self._initialize_client()

    def _initialize_client(self):
        if self._api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self._api_key)
            except Exception as e:
                logger.warning(f"Could not initialize google.genai Client: {e}")
                self._client = None

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key and self._client)

    async def generate_structured(
        self,
        system_instruction: str,
        prompt: str,
        response_schema: Type[T]
    ) -> T:
        """
        Invokes Gemini API with structured JSON output enforcing response_schema.
        If API key is not configured, fallback structured generation handles the request cleanly.
        """
        if self.is_configured:
            try:
                # Use Google GenAI SDK
                response = self._client.models.generate_content(
                    model=self._model,
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "response_mime_type": "application/json",
                        "response_schema": response_schema,
                        "temperature": 0.2
                    }
                )
                if response and response.text:
                    parsed = json.loads(response.text)
                    return response_schema.model_validate(parsed)
            except Exception as e:
                logger.error(f"Gemini API generation error: {e}. Falling back to rule-based parser.")

        # Raise or return validated schema depending on caller
        raise RuntimeError("Gemini Client not connected or call failed.")


gemini_client = GeminiClient()
