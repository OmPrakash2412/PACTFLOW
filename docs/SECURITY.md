# PACTFLOW Security Architecture & Threat Model

**Platform Tagline**: *Where Work Meets Trust.*

This document details the complete security architecture, threat model, input validation mechanisms, and cryptographic audit proofs implemented across the PACTFLOW platform to satisfy Hackathon Security Standards.

---

## 1. Zero-Trust & Non-Custodial Financial Architecture

### 1.1 Zero Escrow Misrepresentation
- **No Fund Custody**: PACTFLOW does not hold, pool, custody, or disburse user funds. PACTFLOW is strictly an **agreement and verification coordination protocol**, not an escrow provider.
- **Direct P2P Settlement**: Invoices and payments are processed directly through PayPal's authorized hosted payment gateway via PayPal Invoicing API v2 (`POST /v2/invoicing/invoices`).
- **No Simulated Approvals**: AI agents are strictly forbidden from authorizing payouts, accepting agreements, altering agreed sums, or modifying financial states.

### 1.2 Server-Side Financial Amount Integrity
- **Immunity to Parameter Tampering**: Invoice generation (`POST /api/invoices/generate`) accepts only `milestone_id`. The payable sum is fetched server-side directly from the database record of the approved milestone. Payer amounts submitted via HTTP request bodies are discarded.
- **Pre-Condition Gates**: Invoices can only be drafted if the milestone is in `approved` or `invoiced` status. Requests for unapproved or draft milestones return `400 Bad Request`.

---

## 2. Authentication & Authorization (AuthN & AuthZ)

### 2.1 Password Hashing & Storage
- **Algorithm**: Adaptive Bcrypt hashing (`bcrypt.hashpw(password, gensalt(12))`).
- **Pre-Hash Salting**: 12 salt rounds provide defense against pre-computed rainbow tables and high-throughput ASIC brute-force attacks.

### 2.2 JWT Token Security & Algorithm Enforcement
- **Algorithm Lockdown**: Strict enforcement of `HS256`. Token decoding rejects algorithm confusion attacks (e.g. `algorithm: "none"` or mismatched asymmetric keys).
- **Expiration Enforcement**: Short-lived claims (`exp: UTC timestamp + settings.ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Cryptographic Signature Verification**: Every protected route (`/projects`, `/agreements`, `/deliverables`, `/invoices`, `/trust`) validates token authenticity through `get_current_user` dependency injection.

### 2.3 IDOR (Insecure Direct Object Reference) Protection
- **Project Membership Guards**: Users can only access, view, or modify projects, agreements, deliverables, and invoices where they are verified project owners, assigned freelancers, or platform administrators.
- **Decision Authorization**: Only the designated project owner (`project.client_id == current_user.id`) can approve deliverables or request revisions (`POST /api/deliverables/client-decision`). Freelancers or third parties attempting self-approval receive `403 Forbidden`.

---

## 3. Server-Side Request Forgery (SSRF) Protection

External assets submitted by freelancers (demo URLs, preview deployments, raw test logs) undergo strict URL validation before ingestion (`backend/app/utils/security_validators.py`):

1. **Scheme Whitelisting**: Only `http` and `https` protocols are allowed. File schemes (`file://`), FTP (`ftp://`), gopher, and ldap are blocked.
2. **Loopback & Localhost Rejection**: `localhost`, `127.0.0.1`, `::1`, and custom loopback interfaces are blocked.
3. **Cloud Metadata Protection**: Link-local addresses (`169.254.169.254`, `metadata.google.internal`, `instance-data`) are blocked to prevent AWS/GCP/Azure instance profile credential theft.
4. **Intranet & RFC 1918 Range Blocking**: Private IPv4 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) and internal domain suffixes (`.internal`, `.local`, `.lan`) are blocked.

---

## 4. PayPal Webhook Cryptographic Verification & Idempotency

