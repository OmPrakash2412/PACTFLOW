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
    profile = {
        "id": user_id,
        "email": req.email.lower(),
        "password_hash": get_password_hash(req.password),
        "full_name": req.full_name,
        "role": req.role,
        "paypal_email": req.paypal_email or req.email,
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={req.full_name}",
        "created_at": now_iso,
        "updated_at": now_iso
    }
    db_store.profiles[user_id] = profile

    token = create_access_token({"sub": user_id, "role": profile["role"], "email": profile["email"]})
    user_resp = UserResponse(
        id=profile["id"],
        email=profile["email"],
        full_name=profile["full_name"],
        role=profile["role"],
        paypal_email=profile["paypal_email"],
        avatar_url=profile["avatar_url"],
        created_at=profile["created_at"]
    )
    return TokenResponse(access_token=token, user=user_resp)


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    matched_profile = None
    for p in db_store.profiles.values():
        if p["email"].lower() == req.email.lower():
            matched_profile = p
            break

    if not matched_profile or not verify_password(req.password, matched_profile["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(
        {"sub": matched_profile["id"], "role": matched_profile["role"], "email": matched_profile["email"]}
    )
    user_resp = UserResponse(
        id=matched_profile["id"],
        email=matched_profile["email"],
        full_name=matched_profile["full_name"],
        role=matched_profile["role"],
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
        paypal_email=current_user.get("paypal_email"),
        avatar_url=current_user.get("avatar_url"),
        created_at=current_user["created_at"]
    )

