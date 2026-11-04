import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock
from app.paypal.invoices import PayPalInvoiceService
from app.paypal.client import PayPalClient
from app.paypal.schemas import InvoiceCreateRequest, InvoiceDetail, InvoiceRecipient, BillingInfo, InvoiceItem, CurrencyAmount


@pytest.mark.asyncio
async def test_paypal_create_invoice_success():
    mock_client = MagicMock(spec=PayPalClient)
    mock_resp = MagicMock()
    mock_resp.status_code = 201
    mock_resp.json.return_value = {
        "id": "INV2-TEST-1234-ABCD",
        "status": "DRAFT",
        "detail": {"invoice_number": "PF-001", "currency_code": "USD"},
        "links": [
            {"rel": "self", "href": "https://api-m.sandbox.paypal.com/v2/invoicing/invoices/INV2-TEST-1234-ABCD", "method": "GET"},
            {"rel": "send", "href": "https://api-m.sandbox.paypal.com/v2/invoicing/invoices/INV2-TEST-1234-ABCD/send", "method": "POST"}
        ]
    }
    mock_client.request = AsyncMock(return_value=mock_resp)

    service = PayPalInvoiceService(client=mock_client)
    req = InvoiceCreateRequest(
        detail=InvoiceDetail(invoice_number="PF-001", currency_code="USD"),
        primary_recipients=[InvoiceRecipient(billing_info=BillingInfo(email_address="client@example.com"))],
        items=[InvoiceItem(name="Milestone 1", unit_amount=CurrencyAmount(currency_code="USD", value="1500.00"))]
    )

    created = await service.create_invoice(req)
    assert created.id == "INV2-TEST-1234-ABCD"
    assert created.status == "DRAFT"
    mock_client.request.assert_called_once()


@pytest.mark.asyncio
async def test_paypal_send_invoice_and_hosted_url():
    mock_client = MagicMock(spec=PayPalClient)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.content = b'{"links":[{"rel":"payer-view","href":"https://www.sandbox.paypal.com/invoice/p/#INV2-TEST-1234-ABCD","method":"GET"}]}'
    mock_resp.json.return_value = {
        "links": [
            {"rel": "payer-view", "href": "https://www.sandbox.paypal.com/invoice/p/#INV2-TEST-1234-ABCD", "method": "GET"}
        ]
    }
    mock_client.request = AsyncMock(return_value=mock_resp)

    service = PayPalInvoiceService(client=mock_client)
    send_result = await service.send_invoice("INV2-TEST-1234-ABCD")
    assert send_result.hosted_payer_url == "https://www.sandbox.paypal.com/invoice/p/#INV2-TEST-1234-ABCD"
