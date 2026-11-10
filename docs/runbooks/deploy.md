# Runbook: Production Deployment

## 1. Prerequisites
- All GitHub Actions CI checks (`backend-tests`, `frontend-build`) passing on `main`.
- Environment variables configured in Vercel (Frontend) and Railway / Render (Backend).
- Database migrations tested in staging.

---

## 2. Deployment Sequence

### Step 1: Database Schema Migration
Database migrations are applied *before* launching new code containers:
```bash
# In production environment container:
python -m supabase.migrations.apply # or alembic upgrade head
```
If the migration fails, deployment halts immediately; the running version is untouched.

### Step 2: Backend Container Deployment (Railway / Render)
```bash
# Git push triggers automatic build & rolling deployment
git push origin main
```
- Health check verification: Railway polls `/api/health/live`.
- In-flight requests drain gracefully during the 30-second shutdown window.

### Step 3: Frontend Deployment (Vercel)
- Vercel builds static assets and sets up edge caching.
- Custom domain (`https://pactflow.io`) and SSL certificates verify automatically.

### Step 4: Post-Deployment Smoke Tests
1. Query deep health check:
   ```bash
   curl -s https://api.pactflow.io/api/health | jq .
   ```
2. Verify live agreement synthesis flow.
3. Verify PayPal sandbox / live webhook listener.
