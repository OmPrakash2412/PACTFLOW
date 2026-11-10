# PACTFLOW: Pre-Launch Production Checklist

Based on the 15-Layer SaaS Playbook (Appendix B):

- [x] **Cross-tenant data access tested and blocked**: Org A users requesting Org B resources receive HTTP 404 (IDOR defense verified).
- [x] **Auth via a proven provider; no custom password hashing**: Salted bcrypt (`bcrypt.hashpw` / `bcrypt.checkpw`) and PyJWT Bearer authentication.
- [x] **Every endpoint validates input and checks permissions on the server**: Pydantic v2 schemas at every boundary; centralized `can()` RBAC check.
- [x] **Payments driven by verified, idempotent webhooks**: PayPal Webhook `INVOICING.INVOICE.PAID` deduplicated by event ID.
- [x] **CI blocks merges on failing tests; production deploy has rollback**: GitHub Actions CI workflow runs pytest (33+ tests) and frontend build; rollback runbook documented.
- [x] **Critical flows covered by end-to-end tests**: E2E test covers full registration &rarr; scope synthesis &rarr; dual acceptance &rarr; deliverable verification &rarr; approval &rarr; PayPal invoice &rarr; webhook settlement &rarr; Trust Ledger verification.
- [x] **Separate staging and production environments**: Distinct environments documented in `.env.example` and `config.py`.
- [x] **Backups enabled and a restore actually tested**: Automated backup runbook in `/docs/runbooks/backups.md` with standalone test script `backend/scripts/restore_backup.py`.
- [x] **Security review done; dependencies audited**: Threat model in `/docs/security/threat-model.md`; SSRF, prompt injection, and CORS protections in place.
- [x] **Rate limits on login, signup and expensive endpoints**: Sliding-window rate limiter returns HTTP 429 with `Retry-After` header.
- [x] **No tenant data cached at shared layers**: Authenticated API responses deliver `Cache-Control: private, no-store`.
- [x] **Errors reach structured logs; passwords redacted**: Request ID tracking (`X-Request-ID`) with automatic redaction of secrets in logs.
- [x] **Uptime checks and alerts, each with a runbook**: Dual health checks (`/api/health/live` and `/api/health`) linked to operational runbooks.
- [x] **Load tested at expected launch traffic**: Load testing script at `backend/scripts/load_test.py`.
- [x] **Terms of service and privacy policy published**: Public footer links with data export and account deletion endpoints compliant with GDPR / DPDP Act.
