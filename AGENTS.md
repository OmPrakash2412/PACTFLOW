# Project: PACTFLOW

## What this product does
PACTFLOW is an AI-powered agreement, deliverable verification, and PayPal milestone payment coordination platform. It solves the freelance trust dilemma ("payment before work" vs "work before payment") through objective AI scope synthesis, automated evidence inspection against milestone criteria, cryptographic tamper-evident audit logs (Trust Ledger), and authoritative PayPal Invoicing v2 sandbox settlement.

## Stack (do not change without asking)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (Light Beige Glassmorphism theme) + Lucide Icons + Recharts
- **Backend**: Python 3.12+ / 3.14 + FastAPI (Modular Architecture) + Pydantic v2 + Uvicorn
- **Database / Store**: In-memory multi-tenant store mirroring Supabase PostgreSQL schema with UUIDs, foreign keys, and soft deletes
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`) via Google GenAI SDK with structured schema enforcement & deterministic offline fallbacks
- **Payments**: PayPal Sandbox Invoicing API v2 & Webhook Coordination (idempotent, webhook-driven truth)
- **Security & Auth**: Passlib / bcrypt password hashing, PyJWT Bearer authentication, centralized `can()` RBAC, SSRF defenses, strict security headers, and rate limiting
- **Hosting**: Vercel (Frontend) + Railway / Render (Backend) + Supabase (Database/Auth)

## Rules
- **Never commit secrets**: All secrets must reside in environment variables, thoroughly documented in `.env.example`.
- **Server is the source of truth**: Every API endpoint must enforce:
  1. Input validation at the boundary via Pydantic.
  2. Authentication check (`get_current_user`).
  3. Authorization check (`can(user, action, resource)`).
  4. Multi-tenant scoping (`organization_id` filter; access across tenants returns 404, never 403 or data).
- **Idempotency**: All webhook handlers, payment captures, and background syncs must be idempotent using unique event IDs.
- **Financial precision**: Currency amounts must use integer minor units (cents) or `Decimal` strings, never IEEE 754 floating point arithmetic.
- **Run verification**: Run lint, typecheck, and test suites (`python -m pytest backend/tests -v`, `npm run build`) before declaring tasks complete.
- **Git hygiene**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). Never push broken code to `main`.

## Commands
- **Dev (Frontend)**: `npm run dev` or `npm run dv` (starts Next.js at `http://localhost:3000`)
- **Dev (Backend)**: `npm run dev:backend` or `cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- **Full Test Suite**: `python -m pytest backend/tests -v`
- **Frontend Build**: `npm run build`
- **Generate Architecture PDF**: `python generate_architecture_pdf.py`

## Architecture Decisions
See `/docs/decisions/` for the log of Architecture Decision Records (ADRs) and why each choice was made.
