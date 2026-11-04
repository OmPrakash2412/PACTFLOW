import logging
from typing import Dict, Any, Optional
from ..config import settings
from .client import PayPalClient, paypal_client
from .schemas import WebhookVerifyRequest, WebhookVerifyResponse

logger = logging.getLogger(__name__)


class PayPalWebhookService:
    def __init__(self, client: Optional[PayPalClient] = None, webhook_id: Optional[str] = None):
        self._client = client or paypal_client
        self._webhook_id = webhook_id or settings.PAYPAL_WEBHOOK_ID

    async def verify_signature(
        self,
        headers: Dict[str, str],
        raw_body: Dict[str, Any]
    ) -> bool:
        """
        Authoritatively verifies PayPal Webhook signature via PayPal REST API:
        POST /v1/notifications/verify-webhook-signature
        """
        # Extract headers (case-insensitive)
        headers_lower = {k.lower(): v for k, v in headers.items()}
        auth_algo = headers_lower.get("paypal-auth-algo")
        cert_url = headers_lower.get("paypal-cert-url")
        transmission_id = headers_lower.get("paypal-transmission-id")
        transmission_sig = headers_lower.get("paypal-transmission-sig")
        transmission_time = headers_lower.get("paypal-transmission-time")

        if not all([auth_algo, cert_url, transmission_id, transmission_sig, transmission_time]):
            logger.warning("Missing PayPal transmission verification headers.")
            return False

        verify_payload = WebhookVerifyRequest(
            auth_algo=auth_algo,
            cert_url=cert_url,
            transmission_id=transmission_id,
            transmission_sig=transmission_sig,
            transmission_time=transmission_time,
            webhook_id=self._webhook_id,
            webhook_event=raw_body
        )

        try:
            response = await self._client.request(
                method="POST",
                path="/v1/notifications/verify-webhook-signature",
                json_data=verify_payload.model_dump()
            )
            if response.status_code != 200:
                logger.error(f"PayPal webhook verification failed ({response.status_code}): {response.text}")
                return False

            result = response.json()
            status = result.get("verification_status")
            return status == "SUCCESS"
        except Exception as e:
            logger.error(f"Error calling PayPal webhook verification endpoint: {e}")
            return False


paypal_webhook_service = PayPalWebhookService()

