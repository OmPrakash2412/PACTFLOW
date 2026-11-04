# PACTFLOW Security & Threat Model

## 1. Zero-Trust Architecture
- **No Escrow Misrepresentation**: PACTFLOW is not an escrow service. PACTFLOW does not hold, pool, or custody user funds. Funds flow directly through PayPal Invoicing v2.
- **Untrusted Input Protection**: User-submitted project briefs, deliverable text, and uploaded documents are treated as untrusted data. Strings are sanitized to prevent prompt injection attacks against Gemini AI models.
- **Strict Role-Based Access Control (RBAC)**: Only the client owner can approve deliverables and trigger PayPal invoices. Only the assigned freelancer can submit milestone evidence.
- **Server-Side Authoritative Reconciliation**: Payments are never marked as completed based solely on browser redirects or optimistic frontend signals. Status mutations require verified PayPal webhook events or authoritative REST query verification.

## 2. PayPal Webhook Security
- **Signature Verification**: Validates `paypal-transmission-sig`, `paypal-transmission-time`, `paypal-auth-algo`, and `paypal-cert-url` using PayPal's verification endpoint `POST /v1/notifications/verify-webhook-signature`.
- **Idempotency Protection**: Every webhook event is registered in `paypal_webhook_events`. Duplicate deliveries with identical event IDs are acknowledged immediately without duplicate ledger credits.

## 3. Cryptographic Tamper Evidence
- Every state change appends a block to the Trust Ledger.
- SHA-256 hash chaining prevents retrospective modification of agreements, approvals, or payments.
- Database triggers reject SQL `UPDATE` and `DELETE` on financial audit records.

