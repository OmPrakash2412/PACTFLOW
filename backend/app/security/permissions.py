from fastapi import HTTPException, status
from typing import Dict, Any, List
from ..database.store import db_store


def check_project_membership(user_id: str, project_id: str, allowed_roles: List[str] = None) -> Dict[str, Any]:
    project = db_store.projects.get(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found."
        )

    # Check if client owner
    if project["client_id"] == user_id:
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

