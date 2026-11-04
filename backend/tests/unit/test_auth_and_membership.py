import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.store import db_store


@pytest.mark.asyncio
async def test_user_registration_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"user_{uuid.uuid4().hex[:8]}@pactflow.io"
        
        # 1. Register client
        reg_resp = await client.post("/api/auth/register", json={
            "email": unique_email,
            "password": "StrongPassword123!",
            "full_name": "Test Client User",
            "role": "client",
            "paypal_email": "client-paypal@example.com"
        })
        assert reg_resp.status_code == 200
        data = reg_resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "client"

        # 2. Reject duplicate registration
        dup_resp = await client.post("/api/auth/register", json={
            "email": unique_email,
            "password": "AnotherPassword123!",
            "full_name": "Duplicate User",
            "role": "freelancer"
        })
        assert dup_resp.status_code == 400
        assert "already exists" in dup_resp.json()["detail"]

        # 3. Successful login
        login_resp = await client.post("/api/auth/login", json={
            "email": unique_email,
            "password": "StrongPassword123!"
        })
        assert login_resp.status_code == 200
        assert "access_token" in login_resp.json()

        # 4. Failed login with wrong password
        bad_login = await client.post("/api/auth/login", json={
            "email": unique_email,
            "password": "WrongPassword999!"
        })
        assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_project_membership_and_idor_protection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create Owner User
        owner_email = f"owner_{uuid.uuid4().hex[:8]}@test.com"
        owner_res = await client.post("/api/auth/register", json={
            "email": owner_email,
            "password": "Password123!",
            "full_name": "Project Owner",
            "role": "client"
        })
        owner_token = owner_res.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}

        # Create Unrelated Stranger User
        stranger_email = f"stranger_{uuid.uuid4().hex[:8]}@test.com"
        stranger_res = await client.post("/api/auth/register", json={
            "email": stranger_email,
            "password": "Password123!",
            "full_name": "Stranger User",
            "role": "freelancer"
        })
        stranger_token = stranger_res.json()["access_token"]
        stranger_headers = {"Authorization": f"Bearer {stranger_token}"}

        # Owner creates private project
        create_resp = await client.post("/api/projects", json={
            "title": "Private Core Banking Overhaul",
            "description": "High security private financial codebase.",
            "budget": 15000.00,
            "currency": "USD"
        }, headers=owner_headers)
        assert create_resp.status_code == 200
        project_id = create_resp.json()["id"]

        # Owner can access project
        owner_get = await client.get(f"/api/projects/{project_id}", headers=owner_headers)
        assert owner_get.status_code == 200

        # Stranger attempts to view private project (IDOR Attack) -> Must be rejected with 403 Forbidden!
        stranger_get = await client.get(f"/api/projects/{project_id}", headers=stranger_headers)
        assert stranger_get.status_code == 403
        assert "Unauthorized" in stranger_get.json()["detail"]

        # Owner adds Stranger as member
        stranger_id = stranger_res.json()["user"]["id"]
        add_member_resp = await client.post(
            f"/api/projects/{project_id}/members",
            json={"user_id": stranger_id, "role": "freelancer"},
            headers=owner_headers
        )
        assert add_member_resp.status_code == 200

        # Now newly added member CAN access project
        member_get = await client.get(f"/api/projects/{project_id}", headers=stranger_headers)
        assert member_get.status_code == 200
        assert member_get.json()["id"] == project_id
