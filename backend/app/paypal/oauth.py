import asyncio
import time
from typing import Optional
import httpx
from ..config import settings
from .schemas import PayPalTokenResponse


class PayPalOAuthService:
    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        self._client_id = client_id if client_id is not None else settings.PAYPAL_CLIENT_ID
        self._client_secret = client_secret if client_secret is not None else settings.PAYPAL_CLIENT_SECRET
        self._base_url = base_url if base_url is not None else settings.paypal_base_url
        self._cached_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    @property
    def has_credentials(self) -> bool:
        return bool(self._client_id and self._client_secret)

    async def get_access_token(self, force_refresh: bool = False) -> str:
        """
        Retrieves a valid OAuth2 Bearer token from PayPal Sandbox.
        Caches the token and refreshes it 60 seconds before expiration.
        """
        now = time.time()
        if not force_refresh and self._cached_token and now < (self._token_expires_at - 60):
            return self._cached_token

        if not self.has_credentials:
            raise ValueError("PayPal Client ID or Client Secret not configured.")

        token_url = f"{self._base_url}/v1/oauth2/token"
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                token_url,
                auth=(self._client_id, self._client_secret),
                data={"grant_type": "client_credentials"},
                headers={"Accept": "application/json", "Accept-Language": "en_US"}
            )

            if response.status_code != 200:
                raise RuntimeError(
                    f"Failed to obtain PayPal OAuth token: status {response.status_code} - {response.text}"
                )

            token_data = PayPalTokenResponse.model_validate(response.json())
            self._cached_token = token_data.access_token
            self._token_expires_at = now + token_data.expires_in
            return self._cached_token


paypal_oauth_service = PayPalOAuthService()
paypal_oauth = paypal_oauth_service
