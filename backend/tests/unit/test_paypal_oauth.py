import pytest
import time
from unittest.mock import AsyncMock, patch, MagicMock
from app.paypal.oauth import PayPalOAuthService
from app.paypal.schemas import PayPalTokenResponse


@pytest.mark.asyncio
async def test_paypal_oauth_missing_credentials():
    service = PayPalOAuthService(client_id="", client_secret="", base_url="https://api-m.sandbox.paypal.com")
    with pytest.raises(ValueError, match="PayPal Client ID or Client Secret not configured"):
        await service.get_access_token()


@pytest.mark.asyncio
async def test_paypal_oauth_success_and_caching():
    service = PayPalOAuthService(
        client_id="test_client_id",
        client_secret="test_secret",
        base_url="https://api-m.sandbox.paypal.com"
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "scope": "https://uri.paypal.com/services/invoicing",
        "access_token": "A21AA_TEST_SANDBOX_TOKEN_12345",
        "token_type": "Bearer",
        "app_id": "APP-80W284485P519543T",
        "expires_in": 3600
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp

        # First fetch: should make HTTP call
        token1 = await service.get_access_token()
        assert token1 == "A21AA_TEST_SANDBOX_TOKEN_12345"
        assert mock_post.call_count == 1

        # Second fetch: should use cached token without additional network call
        token2 = await service.get_access_token()
        assert token2 == "A21AA_TEST_SANDBOX_TOKEN_12345"
        assert mock_post.call_count == 1

        # Force refresh: should make second network call
        token3 = await service.get_access_token(force_refresh=True)
        assert token3 == "A21AA_TEST_SANDBOX_TOKEN_12345"
        assert mock_post.call_count == 2


@pytest.mark.asyncio
async def test_paypal_oauth_failure_handling():
    service = PayPalOAuthService(
        client_id="invalid_client_id",
        client_secret="bad_secret",
        base_url="https://api-m.sandbox.paypal.com"
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.text = '{"error":"invalid_client","error_description":"Client Authentication failed"}'

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        with pytest.raises(RuntimeError, match="Failed to obtain PayPal OAuth token"):
            await service.get_access_token()
