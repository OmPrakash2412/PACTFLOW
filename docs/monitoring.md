# PACTFLOW: Monitoring, Metrics & Alerting Strategy

## 1. Technical Health Metrics
- **Uptime & Liveness**:
  - `/api/health/live`: Checked every 15 seconds by container load balancer (target: 99.95% uptime).
  - `/api/health`: Deep system health check verifying database connections, Trust Ledger integrity, and PayPal API sandbox connectivity.
- **Latency Targets**:
  - P50 < 80ms on core CRUD endpoints.
  - P95 < 250ms on database read/write queries.
  - P95 < 3,500ms on Gemini AI agreement and deliverable audits.
- **Error Rates**:
  - Alert trigger: HTTP 5xx responses > 1% over 5 minutes.

---

## 2. Business Health Metrics
- Daily active projects and agreements generated.
- Milestone approval rate (ratio of approved milestones to submitted deliverables).
- PayPal milestone invoice conversion rate and average settlement duration.
- Cryptographic Trust Ledger verification requests.

---

## 3. Alert Rules & Escalation Matrix

| Alert Name | Condition | Severity | Notification Channel | Action Runbook |
| :--- | :--- | :--- | :--- | :--- |
| `API_DOWN` | `/api/health/live` fails 2 consecutive probes | SEV-1 | PagerDuty / SMS / Slack | `/docs/runbooks/rollback.md` |
| `HIGH_5XX_ERROR_RATE` | 5xx error rate > 2% for 5 min | SEV-1 | PagerDuty / Slack | `/docs/runbooks/incident.md` |
| `PAYPAL_WEBHOOK_FAILURE` | Webhook signature error count > 5 | SEV-2 | Slack `#alerts-payments` | `/docs/runbooks/incident.md` |
| `GEMINI_QUOTA_NEARING` | API token usage > 85% daily limit | SEV-3 | Email / Slack | Request quota increase |
