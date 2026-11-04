import uuid
import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.project import ProjectCreateRequest, ProjectResponse, ProjectMemberSchema
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    results = []

    for proj in db_store.projects.values():
        is_client = proj["client_id"] == user_id
        is_member = any(
            m["project_id"] == proj["id"] and m["user_id"] == user_id
            for m in db_store.project_members.values()
        )
        if is_client or is_member or current_user.get("role") == "admin":
            client = db_store.profiles.get(proj["client_id"], {})
            
            # Find freelancer member if any
            freelancer_id = None
            freelancer_name = None
            freelancer_email = None
            members = []
            for m in db_store.project_members.values():
                if m["project_id"] == proj["id"]:
                    p = db_store.profiles.get(m["user_id"], {})
                    members.append(ProjectMemberSchema(
                        user_id=m["user_id"],
                        role=m["role"],
                        full_name=p.get("full_name"),
                        email=p.get("email")
                    ))
                    if m["role"] == "freelancer":
                        freelancer_id = m["user_id"]
                        freelancer_name = p.get("full_name")
                        freelancer_email = p.get("email")

            results.append(ProjectResponse(
                id=proj["id"],
                client_id=proj["client_id"],
                title=proj["title"],
                description=proj["description"],
                budget=proj["budget"],
                currency=proj["currency"],
                deadline=proj.get("deadline"),
                status=proj["status"],
                created_at=proj["created_at"],
                updated_at=proj["updated_at"],
                client_name=client.get("full_name", "Unknown Client"),
                freelancer_id=freelancer_id,
                freelancer_name=freelancer_name,
                freelancer_email=freelancer_email,
                members=members
            ))

    return results


@router.post("", response_model=ProjectResponse)
async def create_project(req: ProjectCreateRequest, current_user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    project = {
        "id": project_id,
        "client_id": current_user["id"],
        "title": req.title,
        "description": req.description,
        "budget": req.budget,
        "currency": req.currency,
        "deadline": req.deadline,
        "status": "draft",
        "created_at": now_iso,
        "updated_at": now_iso
    }
    db_store.projects[project_id] = project

    # Add client as project member
    client_pm_id = str(uuid.uuid4())
    db_store.project_members[client_pm_id] = {
        "id": client_pm_id,
        "project_id": project_id,
        "user_id": current_user["id"],
        "role": "client",
        "joined_at": now_iso
    }

    freelancer_id = None
    freelancer_name = None
    freelancer_email = None

    # If freelancer email provided, match profile or invite
    if req.freelancer_email:
        f_user = next((p for p in db_store.profiles.values() if p["email"].lower() == req.freelancer_email.lower()), None)
        if not f_user:
            # Create a placeholder freelancer profile
            f_user_id = str(uuid.uuid4())
            f_user = {
                "id": f_user_id,
                "email": req.freelancer_email.lower(),
                "password_hash": "$2b$12$e80yq9g6i3mXQ2B2QyLzUe7u7vX/8d1w8rKzZ3G1N8R2v8kF2P1Y2",
                "full_name": req.freelancer_email.split("@")[0].capitalize(),
                "role": "freelancer",
                "paypal_email": req.freelancer_email,
                "created_at": now_iso,
                "updated_at": now_iso
            }
            db_store.profiles[f_user_id] = f_user

        freelancer_id = f_user["id"]
        freelancer_name = f_user["full_name"]
        freelancer_email = f_user["email"]

        f_pm_id = str(uuid.uuid4())
        db_store.project_members[f_pm_id] = {
            "id": f_pm_id,
            "project_id": project_id,
            "user_id": freelancer_id,
            "role": "freelancer",
            "joined_at": now_iso
        }

    # Record Trust Ledger event
    db_store.record_trust_event(
        project_id=project_id,
        event_type="PROJECT_CREATED",
        actor_id=current_user["id"],
        entity_id=project_id,
        payload={"title": req.title, "budget": f"{req.budget:.2f}", "currency": req.currency}
    )

    return ProjectResponse(
        id=project["id"],
        client_id=project["client_id"],
        title=project["title"],
        description=project["description"],
        budget=project["budget"],
        currency=project["currency"],
        deadline=project.get("deadline"),
        status=project["status"],
        created_at=project["created_at"],
        updated_at=project["updated_at"],
        client_name=current_user.get("full_name"),
        freelancer_id=freelancer_id,
        freelancer_name=freelancer_name,
        freelancer_email=freelancer_email
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = db_store.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    # IDOR Protection: verify user is client, member, or admin
    if current_user.get("role") != "admin":
        is_client = project["client_id"] == current_user["id"]
        is_member = any(
            m["project_id"] == project_id and m["user_id"] == current_user["id"]
            for m in db_store.project_members.values()
        )
        if not is_client and not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: User is not an active participant in this project."
            )

    client = db_store.profiles.get(project["client_id"], {})
    freelancer_id = None
    freelancer_name = None
    freelancer_email = None
    members = []

    for m in db_store.project_members.values():
        if m["project_id"] == project_id:
            p = db_store.profiles.get(m["user_id"], {})
            members.append(ProjectMemberSchema(
                user_id=m["user_id"],
                role=m["role"],
                full_name=p.get("full_name"),
                email=p.get("email")
            ))
            if m["role"] == "freelancer":
                freelancer_id = m["user_id"]
                freelancer_name = p.get("full_name")
                freelancer_email = p.get("email")

    return ProjectResponse(
        id=project["id"],
        client_id=project["client_id"],
        title=project["title"],
        description=project["description"],
        budget=project["budget"],
        currency=project["currency"],
        deadline=project.get("deadline"),
        status=project["status"],
        created_at=project["created_at"],
        updated_at=project["updated_at"],
        client_name=client.get("full_name", "Unknown Client"),
        freelancer_id=freelancer_id,
        freelancer_name=freelancer_name,
        freelancer_email=freelancer_email,
        members=members
    )


@router.post("/{project_id}/members", response_model=ProjectMemberSchema)
async def add_project_member(
    project_id: str,
    member_data: ProjectMemberSchema,
    current_user: dict = Depends(get_current_user)
):
    project = db_store.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    # Only project owner or admin can add members
    if project["client_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project client can manage members.")

    # Check if user already a member
    for m in db_store.project_members.values():
        if m["project_id"] == project_id and m["user_id"] == member_data.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a project member.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    pm_id = str(uuid.uuid4())
    db_store.project_members[pm_id] = {
        "id": pm_id,
        "project_id": project_id,
        "user_id": member_data.user_id,
        "role": member_data.role,
        "joined_at": now_iso
    }

    profile = db_store.profiles.get(member_data.user_id, {})
    return ProjectMemberSchema(
        user_id=member_data.user_id,
        role=member_data.role,
        full_name=profile.get("full_name"),
        email=profile.get("email")
    )

