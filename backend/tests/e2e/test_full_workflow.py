import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store


@pytest.mark.asyncio
async def test_full_pactflow_end_to_end_workflow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register Client & Freelancer
        client_reg = await client.post("/api/auth/register", json={
            "email": f"client_{uuid.uuid4().hex[:6]}@test.com",
            "password": "SecurePassword123!",
            "full_name": "Test Client Owner",
            "role": "client"
        })
        assert client_reg.status_code == 200
        client_token = client_reg.json()["access_token"]
        client_headers = {"Authorization": f"Bearer {client_token}"}

        freelancer_reg = await client.post("/api/auth/register", json={
            "email": f"freelancer_{uuid.uuid4().hex[:6]}@test.com",
            "password": "SecurePassword123!",
            "full_name": "Test Lead Freelancer",
            "role": "freelancer"
        })
        assert freelancer_reg.status_code == 200
        freelancer_token = freelancer_reg.json()["access_token"]
        freelancer_headers = {"Authorization": f"Bearer {freelancer_token}"}

        # 2. Client Creates Project
        proj_resp = await client.post("/api/projects", json={
            "title": "Quantum AI Security Scanner",
            "description": "Build high-throughput static vulnerability scanner using Gemini and FastAPI.",
            "budget": 4000.00,
            "currency": "USD"
        }, headers=client_headers)
        assert proj_resp.status_code == 200
        project_id = proj_resp.json()["id"]

        # 3. Generate Agreement via Pact Architect
        agree_resp = await client.post("/api/agreements/generate", json={
            "project_id": project_id
        }, headers=client_headers)
        assert agree_resp.status_code == 200
        agreement_id = agree_resp.json()["id"]

        # 4. Client Accepts Agreement
        c_acc = await client.post(f"/api/agreements/{agreement_id}/accept", headers=client_headers)
        assert c_acc.status_code == 200
        assert c_acc.json()["is_client_accepted"] is True
        assert c_acc.json()["status"] == "pending_acceptance"

        # 5. Freelancer Accepts Agreement -> Agreement Becomes Accepted
        f_acc = await client.post(f"/api/agreements/{agreement_id}/accept", headers=freelancer_headers)
        assert f_acc.status_code == 200
        assert f_acc.json()["is_freelancer_accepted"] is True
        assert f_acc.json()["status"] == "accepted"

        # 6. Get Generated Milestones
        ms_resp = await client.get(f"/api/milestones/project/{project_id}", headers=client_headers)
        assert ms_resp.status_code == 200
        milestones = ms_resp.json()
        assert len(milestones) >= 2
        m1 = milestones[0]

        # 7. Freelancer Submits Deliverable
        deliv_resp = await client.post("/api/deliverables/submit", json={
            "milestone_id": m1["id"],
            "title": "Scanner Core Architecture and CI Runner",
            "description": "Committed schema migrations, container Dockerfile and automated integration test suites.",
            "file_urls": ["https://storage.pactflow.io/scanner_tests.log"],
            "demo_url": "https://staging-scanner.pactflow.io",
            "notes": "Passing 100% test assertions."
        }, headers=freelancer_headers)
        assert deliv_resp.status_code == 200
        deliv_id = deliv_resp.json()["id"]

        # 8. Check AI Verification Report
        rep_resp = await client.get(f"/api/deliverables/report/{deliv_id}", headers=client_headers)
        assert rep_resp.status_code == 200
        report = rep_resp.json()
        assert report["overall_verdict"] in ("satisfied", "uncertain")

        # 9. Client Approves Milestone
        approval_resp = await client.post("/api/deliverables/client-decision", json={
            "milestone_id": m1["id"],
            "action": "approve",
            "feedback": "Outstanding work, all test logs validated."
        }, headers=client_headers)
        assert approval_resp.status_code == 200

        # 10. Generate and Send PayPal Invoice
        inv_resp = await client.post("/api/invoices/generate", json={
            "milestone_id": m1["id"]
        }, headers=client_headers)
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()
        assert inv_data["status"] == "SENT"
        assert inv_data["paypal_hosted_url"] is not None

        # 11. Authoritative PayPal Webhook Event Simulation
        webhook_event_id = f"WH-E2E-{uuid.uuid4().hex[:12].upper()}"
        wh_resp = await client.post("/api/webhooks/paypal", json={
            "id": webhook_event_id,
            "event_type": "INVOICING.INVOICE.PAID",
            "resource": {
                "id": inv_data["paypal_invoice_id"],
                "status": "PAID",
                "capture_id": f"CAP-{uuid.uuid4().hex[:8].upper()}",
                "amount": {"currency_code": "USD", "value": str(m1["amount"])}
            }
        })
        assert wh_resp.status_code == 200

        # 12. Check Final Milestone and Invoice State
        m1_updated = await client.get(f"/api/milestones/{m1['id']}", headers=client_headers)
        assert m1_updated.status_code == 200
        assert m1_updated.json()["status"] == "paid"

        # 13. Verify Trust Ledger Integrity
        trust_resp = await client.get(f"/api/trust/verify/{project_id}", headers=client_headers)
        assert trust_resp.status_code == 200
        assert trust_resp.json()["is_valid"] is True
        assert trust_resp.json()["total_events"] >= 6

