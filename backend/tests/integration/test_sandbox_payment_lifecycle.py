import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store


@pytest.mark.asyncio
async def test_full_sandbox_payment_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Check existing seeded approved milestone m2
        m2 = db_store.milestones.get("m2222222-2222-4222-8222-222222222222")
        assert m2 is not None
        assert m2["status"] == "approved"

        # Step 2: Generate PayPal invoice for approved milestone
        inv_payload = {"milestone_id": m2["id"]}
        resp = await client.post("/api/invoices/generate", json=inv_payload)
        assert resp.status_code == 200
        inv_data = resp.json()
        
        assert inv_data["status"] == "SENT"
        assert inv_data["paypal_invoice_id"] is not None
        assert "sandbox.paypal.com" in inv_data["paypal_hosted_url"]
        paypal_inv_id = inv_data["paypal_invoice_id"]

        # Milestone should now be invoiced
        assert m2["status"] == "invoiced"

        # Step 3: Deliver authoritative PayPal webhook event: INVOICING.INVOICE.PAID
        webhook_event_id = f"WH-TEST-{uuid.uuid4().hex[:12].upper()}"
        webhook_payload = {
            "id": webhook_event_id,
            "event_version": "1.0",
            "create_time": "2026-11-05T01:00:00Z",
            "resource_type": "invoices",
            "event_type": "INVOICING.INVOICE.PAID",
            "summary": f"Invoice {paypal_inv_id} was paid via PayPal Sandbox",
            "resource": {
                "id": paypal_inv_id,
                "status": "PAID",
                "capture_id": f"CAP-SANDBOX-{uuid.uuid4().hex[:8].upper()}",
                "amount": {"currency_code": "USD", "value": "2500.00"}
            }
        }

        # First webhook delivery
        wh_resp1 = await client.post(
            "/api/webhooks/paypal",
            json=webhook_payload,
            headers={"Content-Type": "application/json"}
        )
        assert wh_resp1.status_code == 200
        wh_result = wh_resp1.json()
        assert wh_result["status"] == "success"

        # Step 4: Verify DB persistence & state mutations
        assert m2["status"] == "paid"
        updated_inv = db_store.invoices.get(inv_data["id"])
        assert updated_inv["status"] == "PAID"

        # Authoritative payment record created
        matched_payment = next((p for p in db_store.payments.values() if p["invoice_id"] == inv_data["id"]), None)
        assert matched_payment is not None
        assert matched_payment["status"] == "COMPLETED"
        assert matched_payment["amount"] == Decimal("2500.00")

        # Step 5: Test Webhook Idempotency (duplicate delivery)
        wh_resp2 = await client.post(
            "/api/webhooks/paypal",
            json=webhook_payload,
            headers={"Content-Type": "application/json"}
        )
        assert wh_resp2.status_code == 200
        assert "already processed" in wh_resp2.json()["message"]

        # Ensure no duplicate payment records created
        payment_count = sum(1 for p in db_store.payments.values() if p["invoice_id"] == inv_data["id"])
        assert payment_count == 1

        # Step 6: Verify Trust Ledger unbroken chain
        verify_resp = await client.get(f"/api/trust/verify/{m2['project_id']}")
        assert verify_resp.status_code == 200
        trust_status = verify_resp.json()
        assert trust_status["is_valid"] is True
        assert trust_status["tamper_detected"] is False
