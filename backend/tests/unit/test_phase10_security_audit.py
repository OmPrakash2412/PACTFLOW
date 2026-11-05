import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store
from app.utils.security_validators import validate_safe_url
from app.security.auth import decode_access_token


def test_ssrf_protection_validator():
    """
    SECURITY AUDIT TEST: Validates that SSRF protection strictly blocks internal,
    loopback, link-local metadata, and non-HTTP protocols.
    """
    # 1. Blocked schemes
    is_safe, msg = validate_safe_url("file:///etc/passwd")
    assert is_safe is False
    assert "Prohibited URL scheme" in msg

    is_safe, msg = validate_safe_url("ftp://internal.server/data")
    assert is_safe is False

    # 2. Blocked loopback / localhost
    is_safe, msg = validate_safe_url("http://localhost:8000/api")
    assert is_safe is False
    assert "restricted" in msg.lower() or "blocked" in msg.lower()

    is_safe, msg = validate_safe_url("http://127.0.0.1:9000")
    assert is_safe is False
    assert "loopback" in msg.lower() or "blocked" in msg.lower()

    # 3. Blocked cloud metadata service (AWS/GCP/Azure)
    is_safe, msg = validate_safe_url("http://169.254.169.254/latest/meta-data/")
    assert is_safe is False
    assert "blocked" in msg.lower()

    # 4. Blocked private IP ranges
    is_safe, msg = validate_safe_url("http://192.168.1.1/admin")
    assert is_safe is False
    assert "private" in msg.lower() or "blocked" in msg.lower()

    is_safe, msg = validate_safe_url("http://10.0.0.5:5432")
    assert is_safe is False
    assert "private" in msg.lower() or "blocked" in msg.lower()

    # 5. Legitimate public URLs must be allowed
    is_safe, msg = validate_safe_url("https://staging.pactflow.io/demo")
    assert is_safe is True

    is_safe, msg = validate_safe_url("https://storage.googleapis.com/bucket/report.pdf")
    assert is_safe is True


@pytest.mark.asyncio
async def test_ssrf_rejection_on_deliverable_submission():
    """
    INTEGRATION SECURITY TEST: Submitting deliverables with loopback or metadata URLs
    must be rejected with HTTP 400 Bad Request.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        reg_res = await client.post("/api/auth/register", json={
            "email": f"ssrf_user_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Password123!",
            "full_name": "SSRF Auditor",
            "role": "freelancer"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create milestone
        proj_id = f"proj-{uuid.uuid4().hex[:8]}"
        m_id = f"m-ssrf-{uuid.uuid4().hex[:8]}"
        db_store.projects[proj_id] = {
            "id": proj_id,
            "title": "SSRF Security Target",
            "budget": Decimal("5000.00"),
            "currency": "USD",
            "client_id": "seed-client",
            "status": "active",
            "created_at": "2026-11-05T00:00:00Z"
        }
        db_store.milestones[m_id] = {
            "id": m_id,
            "project_id": proj_id,
            "sequence_order": 1,
            "title": "SSRF Milestone",
            "amount": Decimal("2500.00"),
            "currency": "USD",
            "status": "pending",
            "acceptance_criteria": ["Deploy endpoint"],
            "created_at": "2026-11-05T00:00:00Z",
            "updated_at": "2026-11-05T00:00:00Z"
        }

        # Attempt to exploit SSRF via cloud metadata demo_url
        bad_sub = await client.post("/api/deliverables/submit", json={
            "milestone_id": m_id,
            "title": "Malicious Deliverable",
            "description": "Attempting SSRF against cloud provider metadata",
            "file_urls": ["https://storage.pactflow.io/sample.pdf"],
            "demo_url": "http://169.254.169.254/latest/meta-data/",
            "notes": "Testing SSRF barrier"
        }, headers=headers)
        assert bad_sub.status_code == 400
        assert "SSRF Protection" in bad_sub.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_replay_and_idempotency_defense():
    """
    CRITICAL SECURITY TEST: Verifies that PayPal webhook replay attacks or network retries
    do NOT result in duplicate payment persistence or duplicate ledger events.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create approved milestone & invoice
        proj_id = f"wh-proj-{uuid.uuid4().hex[:8]}"
        m_id = f"wh-m-{uuid.uuid4().hex[:8]}"
        inv_id = f"wh-inv-{uuid.uuid4().hex[:8]}"
        paypal_inv_id = f"INV2-SEC-{uuid.uuid4().hex[:8].upper()}"

        db_store.projects[proj_id] = {
            "id": proj_id,
            "title": "Webhook Idempotency Target",
            "budget": Decimal("3000.00"),
            "currency": "USD",
            "client_id": "client-id",
            "status": "active"
        }
        db_store.milestones[m_id] = {
            "id": m_id,
            "project_id": proj_id,
            "title": "Security Invoiced Milestone",
            "amount": Decimal("3000.00"),
            "currency": "USD",
            "status": "invoiced",
            "created_at": "2026-11-05T00:00:00Z",
            "updated_at": "2026-11-05T00:00:00Z"
        }
        db_store.invoices[inv_id] = {
            "id": inv_id,
            "milestone_id": m_id,
            "project_id": proj_id,
            "paypal_invoice_id": paypal_inv_id,
            "status": "SENT",
            "amount": Decimal("3000.00"),
            "currency": "USD",
            "created_at": "2026-11-05T00:00:00Z"
        }

        webhook_event_id = f"WH-SEC-{uuid.uuid4().hex[:12].upper()}"
        webhook_body = {
            "id": webhook_event_id,
            "event_type": "INVOICING.INVOICE.PAID",
            "resource": {
                "id": paypal_inv_id,
                "status": "PAID",
                "capture_id": "CAP-SEC-9999",
                "amount": {"currency_code": "USD", "value": "3000.00"}
            }
        }

        initial_payments_count = len(db_store.payments)
        initial_ledger_count = len(db_store.trust_events)

        # First delivery: must succeed and persist payment
        wh1 = await client.post("/api/webhooks/paypal", json=webhook_body)
        assert wh1.status_code == 200
        assert wh1.json()["status"] == "success"
        assert len(db_store.payments) == initial_payments_count + 1
        assert len(db_store.trust_events) == initial_ledger_count + 1
        assert db_store.milestones[m_id]["status"] == "paid"

        # Duplicate delivery: must be intercepted idempotently without creating duplicate rows
        wh2 = await client.post("/api/webhooks/paypal", json=webhook_body)
        assert wh2.status_code == 200
        assert "already processed" in wh2.json()["message"].lower()

        # Payments table and Trust Ledger must NOT have duplicate entries
        assert len(db_store.payments) == initial_payments_count + 1
        assert len(db_store.trust_events) == initial_ledger_count + 1


def test_jwt_algorithm_enforcement():
    """
    SECURITY AUDIT TEST: Verifies that arbitrary unverified tokens or algorithm 'none'
    tokens cannot bypass authentication.
    """
    invalid_token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9."
    payload = decode_access_token(invalid_token)
    assert payload is None
