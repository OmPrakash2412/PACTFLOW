import uuid
from typing import Dict, Any, Optional
import httpx
from ..config import settings
from .oauth import PayPalOAuthService, paypal_oauth


class PayPalClient:
    def __init__(
        self,
        oauth_service: Optional[PayPalOAuthService] = None,
        base_url: Optional[str] = None
    ):
        self._oauth = oauth_service or paypal_oauth
        self._base_url = base_url or settings.paypal_base_url

    async def _get_headers(
        self,
        request_id: Optional[str] = None,
        prefer: Optional[str] = "return=representation"
    ) -> Dict[str, str]:
        token = await self._oauth.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "PayPal-Request-Id": request_id or str(uuid.uuid4())
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def request(
        self,
        method: str,
        path: str,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        prefer: Optional[str] = "return=representation"
    ) -> httpx.Response:
        url = f"{self._base_url}{path}" if path.startswith("/") else f"{self._base_url}/{path}"
        headers = await self._get_headers(request_id=request_id, prefer=prefer)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=url,
                json=json_data,
                params=params,
                headers=headers
            )

            # If token expired or unauthorized, refresh once and retry
            if response.status_code == 401:
                token = await self._oauth.get_access_token(force_refresh=True)
                headers["Authorization"] = f"Bearer {token}"
                response = await client.request(
                    method=method,
                    url=url,
                    json=json_data,
                    params=params,
                    headers=headers
                )

            return response


paypal_client = PayPalClient()

