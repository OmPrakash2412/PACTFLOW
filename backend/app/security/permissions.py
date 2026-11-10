from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from ..database.store import db_store

# Role to actions mapping matrix
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "owner": [
        "org:delete",
        "org:transfer_ownership",
        "org:invite_member",
        "org:remove_member",
        "project:create",
        "project:read",
        "project:update",
        "project:delete",
        "agreement:generate",
        "agreement:read",
        "agreement:accept",
        "deliverable:read",
        "deliverable:approve",
        "invoice:generate",
        "invoice:pay",
        "invoice:read",
        "trust:verify",
    ],
    "client": [
        "org:invite_member",
        "project:create",
        "project:read",
        "project:update",
        "project:delete",
        "agreement:generate",
        "agreement:read",
        "agreement:accept",
        "deliverable:read",
        "deliverable:approve",
        "invoice:generate",
        "invoice:pay",
        "invoice:read",
        "trust:verify",
    ],
    "admin": [
        "org:invite_member",
        "org:remove_member",
        "project:create",
        "project:read",
        "project:update",
        "agreement:generate",
        "agreement:read",
        "agreement:accept",
        "deliverable:read",
        "deliverable:approve",
        "invoice:generate",
        "invoice:read",
        "trust:verify",
    ],
    "freelancer": [
        "project:read",
        "agreement:read",
        "agreement:accept",
        "deliverable:submit",
        "deliverable:read",
        "invoice:read",
        "trust:verify",
    ],
    "member": [
        "project:read",
        "agreement:read",
        "agreement:accept",
        "deliverable:submit",
        "deliverable:read",
        "invoice:read",
        "trust:verify",
    ],
    "viewer": [
        "project:read",
        "agreement:read",
        "deliverable:read",
        "invoice:read",
        "trust:verify",
    ],
}


def can(user: Dict[str, Any], action: str, resource: Optional[Dict[str, Any]] = None) -> bool:
    """
    Centralized SaaS authorization policy checker:
    1. Validates that user role is permitted to perform the action.
    2. Validates multi-tenant boundaries (user org == resource org).
    """
    if not user:
        return False

    role = user.get("role", "viewer").lower()
    allowed_actions = ROLE_PERMISSIONS.get(role, [])

    if action not in allowed_actions:
        return False

    # Multi-tenant boundary check (IDOR Defense)
    if resource and "organization_id" in resource and "organization_id" in user:
        res_org = resource["organization_id"]
        user_org = user["organization_id"]
        if res_org and user_org and res_org != user_org:
            return False

    return True


def verify_permission(
    user: Dict[str, Any],
    action: str,
    resource: Optional[Dict[str, Any]] = None
) -> None:
    """
    Enforces authorization check.
    - If tenant mismatch: raises 404 NOT FOUND (IDOR defense - never leaks existence with 403).
    - If role lacks permission: raises 403 FORBIDDEN.
    """
    if resource and "organization_id" in resource and "organization_id" in user:
        res_org = resource.get("organization_id")
        user_org = user.get("organization_id")
        if res_org and user_org and res_org != user_org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found."
            )

    if not can(user, action, resource):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Role '{user.get('role')}' is not authorized to perform '{action}'."
        )


def check_project_membership(
    user_id: str,
    project_id: str,
    allowed_roles: List[str] = None
) -> Dict[str, Any]:
    """
    Checks project participation and role authorization.
    Preserves backward compatibility with existing project routes.
    """
    project = db_store.projects.get(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found."
        )

    # Check if client owner
    if project.get("client_id") == user_id:
        if allowed_roles and "client" not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have required role for this project operation."
            )
        return {"project": project, "role": "client"}

    # Check project members
    for member in db_store.project_members.values():
        if member["project_id"] == project_id and member["user_id"] == user_id:
            if allowed_roles and member["role"] not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role '{member['role']}' cannot execute this action."
                )
            return {"project": project, "role": member["role"]}

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized: User is not an active participant in this project."
    )
