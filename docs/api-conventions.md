# PACTFLOW: API Conventions & Specification

## 1. URL & Naming Style
- Base prefix: `/api` for all application endpoints.
- Resource names: lowercase, plural kebab-case (e.g. `/api/projects`, `/api/agreements`, `/api/deliverables`, `/api/invoices`).
- Sub-resources: hierarchical REST conventions (e.g. `/api/agreements/{id}/accept`, `/api/milestones/project/{project_id}`).
- Health checks: `/api/health` (deep) and `/api/health/live` (lightweight liveness).

---

## 2. Standardized Error Response Format
All errors returned by the API adhere to the standardized schema:
```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable description of error.",
    "details": {}
  }
}
```

### Standard Error Codes
| HTTP Code | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_INPUT` / `SSRF_BLOCKED` | Malformed body, boundary validation failure, or SSRF attempt |
| `401` | `UNAUTHORIZED` | Missing, malformed, or expired JWT bearer token |
| `403` | `FORBIDDEN` | Authenticated user lacks permission via `can()` |
| `404` | `NOT_FOUND` | Resource does not exist or belongs to another tenant (IDOR Defense) |
| `409` | `STATE_CONFLICT` | Action invalid for current entity status (e.g. deliverable already approved) |
| `429` | `RATE_LIMIT_EXCEEDED` | Exceeded IP or token quota; includes `Retry-After` header |
| `500` | `INTERNAL_SERVER_ERROR` | Unhandled server error (details logged, stack trace hidden) |

---

## 3. Strict Boundary Validation (Pydantic v2)
- All request payloads MUST validate against a dedicated Pydantic model at the boundary before entering business logic.
- Fields containing financial values must be `Decimal` or integer cents (no raw floats).
- External URLs must be validated against `validate_safe_url` to prevent SSRF against loopback addresses (`127.0.0.1`, `localhost`, `169.254.169.254`).

---

## 4. Multi-Tenant Scoping & Authentication Context
- Authentication context is resolved via `get_current_user` dependency in FastAPI.
- Route handlers extract `user["id"]` and `user.get("organization_id")`.
- Tenant resources are queried by `id` AND scoped by `organization_id`. Mismatched tenant IDs trigger **HTTP 404 Not Found**.

---

## 5. Webhook Idempotency & Replay Defense
- PayPal webhooks require event ID tracking in `db_store.paypal_webhook_events`.
- Replaying the same webhook event ID returns HTTP 200 with `status: "already_processed"` and ignores duplicate side effects.

