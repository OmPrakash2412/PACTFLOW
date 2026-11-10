# PACTFLOW: System Design Specification

## 1. Problem Statement
The global freelance and agency economy is plagued by the **Freelance Trust Dilemma**:
- **Clients** fear paying upfront because freelancers may under-deliver, ghost, or produce substandard work.
- **Freelancers** fear working before payment because clients may withhold funds, demand endless out-of-scope revisions, or dispute invoices after receiving code.
- **Traditional Escrow Platforms** (Upwork, Fiverr) charge punishing 10-20% fees, hold custody of funds under bureaucratic escrow lockups, and adjudicate disputes through slow, non-technical customer service reps.

**PACTFLOW** resolves this dilemma without holding custody of user funds. By combining:
1. **AI Scope Synthesis** (Gemini Pact Architect) that turns fuzzy requirements into unambiguous, testable milestones.
2. **Dual-Acceptance Contracts** where both parties lock in the scope hash.
3. **Objective AI Evidence Inspection** that validates submitted pull requests, demo URLs, and test logs against agreed criteria.
4. **Authoritative PayPal Invoicing v2 Settlement** directly between client and freelancer.
5. **Cryptographic SHA-256 Trust Ledger** providing a tamper-evident audit trail.

---

## 2. User Roles & Personas

| Role | Responsibilities | Key Capabilities |
| :--- | :--- | :--- |
| **Client / Buyer** | Project owner funding milestones | Create projects, prompt AI for scope synthesis, accept agreements, review AI verification reports, approve/request revisions on deliverables, settle PayPal invoices. |
| **Freelancer / Contractor** | Builder executing deliverables | Accept agreements, review milestone acceptance criteria, submit deliverables with proof artifacts (URLs, logs, demos), receive direct PayPal settlements. |
| **Arbiter / Admin** | Impartial auditor for dispute escalation | Inspect the cryptographic Trust Ledger, review complete version history and AI evaluation logs, issue advisory dispute resolutions. |
| **Organization Member / Viewer**| Team participant | View project progress, read agreements, inspect ledger audit trails (read-only). |

---

## 3. Core User Flows

```
[1. Requirement Gathering] -> [2. Gemini Pact Architect] -> [3. Dual Acceptance]
                                                                     |
[6. PayPal Settlement]   <- [5. Human Approval]       <- [4. AI Evidence Audit]
        |
[7. Trust Ledger Proof]
```

1. **Agreement Synthesis**:
   - Client specifies project title, rough requirements, total budget, and currency.
   - Gemini Pact Architect parses input, neutralizes injection vectors, and outputs structured milestones whose sums match the budget with falsifiable acceptance criteria.
2. **Dual-Acceptance Lock**:
   - Both client and freelancer must independently accept the agreement.
   - Any modification produces a new version (`v1` &rarr; `v2`), superseding prior versions and resetting acceptances.
3. **Deliverable Submission & Evidence Inspection**:
   - Freelancer submits deliverable links (Git commit, staging demo, test output file).
   - Gemini Evidence Inspector evaluates submitted evidence against criteria and assigns verdicts (`satisfied`, `uncertain`, `missing`, `unable_to_verify`).
4. **Milestone Approval & PayPal Settlement**:
   - Client reviews AI findings and approves the milestone.
   - PACTFLOW calls PayPal Invoicing API v2 to create and send an official invoice.
   - Client clicks the PayPal hosted link and settles payment directly to the freelancer.
5. **Cryptographic Trust Ledger**:
   - Every state transition is hashed into the SHA-256 tamper-evident chain.
   - Parties can verify integrity at any time.

---

## 4. Multi-Tenancy Model
- Every tenant resource (Projects, Agreements, Milestones, Deliverables, Invoices) is strictly scoped to an `organization_id` or workspace context.
- Cross-tenant requests (`User from Org A` attempting to query or modify `Org B's` project ID) **must return HTTP 404 Not Found**, never 403 or 200, preventing resource enumeration (IDOR prevention).
- Organization-level membership controls who can create, edit, or approve agreements.

---

## 5. Data Sensitivity & Compliance
- **PCI-DSS Compliance**: PACTFLOW stores zero credit card numbers or banking credentials. All payment details are handled exclusively on PayPal's PCI-DSS Level 1 certified hosted infrastructure.
- **GDPR & DPDP Act (India)**:
  - Users have the right to access, export (`GET /api/auth/export-data`), and delete (`POST /api/auth/delete-account`) their profile data.
  - PII (emails, names) is never placed inside public immutable trust ledger payloads; only opaque user IDs and event hashes are recorded.
  - Password hashes are stored using salted `bcrypt` (never plain text or reversible encryption).
- **Prompt Injection Defense**: All user submissions evaluated by LLMs are sanitized and tagged with `<UNTRUSTED_DATA>` boundaries.

---

## 6. Capacity & Scale Estimation (Year 1)
- **Active Users**: 25,000 freelancers & clients.
- **Projects Created**: 10,000 / month (~333 projects/day).
- **Milestones Settled**: 30,000 / month (~1,000 milestones/day).
- **Peak Request Load**:
  - Read queries: ~50 requests/second at peak.
  - Write / AI generation calls: ~5-10 requests/second at peak.
- **Storage Volume**:
  - Database metadata: ~50 MB / month (~600 MB / year).
  - Trust Ledger events: ~200,000 events / year (<150 MB).
  - External file uploads: Hosted on cloud object storage (Cloudflare R2 / AWS S3) via presigned URLs.
- **First Bottleneck**: External LLM rate limits (Gemini quota) & PayPal sandbox webhook delivery latency. Mitigated via exponential backoff retries and asynchronous background processing.

---

## 7. Out of Scope (Explicit Non-Goals)
1. **Custodial Escrow / Money Transmission**: PACTFLOW will never open pooled escrow bank accounts or hold user cash.
2. **Cryptocurrency & Web3 Tokens**: No volatile tokens, gas fees, or smart contract wallet requirements.
3. **Autonomous Unauthorized Debits**: AI will never automatically debit a client's bank account without an explicit human approval action.
4. **Full-Blown Project Management**: PACTFLOW is not a Jira/Asana replacement; it focuses specifically on agreement formulation, deliverable verification, and payment settlement.

---

## 8. Open Questions & Future Enhancements
1. Multi-currency automated conversion via PayPal FX rates for international cross-border contracts.
2. WebRTC screen-sharing integration for real-time arbitration sessions.
3. Automated GitHub/GitLab webhook integration to auto-submit PRs as milestone deliverables.

