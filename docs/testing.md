# PACTFLOW: Testing Strategy & Framework

## 1. Test Architecture Overview
Our testing pyramid emphasizes fast, deterministic verification with zero mocked database queries or mocked authorization checks:

```
        /   E2E Browser Tests (Playwright)   \
       /   ---------------------------------  \
      /   Integration Tests (FastAPI + Store)  \
     /   -------------------------------------  \
    /   Unit Tests (Agents, Hashing, Security)   \
```

---

## 2. Test Suites
- **Unit Tests (`backend/tests/unit/`)**:
  - `test_pact_architect.py`: Verifies AI contract synthesis, milestone budget sums matching total budget, and schema enforcement.
  - `test_evidence_inspector.py`: Verifies objective falsifiable analysis, prompt injection neutralization, and screenshot limitation enforcement.
  - `test_trust_ledger.py`: Verifies SHA-256 hash chaining, deterministic event formatting, and tamper detection.
  - `test_phase10_security_audit.py`: Validates SSRF blocking, webhook idempotency, and JWT signature security.
  - `test_saas_playbook_layers.py`: Multi-tenant isolation, rate limiting, and centralized `can()` permissions.
- **Integration Tests (`backend/tests/integration/`)**:
  - `test_sandbox_payment_lifecycle.py`: Tests unauthorized invoice creation denial, draft invoice creation, sending, and webhook handling.
  - `test_live_endpoints.py`: Validates health checks and protected workspace endpoints.
- **End-to-End Tests (`backend/tests/e2e/`)**:
  - `test_full_workflow.py`: Simulates registration &rarr; project creation &rarr; agreement draft &rarr; dual acceptance &rarr; deliverable submission &rarr; AI audit &rarr; client approval &rarr; PayPal invoice generation &rarr; webhook settlement &rarr; trust ledger verification.

---

## 3. Mocking Guidelines
- **NEVER MOCKED**:
  - Cryptographic hashing functions (`calculate_event_hash`, `verify_chain`).
  - Centralized authorization checks (`can()`, `verify_permission()`).
  - Database store and multi-tenant scoping logic.
- **MOCKED (External Network Only)**:
  - Live PayPal HTTP endpoints during offline CI (simulated with realistic JSON fixture payloads).
  - Live Gemini API during CI when `GEMINI_API_KEY` is not present (handled via deterministic rule-based generator).

