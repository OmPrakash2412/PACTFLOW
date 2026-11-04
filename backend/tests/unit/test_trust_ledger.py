import pytest
from app.utils.hashing import calculate_event_hash, verify_chain, GENESIS_HASH
from app.database.store import InMemoryDataStore


def test_trust_ledger_chain_integrity():
    store = InMemoryDataStore()
    events = store.get_trust_events()
    assert len(events) >= 5
    assert store.verify_ledger() is True


def test_trust_ledger_tamper_detection():
    store = InMemoryDataStore()
    events = store.get_trust_events()
    assert len(events) > 2

    # Tamper with an event payload
    tampered_events = [dict(e) for e in events]
    tampered_events[1]["payload"] = {"tampered": True}

    assert verify_chain(tampered_events) is False


def test_hash_calculation_determinism():
    data1 = {"b": 2, "a": 1, "nested": {"y": "test", "x": [1, 2, 3]}}
    data2 = {"nested": {"x": [1, 2, 3], "y": "test"}, "a": 1, "b": 2}

    hash1 = calculate_event_hash(GENESIS_HASH, data1)
    hash2 = calculate_event_hash(GENESIS_HASH, data2)

    assert hash1 == hash2
    assert len(hash1) == 64
