import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from ..config import settings
from .gemini_client import gemini_client

logger = logging.getLogger(__name__)


class PaymentCoordinationSummary(BaseModel):
    project_id: str
    overall_health: str  # "healthy", "action_required", "blocked"
    total_budget: str
    paid_amount: str
    pending_amount: str
    active_milestone_status: str
    latest_invoice_status: Optional[str] = None
    action_items: List[str]
    suggested_communications: List[str]
    risk_assessment: str


class PaymentCoordinatorAgent:
    def __init__(self, client=None):
        self._client = client or gemini_client

    async def analyze_project_status(
        self,
        project: Dict[str, Any],
        milestones: List[Dict[str, Any]],
        invoices: List[Dict[str, Any]]
    ) -> PaymentCoordinationSummary:
        total_budget = float(project.get("budget", 0))
        paid_amount = sum(
            float(m.get("amount", 0)) for m in milestones if m.get("status") == "paid"
        )
        pending_amount = total_budget - paid_amount

        action_items = []
        communications = []
        health = "healthy"

        # Check for unapproved deliverables or pending invoices
        for m in milestones:
            m_status = m.get("status")
            m_title = m.get("title")
            if m_status == "submitted":
                action_items.append(f"Deliverable for '{m_title}' is submitted. Client review required.")
                communications.append(f"Reminder to client: Please review deliverable for milestone '{m_title}'.")
                health = "action_required"
            elif m_status == "approved":
                action_items.append(f"Milestone '{m_title}' is approved. Ready for PayPal invoice generation.")
                communications.append(f"Notice: Generate PayPal invoice for milestone '{m_title}'.")
                health = "action_required"
            elif m_status == "invoiced":
                action_items.append(f"PayPal invoice sent for '{m_title}'. Awaiting client payment.")
                communications.append(f"Friendly payment reminder: PayPal invoice sent for '{m_title}'.")

        latest_inv = invoices[-1] if invoices else None
        latest_status = latest_inv.get("status") if latest_inv else "No invoices generated yet"

        if not action_items:
            action_items.append("All milestones are tracking according to schedule.")
            communications.append("Project progress on track. No pending actions.")

        risk_assessment = (
            f"Low risk. Settled {paid_amount:.2f} of {total_budget:.2f} USD. "
            f"Dual-party agreement sealed and all payments backed by PayPal Invoicing v2."
        )

        return PaymentCoordinationSummary(
            project_id=project.get("id", ""),
            overall_health=health,
            total_budget=f"${total_budget:.2f}",
            paid_amount=f"${paid_amount:.2f}",
            pending_amount=f"${pending_amount:.2f}",
            active_milestone_status=milestones[0].get("status", "pending") if milestones else "no_milestones",
            latest_invoice_status=latest_status,
            action_items=action_items,
            suggested_communications=communications,
            risk_assessment=risk_assessment
        )


payment_coordinator = PaymentCoordinatorAgent()

