import uuid
import datetime
from decimal import Decimal
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.milestone import (
    MilestoneCreateRequest,
    MilestoneUpdateRequest,
    MilestoneResponse
)
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/milestones", tags=["Milestones"])


def _build_milestone_response(m: dict) -> MilestoneResponse:
    # Check deliverable
    deliverable = next((d for d in db_store.deliverables.values() if d["milestone_id"] == m["id"]), None)
    latest_deliv_id = deliverable["id"] if deliverable else None
    
    # Check verification report
    report = None
    if deliverable:
        report = next((r for r in db_store.verification_reports.values() if r["deliverable_id"] == deliverable["id"]), None)
    
    latest_verdict = report["overall_verdict"] if report else None

    # Check invoice
    invoice = next((inv for inv in db_store.invoices.values() if inv["milestone_id"] == m["id"]), None)
    invoice_id = invoice["id"] if invoice else None
    invoice_status = invoice["status"] if invoice else None
    hosted_url = invoice.get("paypal_hosted_url") if invoice else None

    return MilestoneResponse(
        id=m["id"],
        project_id=m["project_id"],
        agreement_id=m.get("agreement_id"),
        sequence_order=m["sequence_order"],
        title=m["title"],
        description=m["description"],
        amount=m["amount"],
        currency=m.get("currency", "USD"),
        deadline=m.get("deadline"),
        acceptance_criteria=m.get("acceptance_criteria", []),
        status=m["status"],
        created_at=m["created_at"],
        updated_at=m["updated_at"],
        has_deliverable=bool(deliverable),
        latest_deliverable_id=latest_deliv_id,
        latest_verdict=latest_verdict,
        invoice_id=invoice_id,
        invoice_status=invoice_status,
        paypal_hosted_url=hosted_url
    )


@router.get("/project/{project_id}", response_model=List[MilestoneResponse])
async def list_project_milestones(project_id: str, current_user: dict = Depends(get_current_user)):
    ms_list = [m for m in db_store.milestones.values() if m["project_id"] == project_id]
    ms_list.sort(key=lambda x: x["sequence_order"])
    return [_build_milestone_response(m) for m in ms_list]


@router.get("/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(milestone_id: str, current_user: dict = Depends(get_current_user)):
    m = db_store.milestones.get(milestone_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found.")
    return _build_milestone_response(m)


@router.post("", response_model=MilestoneResponse)
async def create_milestone(req: MilestoneCreateRequest, current_user: dict = Depends(get_current_user)):
    project = db_store.projects.get(req.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    m_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    milestone = {
        "id": m_id,
        "project_id": req.project_id,
        "agreement_id": None,
        "sequence_order": req.sequence_order,
        "title": req.title,
        "description": req.description,
        "amount": req.amount,
        "currency": req.currency,
        "deadline": req.deadline,
        "acceptance_criteria": req.acceptance_criteria,
        "status": "pending",
        "created_at": now_iso,
        "updated_at": now_iso
    }
    db_store.milestones[m_id] = milestone
    return _build_milestone_response(milestone)
