import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_live_api_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Root
        root_resp = await client.get("/")
        assert root_resp.status_code == 200
        root_data = root_resp.json()
        assert root_data["platform"] == "PACTFLOW"
        assert root_data["status"] == "online"

        # 2. Health
        health_resp = await client.get("/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_live_auth_and_protected_workspace():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login with seed credentials
        login_resp = await client.post("/api/auth/login", json={
            "email": "client@pactflow.io",
            "password": "password123"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Current User Profile
        me_resp = await client.get("/api/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "client@pactflow.io"

        # 3. Seed project check
        proj_id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        proj_resp = await client.get(f"/api/projects/{proj_id}", headers=headers)
        assert proj_resp.status_code == 200
        proj_data = proj_resp.json()
        assert proj_data["title"] == "PulseAnalytics AI Financial Engine"
        assert float(proj_data["budget"]) == 6500.0

        # 4. Agreements verification
        ag_resp = await client.get(f"/api/agreements/project/{proj_id}", headers=headers)
        assert ag_resp.status_code == 200
        agreements = ag_resp.json()
        assert len(agreements) > 0
        assert agreements[0]["status"] == "accepted"

        # 5. Milestones check
        ms_resp = await client.get(f"/api/milestones/project/{proj_id}", headers=headers)
        assert ms_resp.status_code == 200
        milestones = ms_resp.json()
        assert len(milestones) == 3

        # 6. Trust Ledger cryptographic verification
        trust_resp = await client.get(f"/api/trust/verify/{proj_id}", headers=headers)
        assert trust_resp.status_code == 200
        trust_data = trust_resp.json()
        assert trust_data["is_valid"] is True
        assert trust_data["tamper_detected"] is False

        # 7. AI Payment Coordinator check
        ai_resp = await client.get(f"/api/ai/coordinator/{proj_id}", headers=headers)
        assert ai_resp.status_code == 200
        ai_data = ai_resp.json()
        assert ai_data["project_id"] == proj_id
        assert ai_data["overall_health"] in ("healthy", "action_required")
        assert len(ai_data["action_items"]) > 0
