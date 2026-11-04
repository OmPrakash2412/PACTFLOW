import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store
from app.utils.hashing import calculate_event_hash, GENESIS_HASH, verify_chain
from app.agents.payment_coordinator import payment_coordinator


@pytest.mark.asyncio
async def test_trust_ledger_cryptographic_integrity_and_tamper_detection():
    """
    CRITICAL CRYPTOGRAPHIC AUDIT TEST:
    1. Records multiple real events for a project.
    2. Proves that verify_chain succeeds on the genuine chain.
    3. Simulates unauthorized database record alteration (tampering with payload).
    4. Proves that verification immediately FAILS and flags tamper_detected.
    """
    proj_id = f"test-p7-tamper-{uuid.uuid4().hex[:8]}"

    # Event 1: Project created
    e1 = db_store.record_trust_event(
        project_id=proj_id,
        event_type="PROJECT_CREATED",
        payload={"title": "Encrypted Vault Project", "budget": "10000.00"},
        actor_id="user-1"
    )
    assert e1["prev_hash"] == GENESIS_HASH
    assert e1["sequence_number"] == 1

    # Event 2: Agreement accepted
    e2 = db_store.record_trust_event(
        project_id=proj_id,
        event_type="AGREEMENT_ACCEPTED",
        payload={"version": 1, "status": "accepted"},
        actor_id="user-1"
    )
    assert e2["prev_hash"] == e1["current_hash"]
    assert e2["sequence_number"] == 2

    # Event 3: Deliverable submitted
    e3 = db_store.record_trust_event(
        project_id=proj_id,
        event_type="DELIVERABLE_SUBMITTED",
        payload={"milestone_id": "m1", "title": "Core Crypto Engine"},
        actor_id="user-2"
    )
    assert e3["prev_hash"] == e2["current_hash"]
    assert e3["sequence_number"] == 3

    # Genuine chain verification must succeed
    assert db_store.verify_ledger(project_id=proj_id) is True

    # Tampering test: Malicious actor mutates payload of event 2 in database
    corrupted_event = next(e for e in db_store.trust_events if e["id"] == e2["id"])
    original_payload = corrupted_event["payload"]
    corrupted_event["payload"] = {"version": 1, "status": "FRAUDULENT_MUTATION"}

    # Verification MUST detect tampering and return False
    assert db_store.verify_ledger(project_id=proj_id) is False

    # Restore original payload
    corrupted_event["payload"] = original_payload
    assert db_store.verify_ledger(project_id=proj_id) is True


@pytest.mark.asyncio
async def test_payment_coordinator_guidance_and_boundaries():
    """
    FINANCIAL INTEGRATION TEST:
    Verifies that Payment Coordinator synthesizes project, milestone, and invoice
    states accurately without exceeding its advisory authority.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        reg_res = await client.post("/api/auth/register", json={
            "email": f"coord_user_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Password123!",
            "full_name": "Coordinator Tester",
            "role": "client"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create project with budget $10,000
        proj_res = await client.post("/api/projects", json={
            "title": "Autonomous Drone Fleet Controller",
            "description": "High-concurrency IoT telemetry backend.",
            "budget": 10000.00,
            "currency": "USD"
        }, headers=headers)
        proj_id = proj_res.json()["id"]

        # Add 3 milestones: m1 paid ($3,000), m2 submitted ($4,000), m3 pending ($3,000)
        m1_id = f"m1-{uuid.uuid4().hex[:6]}"
        m2_id = f"m2-{uuid.uuid4().hex[:6]}"
        m3_id = f"m3-{uuid.uuid4().hex[:6]}"

        db_store.milestones[m1_id] = {
            "id": m1_id,
            "project_id": proj_id,
            "sequence_order": 1,
            "title": "Telemetry Protocols & Ground Station",
            "amount": Decimal("3000.00"),
            "currency": "USD",
            "status": "paid",
            "created_at": "2026-11-05T00:00:00Z",
            "updated_at": "2026-11-05T00:00:00Z"
        }
        db_store.milestones[m2_id] = {
            "id": m2_id,
            "project_id": proj_id,
            "sequence_order": 2,
            "title": "Real-time Mesh Communication Service",
            "amount": Decimal("4000.00"),
            "currency": "USD",
            "status": "submitted",
            "created_at": "2026-11-05T00:00:00Z",
            "updated_at": "2026-11-05T00:00:00Z"
        }
        db_store.milestones[m3_id] = {
            "id": m3_id,
            "project_id": proj_id,
            "sequence_order": 3,
            "title": "Load Balancing & Security Audits",
            "amount": Decimal("3000.00"),
            "currency": "USD",
            "status": "pending",
            "created_at": "2026-11-05T00:00:00Z",
            "updated_at": "2026-11-05T00:00:00Z"
        }

        # Query Payment Coordinator API
        coord_res = await client.get(f"/api/ai/coordinator/{proj_id}", headers=headers)
        assert coord_res.status_code == 200
        data = coord_res.json()

        assert data["total_budget"] == "$10000.00"
        assert data["paid_amount"] == "$3000.00"
        assert data["pending_amount"] == "$7000.00"
        assert data["settlement_progress_percentage"] == 30.0
        assert data["overall_health"] == "action_required"

        # Client action items must reflect pending review on m2
        assert any("review" in act.lower() or "approve" in act.lower() for act in data["client_next_actions"])
        
        # Advisory disclaimer must be present
        assert "not hold escrow" in data["advisory_disclaimer"].lower()
        assert len(data["milestones"]) == 3
