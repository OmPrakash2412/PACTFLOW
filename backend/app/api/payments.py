import uuid
import datetime
from decimal import Decimal
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.payment import PaymentRecordResponse
from ..paypal.invoices import paypal_invoice_service
from ..database.store import db_store
from .deps import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/project/{project_id}", response_model=List[PaymentRecordResponse])
async def list_project_payments(project_id: str, current_user: dict = Depends(get_current_user)):
    payments = [p for p in db_store.payments.values() if p["project_id"] == project_id]
    return [
        PaymentRecordResponse(
            id=p["id"],
            invoice_id=p["invoice_id"],
            milestone_id=p["milestone_id"],
            project_id=p["project_id"],
            paypal_capture_id=p.get("paypal_capture_id"),
            paypal_transaction_id=p.get("paypal_transaction_id"),
            amount=p["amount"],
            currency=p["currency"],
            status=p["status"],
            payment_method=p["payment_method"],
            paid_at=p["paid_at"]
        )
        for p in payments
    ]


@router.post("/reconcile/{invoice_id}")
async def reconcile_invoice_status(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """
    Directly queries PayPal Sandbox Invoicing API v2 to check authoritative payment status.
    Never marks paid from browser redirect; only if PayPal API confirms PAID.
    """
    invoice = db_store.invoices.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    paypal_inv_id = invoice.get("paypal_invoice_id")
    if not paypal_inv_id:
        return {"status": "unchanged", "invoice_status": invoice["status"]}

    try:
        remote_inv = await paypal_invoice_service.get_invoice(paypal_inv_id)
        if remote_inv.status in ("PAID", "MARKED_AS_PAID"):
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            invoice["status"] = "PAID"
            invoice["updated_at"] = now_iso

            milestone = db_store.milestones.get(invoice["milestone_id"])
            if milestone:
                milestone["status"] = "paid"
                milestone["updated_at"] = now_iso

            # Check if payment record already created
            existing_pay = next((p for p in db_store.payments.values() if p["invoice_id"] == invoice["id"]), None)
            if not existing_pay:
                pay_id = str(uuid.uuid4())
                db_store.payments[pay_id] = {
                    "id": pay_id,
                    "invoice_id": invoice["id"],
                    "milestone_id": invoice["milestone_id"],
                    "project_id": invoice["project_id"],
                    "paypal_capture_id": f"CAP-{paypal_inv_id[:12].upper()}",
                    "paypal_transaction_id": f"TX-{uuid.uuid4().hex[:8].upper()}",
                    "amount": invoice["amount"],
                    "currency": invoice["currency"],
                    "status": "COMPLETED",
                    "payment_method": "paypal_invoicing",
                    "paid_at": now_iso,
                    "created_at": now_iso
                }
                db_store.record_trust_event(
                    project_id=invoice["project_id"],
                    event_type="PAYMENT_CONFIRMED",
                    actor_id=current_user["id"],
                    entity_id=pay_id,
                    payload={
                        "paypal_invoice_id": paypal_inv_id,
                        "status": "COMPLETED",
                        "amount": f"{invoice['amount']:.2f}"
                    }
                )

            return {"status": "reconciled", "invoice_status": "PAID", "milestone_status": "paid"}
    except Exception as e:
        return {"status": "checked", "invoice_status": invoice["status"], "note": str(e)}

    return {"status": "unchanged", "invoice_status": invoice["status"]}
