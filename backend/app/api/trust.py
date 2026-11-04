import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.trust import TrustEventResponse, TrustVerificationStatus
from ..database.store import db_store
from ..utils.hashing import GENESIS_HASH
from .deps import get_current_user

router = APIRouter(prefix="/trust", tags=["Trust Ledger"])


@router.get("/events/{project_id}", response_model=List[TrustEventResponse])
async def get_project_trust_ledger(project_id: str, current_user: dict = Depends(get_current_user)):
    events = db_store.get_trust_events(project_id=project_id)
    results = []
    for e in events:
        actor_name = None
        if e.get("actor_id"):
            actor = db_store.profiles.get(e["actor_id"])
            actor_name = actor.get("full_name") if actor else None

        results.append(TrustEventResponse(
            id=e["id"],
            sequence_number=e["sequence_number"],
            project_id=e["project_id"],
            event_type=e["event_type"],
            actor_id=e.get("actor_id"),
            actor_name=actor_name,
            entity_id=e.get("entity_id"),
            payload=e.get("payload", {}),
            prev_hash=e["prev_hash"],
            current_hash=e["current_hash"],
            timestamp=e["timestamp"]
        ))
    return results


@router.get("/verify/{project_id}", response_model=TrustVerificationStatus)
async def verify_project_ledger_chain(project_id: str, current_user: dict = Depends(get_current_user)):
    """
    Cryptographically verifies the SHA-256 hash chain of the Trust Ledger.
    Confirms zero tampering from genesis block to the latest committed block.
    """
    events = db_store.get_trust_events(project_id=project_id)
    is_valid = db_store.verify_ledger(project_id=project_id)

    latest_hash = events[-1]["current_hash"] if events else GENESIS_HASH
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return TrustVerificationStatus(
        total_events=len(events),
        is_valid=is_valid,
        genesis_hash=GENESIS_HASH,
        latest_hash=latest_hash,
        verified_at=now_iso,
        tamper_detected=not is_valid
    )

