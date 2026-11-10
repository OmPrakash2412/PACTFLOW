# PACTFLOW: Hosting & Cloud Infrastructure Plan

## 1. Hosting Architecture

```
                      [Cloudflare CDN & DNS]
                                 |
              +------------------+------------------+
              |                                     |
              v                                     v
   [Vercel Edge Platform]               [Railway / Render Containers]
   - Next.js 14 Frontend               - FastAPI Python Backend (Port 8000)
   - Static Asset Optimization          - Rate Limiter & Security Middlewares
   - Edge Caching & SSG                 - Gemini GenAI Agent Integration
                                                    |
                                                    v
                                       [Supabase Managed PostgreSQL]
                                       - Multi-Tenant Schema & Soft Deletes
                                       - Automated Daily Backups
                                       - Row Level Security (RLS)
```

---

## 2. Infrastructure Costs (Launch vs. 10x Scale)

| Component | Provider & Tier (Launch) | Launch Cost/Mo | 10x Scale Tier | 10x Scale Cost/Mo |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | Vercel Hobby / Pro | $0 - $20 | Vercel Pro (High Bandwidth) | $40 |
| **Backend API** | Railway Starter / Render | $5 - $10 | Railway Pro (2x 2GB RAM instances) | $50 |
| **Database** | Supabase Free / Pro | $0 - $25 | Supabase Pro + High Memory Compute | $50 |
| **File Storage** | Cloudflare R2 (S3-compatible) | $0 (<10GB) | Cloudflare R2 (Zero Egress Fees) | $15 |
| **AI LLM** | Google Gemini 2.0 Flash | ~$5 (Pay-as-you-go) | Google Gemini 2.0 Flash | ~$60 |
| **Total** | | **~$30 - $60 / mo** | | **~$215 / mo** |

---

## 3. Environment Variables Strategy
- All secrets are injected through the hosting provider's encrypted environment variables dashboard.
- The backend validates all required variables at boot via `backend/app/utils/env_validator.py`. If a required key is missing or malformed, the process refuses to start and fails loudly with an actionable error.

