from typing import Dict, Any, Optional
from pydantic import BaseModel


class TrustEventResponse(BaseModel):
    id: str
    sequence_number: int
    project_id: str
    event_type: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    entity_id: Optional[str] = None
    payload: Dict[str, Any]
    prev_hash: str
    current_hash: str
    timestamp: str


class TrustVerificationStatus(BaseModel):
    total_events: int
    is_valid: bool
    genesis_hash: str
    latest_hash: str
    verified_at: str
    tamper_detected: bool = False
