# 1. Modular Monolith with FastAPI and Next.js

Date: 2026-11-05
Status: Accepted

## Context
We need to build a high-performance, developer-friendly, and maintainable SaaS platform for AI contract generation, deliverable verification, and PayPal payment settlements. We had to decide between a distributed microservices architecture, a single full-stack Next.js app, or a decoupled modular monolith with a Next.js frontend and a Python FastAPI backend.

## Decision
We chose a **decoupled modular monolith** architecture:
- **Frontend**: Next.js 14 (App Router, React 18, Tailwind CSS, TypeScript).
- **Backend**: Python 3.12+ with FastAPI, Pydantic v2, and Uvicorn.

## Alternatives Considered
1. **Microservices (Auth service, AI service, Payment service, Ledger service)**:
   - *Rejected*: Massive operational overhead, distributed transaction complexity, network latency, and premature optimization for an early-stage SaaS product.
2. **Next.js Full-Stack API Routes only**:
   - *Rejected*: Node.js ecosystem lacks the deep scientific, data processing, and Gemini GenAI SDK ergonomics of Python. Python allows seamless prompt engineering, cryptographic hashing, and rapid algorithmic validation.

## Consequences
- **Positive**:
  - Independent frontend and backend deployments (Vercel for CDN/UI edge, Railway/Render for backend compute).
  - Clean separation of UI concerns and server-side verification logic.
  - Python gives native access to Google GenAI SDK, Pydantic schema validation, and cryptography tools.
- **Negative**:
  - Two distinct runtimes to manage locally (Node.js and Python).
  - Requires maintaining CORS and API schemas across boundaries (mitigated by Pydantic and TypeScript types).
