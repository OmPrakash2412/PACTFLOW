import hashlib
from typing import Dict, Any
from .canonical_json import canonicalize

GENESIS_HASH = "0" * 64


def calculate_event_hash(prev_hash: str, event_data: Dict[str, Any]) -> str:
    """
    Computes deterministic SHA-256 hash for a Trust Ledger event block.
    current_hash = SHA256(prev_hash + canonical_json(event_data))
    """
    canonical_repr = canonicalize(event_data)
    combined = f"{prev_hash}:{canonical_repr}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest()


def verify_chain(events: list) -> bool:
    """
    Cryptographically verifies that the sequence of events forms an unbroken hash chain.
    """
    if not events:
        return True

    expected_prev = GENESIS_HASH
    for event in events:
        if event.get("prev_hash") != expected_prev:
            return False

        # Reconstruct canonical data dict excluding current_hash and sequence if necessary
        event_body = {
            "project_id": str(event.get("project_id")),
            "event_type": str(event.get("event_type")),
            "actor_id": str(event.get("actor_id")) if event.get("actor_id") else None,
            "entity_id": str(event.get("entity_id")) if event.get("entity_id") else None,
            "payload": event.get("payload", {}),
            "timestamp": event.get("timestamp")
        }

        computed_hash = calculate_event_hash(expected_prev, event_body)
        if computed_hash != event.get("current_hash"):
            return False

        expected_prev = computed_hash

    return True