### 4.1 Signature Verification
Incoming PayPal webhooks (`POST /api/webhooks/paypal`) are validated against PayPal's verification service (`POST /v1/notifications/verify-webhook-signature`):
- `PAYPAL-TRANSMISSION-ID`
- `PAYPAL-TRANSMISSION-TIME`
- `PAYPAL-TRANSMISSION-SIG`
- `PAYPAL-CERT-URL` (verified to originate from `*.paypal.com`)
- `PAYPAL-AUTH-ALGO` (SHA256withRSA)

### 4.2 Webhook Idempotency & Replay Defense
- Every event is recorded in `paypal_webhook_events` under its unique PayPal event ID (`WH-XXX`).
- If PayPal retries a webhook delivery (due to transient network latency), PACTFLOW detects the processed event ID and returns `200 OK` immediately without duplicate payment records or duplicate Trust Ledger entries.
- Payments are never marked `COMPLETED` based on optimistic browser redirects; updates occur exclusively upon authoritative webhook receipts or direct REST queries.

---

## 5. Gemini AI Prompt Injection & Untrusted Data Defense

### 5.1 Untrusted Input Boundary
All user text (project briefs, requirement descriptions, deliverable notes, PR messages) is treated as untrusted data wrapped in strict XML tags (`<PROJECT_INPUT>`, `<AUDIT_TARGET>`).

### 5.2 Adversarial Prompt Injection Neutralization
The Gemini Evidence Inspector agent incorporates automated regex filters detecting prompt injection heuristics:
- `ignore (all) previous instructions`
- `disregard instructions`
- `system override`
- `mark satisfied`
- `bypass verification`
- `developer mode`

If adversarial injection is detected:
1. Criteria that lack tangible code artifacts are immediately downgraded to `uncertain` or `unable_to_verify`.
2. The verification report summary is marked: `[FLAGGED: Prompt Injection Neutralized]`.
3. An explicit security warning is dispatched to the client: `"SECURITY ADVISORY: Attempted prompt injection pattern detected and neutralized. Mandatory manual client review required."`

### 5.3 Honest Evidence Assessment
The AI enforces an inviolable rule: **never claim dynamic functionality based solely on a screenshot**. Screenshots verify visual existence, not operational runtime endpoints or backend database integrity.

---

## 6. Cryptographic Trust Ledger

### 6.1 Deterministic SHA-256 Hash Chaining
Every lifecycle milestone (agreement creation, dual signatures, evidence submission, AI audit, human client approval, PayPal invoice dispatch, and payment capture) appends an immutable block to the Trust Ledger:

$$H_0 = \text{GENESIS\_HASH} = \text{"0"}^{64}$$
$$H_n = \text{SHA256}(H_{n-1} : \text{canonical\_json}(\text{event\_body}_n))$$

Where `canonical_json` ensures deterministic property ordering, whitespace stripping, and IEEE-754 decimal normalization.

### 6.2 Mathematical Tamper Evidence
If any database record or payload is mutated retrospectively, the verification algorithm (`verify_ledger`) recalculates the hash chain from genesis and detects the exact corruption index, returning `is_valid: false` and `tamper_detected: true`.

---

## 7. Supabase Database Security & RLS Policies

Database migrations (`supabase/migrations/`) implement strict PostgreSQL Row Level Security:
- `projects`: Accessible only by authenticated creators and invited collaborators.
- `agreements`: Readable by project participants; immutable once dual-accepted.
- `invoices` & `payments`: Protected by RLS policies; updates restricted to authorized backend service role keys.
- SQL Triggers prevent `UPDATE` and `DELETE` on finalized payment events.

---

## 8. Automated Security Test Verification

The complete security audit suite is tested in [`backend/tests/unit/test_phase10_security_audit.py`](backend/tests/unit/test_phase10_security_audit.py):
- `test_ssrf_protection_validator`: Proves blocking of localhost, private subnets, cloud metadata IPs, and non-HTTP schemes.
- `test_ssrf_rejection_on_deliverable_submission`: Proves real API rejection of malicious metadata targets with HTTP 400.
- `test_webhook_replay_and_idempotency_defense`: Proves duplicate webhook replays do not duplicate financial payment rows or ledger blocks.
- `test_jwt_algorithm_enforcement`: Proves algorithm `none` and unverified JWT tokens are rejected.
