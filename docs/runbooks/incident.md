# Runbook: Incident Response & Post-Incident Review

## 1. Incident Severity Definitions
- **SEV-1 (Critical Outage)**: System down, unable to settle PayPal invoices, or active data breach. Immediate page to on-call engineer; 15-minute response SLA.
- **SEV-2 (Major Degradation)**: Core feature broken (e.g. AI Evidence Inspector failing), but core site and login functional. 1-hour response SLA.
- **SEV-3 (Minor / Degraded)**: Non-critical feature degraded (e.g. export PDF generation slow). 12-hour response SLA.

---

## 2. Customer Communication Protocol
1. **Public Status Page Update**:
   - Post notice at `status.pactflow.io`:
     *"We are currently investigating elevated response times in our AI Verification pipeline. Core payment and project features remain functional. Next update in 30 minutes."*
2. **Frequency of Updates**:
   - SEV-1: Every 20 minutes until resolved.
   - SEV-2: Hourly until resolved.

---

## 3. Post-Incident Review (PIR) Template

```markdown
# Post-Incident Review: [Incident Title]
- **Date**: YYYY-MM-DD
- **Severity**: SEV-1 / SEV-2
- **Duration**: XX minutes
- **Incident Commander**: [Name]

### 1. Summary
Brief explanation of what happened, customer impact, and how it was resolved.

### 2. Timeline (UTC)
- HH:MM - Alert triggered (e.g. PayPal Webhook delivery drop).
- HH:MM - Engineer acknowledged and initiated triage.
- HH:MM - Root cause identified.
- HH:MM - Fix / rollback applied.
- HH:MM - Verification complete; incident resolved.

### 3. Root Cause
Detailed technical explanation of the failure mode.

### 4. What Went Well
- Quick alerting.
- Instant rollback restored stability in under 2 minutes.

### 5. What Went Poorly
- Monitoring lacked granularity on specific third-party error codes.

### 6. Action Items
| Action Item | Owner | Priority | Target Date |
| :--- | :--- | :--- | :--- |
| Add alert for PayPal 401 token expiry | [Dev] | High | YYYY-MM-DD |
| Increase worker timeout on large files | [Dev] | Medium | YYYY-MM-DD |
```

