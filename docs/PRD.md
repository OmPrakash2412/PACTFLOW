# PACTFLOW Product Requirements Document (PRD)

## 1. Executive Summary
- **Product Name**: PACTFLOW
- **Tagline**: Where Work Meets Trust.
- **Mission**: Connect freelance project agreements, verifiable evidence evaluation, and milestone settlement into an unbroken, tamper-evident trust coordination platform.
- **Loop**: `AGREEMENT → WORK → EVIDENCE → APPROVAL → PAYPAL PAYMENT → TRUST LEDGER`

## 2. Problem Statement
Digital work is fragmented across asynchronous messaging apps, cloud file storages, and disconnected banking rails. Clients suffer from scope creep and unverified deliverables; freelancers face payment withholding, subjective revisions, and escrow delays.

## 3. Product Solution
PACTFLOW coordinates the entire work-payment lifecycle:
1. **Gemini Pact Architect**: Converts plain-text requirements and budget into structured, milestone-based contracts with objective acceptance criteria.
2. **Dual-Party Cryptographic Acceptance**: Client and freelancer digitally sign the exact contract version, sealing an immutable event block.
3. **Gemini Evidence Inspector**: Audits code artifacts, test logs, and live URLs against criteria. Rejects screenshots for dynamic testing claims.
4. **Human-in-the-Loop Governance**: AI advises; humans decide. Milestones are approved only by client authorization.
5. **PayPal Developer Sandbox Settlement**: Real REST API Invoicing v2 integration generates authoritative hosted invoices. Idempotent webhooks reconcile payments.
6. **Trust Ledger**: Append-only SHA-256 hash-chained audit trail providing mathematical dispute defense.

## 4. User Personas
### Client (Buyer)
- Creates projects and invites freelancers.
- Reviews and digitally signs agreements.
- Inspects Evidence Inspector audit reports.
- Approves milestones or requests actionable revisions.
- Settles approved milestones via PayPal Sandbox.

### Freelancer (Provider)
- Accepts contracts and reviews acceptance criteria.
- Submits code links, build artifacts, and staging URLs.
- Receives objective pre-approval audit feedback.
- Tracks invoice settlement and payouts.

### Platform Admin / Auditor
- Inspects system health and verifies cryptographic chain continuity.
- Strictly prohibited from arbitrarily altering agreements or payment states.

## 5. Non-Functional Requirements
- **Security**: Zero client-side secret exposure; webhook signature verification; IDOR prevention; input sanitization.
- **Performance**: Backend sub-50ms API response time; Next.js 14 server components and client optimization.
- **Reliability**: Webhook idempotency preventing duplicate ledger credits.
