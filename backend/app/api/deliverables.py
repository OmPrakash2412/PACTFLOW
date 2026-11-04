import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.deliverable import DeliverableSubmitRequest, DeliverableResponse
from ..schemas.verification import (
    VerificationReportResponse,
    ClientApprovalRequest,
    CriterionEvaluation
)
from ..agents.evidence_inspector import evidence_inspector
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/deliverables", tags=["Deliverables & Verification"])


@router.post("/submit", response_model=DeliverableResponse)
async def submit_deliverable(
    req: DeliverableSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    milestone = db_store.milestones.get(req.milestone_id)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found.")

    project = db_store.projects.get(milestone["project_id"])
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    # Check project membership or role
    is_member = any(
        m["project_id"] == project["id"] and m["user_id"] == current_user["id"]
        for m in db_store.project_members.values()
    )
    if not is_member and project.get("client_id") != current_user["id"] and current_user["role"] != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to submit deliverables for this project."
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Check if a deliverable already exists for this milestone (e.g. revision cycle)
    existing_deliv = next(
        (d for d in db_store.deliverables.values() if d["milestone_id"] == req.milestone_id),
        None
    )

    if existing_deliv:
        d_id = existing_deliv["id"]
        version = existing_deliv.get("version", 1) + 1
        existing_deliv.update({
            "title": req.title,
            "description": req.description,
            "file_urls": req.file_urls,
            "demo_url": req.demo_url,
            "notes": req.notes,
            "version": version,
            "status": "submitted",
            "updated_at": now_iso
        })
        deliverable = existing_deliv
    else:
        d_id = str(uuid.uuid4())
        version = 1
        deliverable = {
            "id": d_id,
            "milestone_id": req.milestone_id,
            "submitted_by": current_user["id"],
            "title": req.title,
            "description": req.description,
            "file_urls": req.file_urls,
            "demo_url": req.demo_url,
            "notes": req.notes,
            "version": 1,
            "status": "submitted",
            "created_at": now_iso,
            "updated_at": now_iso
        }
        db_store.deliverables[d_id] = deliverable

    # Update milestone status to submitted
    milestone["status"] = "submitted"
    milestone["updated_at"] = now_iso

    # Trust Ledger event for deliverable submission
    db_store.record_trust_event(
        project_id=milestone["project_id"],
        event_type="DELIVERABLE_SUBMITTED",
        actor_id=current_user["id"],
        entity_id=d_id,
        payload={
            "milestone_id": req.milestone_id,
            "deliverable_id": d_id,
            "title": req.title,
            "version": version,
            "has_demo": bool(req.demo_url)
        }
    )

    # Immediately invoke Gemini Evidence Inspector for objective evaluation!
    criteria = milestone.get("acceptance_criteria", ["General quality and completeness"])
    analysis = await evidence_inspector.evaluate_deliverable(
        milestone_title=milestone["title"],
        milestone_criteria=criteria,
        deliverable_title=req.title,
        deliverable_description=req.description,
        file_urls=req.file_urls,
        demo_url=req.demo_url,
        notes=req.notes
    )

    report_id = str(uuid.uuid4())
    report_data = {
        "id": report_id,
        "deliverable_id": d_id,
        "milestone_id": req.milestone_id,
        "summary": analysis.summary,
        "criteria_analysis": [c.model_dump() for c in analysis.criteria_analysis],
        "satisfied_criteria": analysis.satisfied_criteria,
        "uncertain_criteria": analysis.uncertain_criteria,
        "missing_criteria": analysis.missing_criteria,
        "missing_evidence": analysis.missing_evidence,
        "recommendations": analysis.recommendations,
        "confidence_score": analysis.confidence_score,
        "overall_verdict": analysis.overall_verdict,
        "generated_by": "gemini-evidence-inspector",
        "created_at": now_iso
    }
    db_store.verification_reports[report_id] = report_data

    # Trust Ledger event for AI verification audit trail
    db_store.record_trust_event(
        project_id=milestone["project_id"],
        event_type="AI_EVIDENCE_VERIFIED",
        actor_id=current_user["id"],
        entity_id=report_id,
        payload={
            "verdict": analysis.overall_verdict,
            "confidence_score": analysis.confidence_score,
            "satisfied_count": len(analysis.satisfied_criteria)
        }
    )

    return DeliverableResponse(
        id=d_id,
        milestone_id=req.milestone_id,
        submitted_by=current_user["id"],
        title=req.title,
        description=req.description,
        file_urls=req.file_urls,
        demo_url=req.demo_url,
        notes=req.notes,
        version=version,
        status="submitted",
        created_at=deliverable["created_at"],
        updated_at=now_iso,
        has_verification_report=True,
        verification_report_id=report_id
    )


@router.get("/milestone/{milestone_id}", response_model=Optional[DeliverableResponse])
async def get_deliverable_by_milestone(milestone_id: str, current_user: dict = Depends(get_current_user)):
    deliv = next((d for d in db_store.deliverables.values() if d["milestone_id"] == milestone_id), None)
    if not deliv:
        return None

    # Get the latest verification report for this deliverable
    reports = [r for r in db_store.verification_reports.values() if r["deliverable_id"] == deliv["id"]]
    reports.sort(key=lambda r: r["created_at"], reverse=True)
    latest_report = reports[0] if reports else None

    return DeliverableResponse(
        id=deliv["id"],
        milestone_id=deliv["milestone_id"],
        submitted_by=deliv["submitted_by"],
        title=deliv["title"],
        description=deliv["description"],
        file_urls=deliv.get("file_urls", []),
        demo_url=deliv.get("demo_url"),
        notes=deliv.get("notes"),
        version=deliv["version"],
        status=deliv["status"],
        created_at=deliv["created_at"],
        updated_at=deliv["updated_at"],
        has_verification_report=bool(latest_report),
        verification_report_id=latest_report["id"] if latest_report else None
    )


@router.get("/report/{deliverable_id}", response_model=VerificationReportResponse)
async def get_verification_report(deliverable_id: str, current_user: dict = Depends(get_current_user)):
    reports = [r for r in db_store.verification_reports.values() if r["deliverable_id"] == deliverable_id]
    if not reports:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification report not found.")

    reports.sort(key=lambda r: r["created_at"], reverse=True)
    report = reports[0]

    return VerificationReportResponse(
        id=report["id"],
        deliverable_id=report["deliverable_id"],
        milestone_id=report["milestone_id"],
        summary=report["summary"],
        criteria_analysis=[CriterionEvaluation(**c) for c in report["criteria_analysis"]],
        satisfied_criteria=report["satisfied_criteria"],
        uncertain_criteria=report["uncertain_criteria"],
        missing_criteria=report["missing_criteria"],
        missing_evidence=report["missing_evidence"],
        recommendations=report["recommendations"],
        confidence_score=report["confidence_score"],
        overall_verdict=report["overall_verdict"],
        generated_by=report["generated_by"],
        created_at=report["created_at"]
    )


@router.post("/client-decision")
async def client_decision(req: ClientApprovalRequest, current_user: dict = Depends(get_current_user)):
    """
    CRITICAL: Only human client can approve milestones or request revisions.
    AI never approves or authorizes payouts directly.
    """
    milestone = db_store.milestones.get(req.milestone_id)
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found.")

    project = db_store.projects.get(milestone["project_id"])
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    # Role and project ownership validation
    if current_user["role"] not in ("client", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients or platform administrators can approve deliverables."
        )

    if project["client_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to make decisions on this project."
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    deliv = next((d for d in db_store.deliverables.values() if d["milestone_id"] == req.milestone_id), None)

    if req.action == "approve":
        milestone["status"] = "approved"
        milestone["updated_at"] = now_iso
        if deliv:
            deliv["status"] = "approved"
            deliv["updated_at"] = now_iso
        
        # Record Trust Ledger event
        db_store.record_trust_event(
            project_id=milestone["project_id"],
            event_type="MILESTONE_APPROVED",
            actor_id=current_user["id"],
            entity_id=milestone["id"],
            payload={
                "approved_amount": f"{milestone['amount']:.2f}",
                "feedback": req.feedback or "Approved without comments."
            }
        )
        return {
            "status": "success",
            "message": "Milestone approved by client. Ready for PayPal Invoicing.",
            "milestone_status": "approved"
        }
    else:
        milestone["status"] = "changes_requested"
        milestone["updated_at"] = now_iso
        if deliv:
            deliv["status"] = "changes_requested"
            deliv["updated_at"] = now_iso

        # Record Trust Ledger event
        db_store.record_trust_event(
            project_id=milestone["project_id"],
            event_type="REVISIONS_REQUESTED",
            actor_id=current_user["id"],
            entity_id=milestone["id"],
            payload={
                "feedback": req.feedback or "Revisions requested."
            }
        )
        return {
            "status": "success",
            "message": "Revisions requested from freelancer.",
            "milestone_status": "changes_requested"
        }
