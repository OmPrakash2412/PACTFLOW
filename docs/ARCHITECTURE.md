# PACTFLOW Architecture & Technical Design

## 1. Monorepo Architecture Overview

```
PACTFLOW/
├── frontend/             # Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts
│   ├── app/              # Routes: landing, dashboard, freelancer, projects, invoices, ledger
│   ├── components/       # UI elements, modals, navbars, cards
│   ├── lib/              # API client & helpers
│   └── types/            # TypeScript interfaces
├── backend/              # Python FastAPI, Pydantic v2, REST APIs
│   ├── app/
│   │   ├── main.py       # Application factory, middleware & routing
│   │   ├── config.py     # Environment configuration & settings
│   │   ├── agents/       # Gemini AI: Pact Architect, Evidence Inspector, Payment Coordinator
│   │   ├── paypal/       # OAuth2, Invoicing v2, Webhooks signature verification
│   │   ├── database/     # Supabase client & persistent repository store
│   │   ├── security/     # JWT authentication, bcrypt & RBAC permissions
│   │   └── utils/        # Canonical JSON serialization & SHA-256 hash chaining
│   └── tests/            # Unit, integration, and E2E test suites
├── supabase/             # PostgreSQL migrations, seed data, and Row Level Security
└── docs/                 # Architectural specifications and demo guide
```

## 2. Core Service Components

### A. PayPal Sandbox Integration Module
- **OAuth Service (`paypal/oauth.py`)**: Thread-safe client credentials grant with automatic token caching and pre-expiration refresh window against `https://api-m.sandbox.paypal.com/v1/oauth2/token`.
- **Invoicing API v2 (`paypal/invoices.py`)**: Draft creation (`POST /v2/invoicing/invoices`), sending (`POST /v2/invoicing/invoices/{id}/send`), and authoritative status inspection.
- **Webhook Engine (`paypal/webhooks.py`)**: Authoritative signature verification via `POST /v1/notifications/verify-webhook-signature`, with idempotent event storage preventing duplicate financial record creation.

### B. Gemini 2.0 AI Modules
- **Pact Architect**: Converts project goals and total budget into mathematically balanced milestone contracts with testable criteria.
- **Evidence Inspector**: Parses submitted code repositories, benchmark reports, and staging URLs. Uses honest classifications (`satisfied`, `uncertain`, `missing`, `unable_to_verify`). Enforces rule: screenshots cannot verify backend or runtime functionality.
- **Payment Coordinator**: Analyzes project, milestone, and invoice states to calculate risk and suggest proactive communication.

### C. Cryptographic Trust Ledger
- Deterministic canonical JSON serialization (`canonical_json.py`).
- SHA-256 hash formula:
  $$H_n = \text{SHA256}(H_{n-1} \parallel \text{CanonicalJSON}(E_n))$$
- Verifies zero tampering from genesis hash to the latest sequence block.

