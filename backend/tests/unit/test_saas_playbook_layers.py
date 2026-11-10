import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.security.permissions import can, verify_permission
from app.database.store import db_store
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_saas_layer2_health_checks():
    """Layer 2 & 14: Verifies lightweight liveness and deep health check."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Liveness check
        live_res = await client.get("/api/health/live")
        assert live_res.status_code == 200
        assert live_res.json()["status"] == "alive"

        # Deep health check
        deep_res = await client.get("/api/health")
        assert deep_res.status_code == 200
        data = deep_res.json()
        assert data["status"] == "healthy"
        assert "database" in data["components"]
        assert "trust_ledger" in data["components"]
        assert "paypal_gateway" in data["components"]
        assert "gemini_ai" in data["components"]


@pytest.mark.asyncio
async def test_saas_layer3_and_4_cross_tenant_isolation_and_idor():
    """
    Layer 3 & 4: Multi-tenant data isolation and IDOR defense.
    A user from Org Alpha attempting to access Org Beta's project MUST receive 404, not 403 or 200.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user in Org Alpha
        user_alpha = await client.post("/api/auth/register", json={
            "email": f"alpha_{uuid.uuid4().hex[:6]}@alpha.com",
            "password": "Password123!",
            "full_name": "Alpha Lead",
            "role": "client",
            "organization_id": "org-alpha-1111"
        })
        token_alpha = user_alpha.json()["access_token"]
        headers_alpha = {"Authorization": f"Bearer {token_alpha}"}

        # Resource belonging to Org Beta
        beta_resource = {
            "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            "organization_id": "org-beta-2222",
            "title": "Beta Secret Project"
        }

        # Centralized can() check must evaluate to False across organizations
        assert can({"role": "client", "organization_id": "org-alpha-1111"}, "project:read", beta_resource) is False

        # verify_permission must raise 404 NOT FOUND (IDOR protection)
        with pytest.raises(HTTPException) as exc:
            verify_permission(
                {"role": "client", "organization_id": "org-alpha-1111"},
                "project:read",
                beta_resource
            )
        assert exc.value.status_code == 404


def test_saas_layer4_centralized_can_permissions():
    """Layer 4b: Verifies role matrix capabilities."""
    owner_user = {"role": "owner", "organization_id": "org-alpha"}
    viewer_user = {"role": "viewer", "organization_id": "org-alpha"}
    freelancer_user = {"role": "freelancer", "organization_id": "org-alpha"}

    # Owner can create and delete
    assert can(owner_user, "project:create") is True
    assert can(owner_user, "project:delete") is True
    assert can(owner_user, "deliverable:approve") is True

    # Viewer cannot create or delete
    assert can(viewer_user, "project:create") is False
    assert can(viewer_user, "project:delete") is False
    assert can(viewer_user, "deliverable:submit") is False
    assert can(viewer_user, "project:read") is True

    # Freelancer can submit deliverable but cannot approve
    assert can(freelancer_user, "deliverable:submit") is True
    assert can(freelancer_user, "deliverable:approve") is False


@pytest.mark.asyncio
async def test_saas_layer10_and_13_security_headers_and_request_id():
    """
    Layer 10 & 13: Verifies security headers and request ID tracing.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/")
        assert res.status_code == 200

        # Security Headers
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"
        assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

        # Request ID Tracing
        assert "X-Request-ID" in res.headers
        assert len(res.headers["X-Request-ID"]) > 10


@pytest.mark.asyncio
async def test_saas_layer10d_data_protection_export_and_deletion():
    """
    Layer 10d: GDPR / DPDP Act data export and right to erasure.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        reg_res = await client.post("/api/auth/register", json={
            "email": f"privacy_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Password123!",
            "full_name": "Privacy Conscious User",
            "role": "client"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Export Data
        export_res = await client.get("/api/auth/export-data", headers=headers)
        assert export_res.status_code == 200
        export_data = export_res.json()
        assert export_data["status"] == "success"
        assert "user_profile" in export_data
        assert "password_hash" not in export_data["user_profile"]

        # 2. Delete Account (Right to Erasure)
        del_res = await client.post("/api/auth/delete-account", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "success"

