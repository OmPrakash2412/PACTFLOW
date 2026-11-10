# Runbook: Emergency Rollback Procedure

## 1. When to Declare a Rollback
Trigger an immediate rollback if any of the following occur within 15 minutes of deploy:
- Elevated HTTP 5xx error rate (>1% over a 5-minute rolling window).
- P95 latency exceeds 1,500ms on `/api/agreements` or `/api/deliverables`.
- Critical failure in PayPal Invoicing or Webhook delivery.
- Database connection pool exhaustion.

---

## 2. Immediate Execution Steps

### Rollback Step 1: Frontend (Vercel)
1. Open Vercel Dashboard &rarr; PACTFLOW Frontend &rarr; Deployments.
2. Locate the previous production deployment marked "Ready".
3. Click `...` &rarr; **Instant Rollback**.
4. Traffic routes to the prior build within ~10 seconds.

### Rollback Step 2: Backend (Railway / Render)
```bash
# Redeploy the previous verified commit SHA
git revert HEAD -m "revert: rollback production deploy due to incident"
git push origin main
```
Alternatively, in Railway dashboard:
- Click Deployments &rarr; select previous deployment &rarr; **Rollback**.

### Rollback Step 3: Database Schema (If Necessary)
If a migration was executed that broke backward compatibility:
```bash
python -m alembic downgrade -1
```
*(Rule: all migrations should be backward-compatible with N-1 app versions whenever possible).*

### Rollback Step 4: Verification
Confirm `/api/health` returns HTTP 200:
```bash
curl -I https://api.pactflow.io/api/health
```
Notify stakeholders in the incident communication channel.
