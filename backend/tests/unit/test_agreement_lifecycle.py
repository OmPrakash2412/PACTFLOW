import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store


@pytest.mark.asyncio
async def test_agreement_dual_acceptance_and_versioning():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register client
        client_res = await client.post("/api/auth/register", json={
            "email": f"client_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Password123!",
            "full_name": "Agreement Client",
            "role": "client"
        })
        assert client_res.status_code == 200
        client_token = client_res.json()["access_token"]
        client_headers = {"Authorization": f"Bearer {client_token}"}

        # Register freelancer
        fl_res = await client.post("/api/auth/register", json={
            "email": f"freelancer_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Password123!",
            "full_name": "Agreement Freelancer",
            "role": "freelancer"
        })
        assert fl_res.status_code == 200
        fl_token = fl_res.json()["access_token"]
        fl_headers = {"Authorization": f"Bearer {fl_token}"}

        # Create Project
        proj_res = await client.post("/api/projects", json={
            "title": "Decentralized Escrowless Protocol",
            "description": "Architect and deploy high-throughput verified milestone protocol.",
            "budget": 8000.00,
            "currency": "USD"
        }, headers=client_headers)
        assert proj_res.status_code == 200
        project_id = proj_res.json()["id"]

        # 1. Generate Agreement v1 via Gemini Pact Architect
        ag1_res = await client.post("/api/agreements/generate", json={
            "project_id": project_id
        }, headers=client_headers)
        assert ag1_res.status_code == 200
        ag1_data = ag1_res.json()
        assert ag1_data["version"] == 1
        assert ag1_data["status"] == "pending_acceptance"
        ag1_id = ag1_data["id"]

        # 2. Client Accepts Agreement v1
        c_acc = await client.post(f"/api/agreements/{ag1_id}/accept", headers=client_headers)
        assert c_acc.status_code == 200
        assert c_acc.json()["is_client_accepted"] is True
        assert c_acc.json()["is_freelancer_accepted"] is False
        assert c_acc.json()["status"] == "pending_acceptance"

        # 3. Reject duplicate acceptance by client
        dup_acc = await client.post(f"/api/agreements/{ag1_id}/accept", headers=client_headers)
        assert dup_acc.status_code == 400
        assert "already accepted" in dup_acc.json()["detail"]

        # 4. Freelancer Accepts Agreement v1 -> Dual Acceptance triggers 'accepted' status!
        f_acc = await client.post(f"/api/agreements/{ag1_id}/accept", headers=fl_headers)
        assert f_acc.status_code == 200
        assert f_acc.json()["is_client_accepted"] is True
        assert f_acc.json()["is_freelancer_accepted"] is True
        assert f_acc.json()["status"] == "accepted"

        # 5. Renegotiation / Versioning: Generate Agreement v2
        ag2_res = await client.post("/api/agreements/generate", json={
            "project_id": project_id,
            "requirements": "Updated requirements with expanded security scope",
            "target_budget": 9500.00
        }, headers=client_headers)
        assert ag2_res.status_code == 200
        ag2_data = ag2_res.json()
        assert ag2_data["version"] == 2
        assert ag2_data["status"] == "pending_acceptance"

        # Check that v1 is now superseded
        ag1_check = await client.get(f"/api/agreements/{ag1_id}", headers=client_headers)
        assert ag1_check.status_code == 200
        assert ag1_check.json()["status"] == "superseded"
