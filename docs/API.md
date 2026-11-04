# PACTFLOW API Reference

All backend endpoints are served under `/api` by the FastAPI service.

## 1. Authentication
- `POST /api/auth/register`: Create user profile with role and PayPal email.
- `POST /api/auth/login`: Authenticate and obtain JWT bearer token.
- `GET /api/auth/me`: Retrieve active session profile.

## 2. Projects
- `GET /api/projects`: List projects accessible to authenticated user.
- `POST /api/projects`: Create project and record Trust Ledger genesis block.
- `GET /api/projects/{id}`: Retrieve project details and participants.

## 3. Agreements
- `POST /api/agreements/generate`: Invoke Gemini Pact Architect to draft a structured milestone agreement.
- `GET /api/agreements/project/{project_id}`: List agreement versions.
- `POST /api/agreements/{agreement_id}/accept`: Digitally sign an agreement version with SHA-256 seal.

## 4. Milestones & Deliverables
- `GET /api/milestones/project/{project_id}`: List project milestones.
- `POST /api/deliverables/submit`: Freelancer submits evidence. Automatically triggers Gemini Evidence Inspector audit.
- `GET /api/deliverables/report/{deliverable_id}`: Get Gemini verification report.
- `POST /api/deliverables/client-decision`: Client approves milestone or requests revisions.

## 5. PayPal Developer Sandbox Payments
- `POST /api/invoices/generate`: Creates and sends PayPal Invoicing API v2 draft invoice; returns hosted payer view URL.
- `GET /api/invoices/{id}`: Inspect authoritative invoice status.
- `POST /api/payments/reconcile/{invoice_id}`: Reconcile status directly with PayPal REST API.
- `POST /api/webhooks/paypal`: Authoritative PayPal webhook receiver with signature verification and idempotency protection.

## 6. Cryptographic Trust Ledger
- `GET /api/trust/events/{project_id}`: Retrieve chronological event blocks.
- `GET /api/trust/verify/{project_id}`: Cryptographically verify the SHA-256 hash chain from genesis block.

## 7. AI Coordinators
- `GET /api/ai/coordinator/{project_id}`: Retrieve Gemini Payment Coordinator project analysis and action items.

