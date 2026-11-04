from fastapi import APIRouter, HTTPException, status, Depends
from ..agents.payment_coordinator import payment_coordinator, PaymentCoordinationSummary
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Agents"])


@router.get("/coordinator/{project_id}", response_model=PaymentCoordinationSummary)
async def get_payment_coordination(project_id: str, current_user: dict = Depends(get_current_user)):
    project = db_store.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    milestones = [m for m in db_store.milestones.values() if m["project_id"] == project_id]
    invoices = [inv for inv in db_store.invoices.values() if inv["project_id"] == project_id]

    summary = await payment_coordinator.analyze_project_status(
        project=project,
        milestones=milestones,
        invoices=invoices
    )
    return summary

