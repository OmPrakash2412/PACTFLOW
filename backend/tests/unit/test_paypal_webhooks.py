import pytest
from unittest.mock import AsyncMock, MagicMock
from app.paypal.webhooks import PayPalWebhookService
from app.paypal.client import PayPalClient


@pytest.mark.asyncio
async def test_webhook_signature_verification_success():
    mock_client = MagicMock(spec=PayPalClient)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"verification_status": "SUCCESS"}
    mock_client.request = AsyncMock(return_value=mock_resp)

    service = PayPalWebhookService(client=mock_client, webhook_id="WH-12345")
    headers = {
        "paypal-auth-algo": "SHA256withRSA",
        "paypal-cert-url": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123",
        "paypal-transmission-id": "trans-123",
        "paypal-transmission-sig": "sig-abc-123",
        "paypal-transmission-time": "2026-11-05T00:00:00Z"
    }
    payload = {"id": "WH-EV-123", "event_type": "INVOICING.INVOICE.PAID"}

    verified = await service.verify_signature(headers, payload)
    assert verified is True


@pytest.mark.asyncio
async def test_webhook_signature_verification_failure():
    mock_client = MagicMock(spec=PayPalClient)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"verification_status": "FAILURE"}
    mock_client.request = AsyncMock(return_value=mock_resp)

    service = PayPalWebhookService(client=mock_client, webhook_id="WH-12345")
    headers = {
        "paypal-auth-algo": "SHA256withRSA",
        "paypal-cert-url": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123",
        "paypal-transmission-id": "trans-123",
        "paypal-transmission-sig": "tampered-signature",
        "paypal-transmission-time": "2026-11-05T00:00:00Z"
    }
    payload = {"id": "WH-EV-123", "event_type": "INVOICING.INVOICE.PAID"}

    verified = await service.verify_signature(headers, payload)
    assert verified is False


@pytest.mark.asyncio
async def test_webhook_missing_headers():
    service = PayPalWebhookService(webhook_id="WH-12345")
    # Incomplete headers
    headers = {"content-type": "application/json"}
    verified = await service.verify_signature(headers, {"id": "test"})
    assert verified is False
