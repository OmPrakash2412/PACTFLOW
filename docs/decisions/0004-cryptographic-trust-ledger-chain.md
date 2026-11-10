# 4. Cryptographic Trust Ledger Hash Chain

Date: 2026-11-05
Status: Accepted

## Context
In contract disputes, parties often disagree on who promised what, when deliverables were submitted, or what version of a scope was agreed to. Centralized database logs can be surreptitiously modified, and distributed public blockchains (Ethereum, Solana) impose high gas fees, slow finality, and complex wallet setup for non-crypto users.

## Decision
We implemented a **lightweight, tamper-evident Cryptographic Trust Ledger** operating as an append-only SHA-256 hash chain:
1. Every critical event (`AGREEMENT_GENERATED`, `AGREEMENT_ACCEPTED`, `DELIVERABLE_SUBMITTED`, `AI_EVIDENCE_VERIFIED`, `CLIENT_APPROVED`, `PAYMENT_COMPLETED`) generates a canonical JSON payload.
2. The event hash is computed as `SHA-256(previous_event_hash + canonical_payload)`.
3. The chain begins at a fixed `GENESIS_HASH`.
4. Anyone can verify the entire project history in real-time via `/api/trust/verify/{project_id}`. If any historical record is altered, deleted, or backdated, the hash chain breaks instantly.

## Alternatives Considered
1. **Public Blockchain Smart Contract**:
   - *Rejected*: Incurs gas fees on every transaction, requires metamask/web3 wallets, slow latency, and privacy compliance (GDPR right to be forgotten conflicts with immutable public chains).
2. **Standard Relational Audit Table**:
   - *Rejected*: Lacks mathematical proof of non-tampering; any DB admin or rogue script could alter rows without detection.

## Consequences
- **Positive**:
  - Zero transaction fees, sub-millisecond verification.
  - Mathematically provable audit trail for arbiters and dispute resolution.
  - Fully compatible with standard relational and in-memory databases.
- **Negative**:
  - Chain integrity depends on root genesis and non-repudiation of server signing keys.

