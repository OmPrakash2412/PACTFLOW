import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse
)
from ..security.auth import get_password_hash, verify_password, create_access_token
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    # Check if email exists
    for p in db_store.profiles.values():
        if p["email"].lower() == req.email.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )

    user_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    org_id = req.organization_id or f"org_{uuid.uuid4().hex[:8]}"

    # Auto-provision organization if not existing
    if org_id not in db_store.organizations:
        db_store.organizations[org_id] = {
            "id": org_id,
            "name": f"{req.full_name}'s Workspace",
            "slug": org_id,
            "owner_id": user_id,
            "created_at": now_iso,
            "updated_at": now_iso,
            "deleted_at": None
        }

    profile = {
        "id": user_id,
        "organization_id": org_id,
        "email": req.email.lower(),
        "password_hash": get_password_hash(req.password),
        "full_name": req.full_name,
        "role": req.role,
        "paypal_email": req.paypal_email or req.email,
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={req.full_name}",
        "created_at": now_iso,
        "updated_at": now_iso,
        "deleted_at": None
    }
    db_store.profiles[user_id] = profile

    token = create_access_token({
        "sub": user_id,
        "role": profile["role"],
        "email": profile["email"],
        "organization_id": org_id
    })
    user_resp = UserResponse(
        id=profile["id"],
        email=profile["email"],
        full_name=profile["full_name"],
        role=profile["role"],
        organization_id=org_id,
        paypal_email=profile["paypal_email"],
        avatar_url=profile["avatar_url"],
        created_at=profile["created_at"]
    )
    return TokenResponse(access_token=token, user=user_resp)


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    matched_profile = None
    for p in db_store.profiles.values():
        if p.get("deleted_at") is None and p["email"].lower() == req.email.lower():
            matched_profile = p
            break

    if not matched_profile or not verify_password(req.password, matched_profile["password_hash"]):
        # Generic message protects against user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    org_id = matched_profile.get("organization_id", "org-alpha-1111")
    token = create_access_token({
        "sub": matched_profile["id"],
        "role": matched_profile["role"],
        "email": matched_profile["email"],
        "organization_id": org_id
    })
    user_resp = UserResponse(
        id=matched_profile["id"],
        email=matched_profile["email"],
        full_name=matched_profile["full_name"],
        role=matched_profile["role"],
        organization_id=org_id,
        paypal_email=matched_profile.get("paypal_email"),
        avatar_url=matched_profile.get("avatar_url"),
        created_at=matched_profile["created_at"]
    )
    return TokenResponse(access_token=token, user=user_resp)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        organization_id=current_user.get("organization_id"),
        paypal_email=current_user.get("paypal_email"),
        avatar_url=current_user.get("avatar_url"),
        created_at=current_user["created_at"]
    )


@router.get("/export-data")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """
    GDPR & DPDP Act Data Portability: Exports all user data in JSON format.
    """
    u_id = current_user["id"]
    user_projects = [p for p in db_store.projects.values() if p.get("client_id") == u_id or p.get("freelancer_id") == u_id]
    user_deliverables = [d for d in db_store.deliverables.values() if d.get("submitted_by") == u_id]
    user_invoices = [inv for inv in db_store.invoices.values() if inv.get("client_id") == u_id or inv.get("freelancer_id") == u_id]

    # Sensitive fields redacted
    safe_profile = {k: v for k, v in current_user.items() if k != "password_hash"}

    return {
        "status": "success",
        "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "user_profile": safe_profile,
        "projects": user_projects,
        "deliverables": user_deliverables,
        "invoices": user_invoices,
    }


@router.post("/delete-account")
async def delete_user_account(current_user: dict = Depends(get_current_user)):
    """
    GDPR & DPDP Act Right to Erasure: Soft-deletes and anonymizes user account.
    """
    u_id = current_user["id"]
    profile = db_store.profiles.get(u_id)
    if profile:
        profile["deleted_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        profile["email"] = f"anonymized_{uuid.uuid4().hex[:8]}@deleted.pactflow.io"
        profile["full_name"] = "Anonymized User"
        profile["paypal_email"] = None

    return {
        "status": "success",
        "message": "User account successfully anonymized and marked for erasure in accordance with data privacy regulations."
    }
