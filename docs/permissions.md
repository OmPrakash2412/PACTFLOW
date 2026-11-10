# PACTFLOW: Role-Based Access Control (RBAC) & Permissions Matrix

## 1. Overview
All data access in PACTFLOW is gated by a centralized authorization function:
```python
can(user: dict, action: str, resource: dict) -> bool
```
The server is the single source of truth. The frontend reflects these permissions to disable or hide UI actions, but every state-changing API request is verified on the backend.

---

## 2. Organization Roles
1. **Owner**: Creator and executive of the organization/workspace. Full administrative, financial, and deletion rights.
2. **Admin**: Project manager / senior coordinator. Can create and modify projects, generate agreements, and approve deliverables. Cannot delete the organization or transfer ownership.
3. **Member (Freelancer / Contributor)**: Assigned contractor or team member. Can accept agreements, view milestone criteria, and submit deliverables.
4. **Viewer (Guest / Observer)**: Read-only stakeholder or auditor. Can view project statuses, review agreements, and inspect the Trust Ledger. Cannot submit deliverables, approve payments, or modify scopes.

---

## 3. Permissions Matrix (Role × Action)

| Action | Description | Owner | Admin | Member | Viewer |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `org:delete` | Delete organization workspace | ✅ | ❌ | ❌ | ❌ |
| `org:transfer_ownership`| Transfer organization ownership | ✅ | ❌ | ❌ | ❌ |
| `org:invite_member` | Invite new collaborators | ✅ | ✅ | ❌ | ❌ |
| `org:remove_member` | Remove collaborator | ✅ | ✅ | ❌ | ❌ |
| `project:create` | Create new project workspace | ✅ | ✅ | ❌ | ❌ |
| `project:read` | View project details & budget | ✅ | ✅ | ✅ | ✅ |
| `project:update` | Update project metadata | ✅ | ✅ | ❌ | ❌ |
| `project:delete` | Delete project workspace | ✅ | ❌ | ❌ | ❌ |
| `agreement:generate`| Synthesize agreement via AI | ✅ | ✅ | ❌ | ❌ |
| `agreement:read` | Read agreement and criteria | ✅ | ✅ | ✅ | ✅ |
| `agreement:accept` | Cryptographically accept agreement | ✅ (Client) | ✅ (Client) | ✅ (Freelancer) | ❌ |
| `deliverable:submit` | Submit milestone deliverable artifacts | ❌ | ❌ | ✅ | ❌ |
| `deliverable:approve`| Approve deliverable & trigger invoice | ✅ | ✅ | ❌ | ❌ |
| `invoice:generate` | Generate PayPal milestone invoice | ✅ | ✅ | ❌ | ❌ |
| `invoice:pay` | Settle PayPal invoice via hosted URL | ✅ | ❌ | ❌ | ❌ |
| `trust:verify` | Verify cryptographic SHA-256 chain | ✅ | ✅ | ✅ | ✅ |

---

## 4. Multi-Tenant Scoping & IDOR Defense (Insecure Direct Object Reference)
- Every read or write of a tenant resource **must verify that `resource.organization_id == user.organization_id`**.
- If a user from **Organization A** requests a resource belonging to **Organization B** (even by valid UUID), the backend returns **HTTP 404 Not Found**, never 403 Forbidden or 200 OK.
- *Reasoning*: Returning 403 confirms the resource exists at that ID. Returning 404 prevents enumeration and information leakage.

