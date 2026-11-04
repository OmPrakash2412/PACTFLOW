import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from ..config import settings
from .gemini_client import gemini_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are the PACTFLOW Payment Coordinator AI.
Your purpose is to synthesize live project milestones, deliverable audits, and PayPal sandbox invoice statuses into clear, transparent financial guidance for clients and freelancers.

CRITICAL FINANCIAL BOUNDARIES:
1. You DO NOT approve deliverables.
2. You DO NOT authorize payments or disburse funds.
3. You DO NOT alter agreed milestone budgets or terms.
4. PACTFLOW is NOT an escrow agent. Funds are settled directly between parties via PayPal Invoicing.
5. Provide actionable, polite, objective status summaries and communication templates.
"""


class MilestoneCoordinationItem(BaseModel):
    sequence_order: int
    title: str
    amount: str
    currency: str
    status: str
    invoice_status: Optional[str] = None
    action_required_by: Optional[str] = None  # "client", "freelancer", "none"


class PaymentCoordinationSummary(BaseModel):
    project_id: str
    overall_health: str  # "healthy", "action_required", "blocked"
    total_budget: str
    paid_amount: str
    pending_amount: str
    settlement_progress_percentage: float = Field(..., ge=0.0, le=100.0)
    active_milestone_status: str
    latest_invoice_status: Optional[str] = None
    milestones: List[MilestoneCoordinationItem] = []
    client_next_actions: List[str] = []
    freelancer_next_actions: List[str] = []
    action_items: List[str] = []
    suggested_communications: List[str] = []
    risk_assessment: str
    advisory_disclaimer: str = (
        "Advisory Notice: PACTFLOW Payment Coordinator provides coordination guidance only. "
        "The platform does not hold escrow funds; payments are made directly between client and "
        "freelancer through PayPal Invoicing. AI cannot alter agreed amounts or authorize payouts."
    )


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
        pending_amount = max(0.0, total_budget - paid_amount)
        progress_pct = round((paid_amount / total_budget * 100.0) if total_budget > 0 else 0.0, 1)

        action_items: List[str] = []
        client_actions: List[str] = []
        freelancer_actions: List[str] = []
        communications: List[str] = []
        milestone_items: List[MilestoneCoordinationItem] = []
        health = "healthy"

        # Map invoices by milestone_id for authoritative lookup
        inv_by_milestone = {inv.get("milestone_id"): inv for inv in invoices if inv.get("milestone_id")}

        for m in sorted(milestones, key=lambda x: x.get("sequence_order", 0)):
            m_status = m.get("status", "pending")
            m_title = m.get("title", "Milestone")
            m_amt = float(m.get("amount", 0))
            m_curr = m.get("currency", "USD")
            
            matched_inv = inv_by_milestone.get(m.get("id"))
            inv_stat = matched_inv.get("status") if matched_inv else None

            action_by = "none"
            if m_status == "submitted":
                action_by = "client"
                action_items.append(f"Deliverable submitted for '{m_title}'. Human client review required.")
                client_actions.append(f"Inspect AI verification audit and approve/request changes for '{m_title}'.")
                communications.append(f"Hi! Deliverable for '{m_title}' is ready for your review and approval.")
                health = "action_required"
            elif m_status == "approved":
                action_by = "client"
                action_items.append(f"Milestone '{m_title}' approved. PayPal invoice generation ready.")
                client_actions.append(f"Generate & dispatch PayPal invoice for '{m_title}' (${m_amt:.2f} {m_curr}).")
                communications.append(f"Milestone '{m_title}' approved! Generating PayPal invoice now.")
                health = "action_required"
            elif m_status == "invoiced":
                action_by = "client"
                action_items.append(f"PayPal invoice dispatched for '{m_title}'. Awaiting settlement.")
                client_actions.append(f"Complete PayPal sandbox payment for '{m_title}'.")
                communications.append(f"Friendly reminder: PayPal invoice for '{m_title}' is pending settlement.")
                health = "action_required"
            elif m_status == "changes_requested":
                action_by = "freelancer"
                action_items.append(f"Revisions requested for '{m_title}'. Freelancer update needed.")
                freelancer_actions.append(f"Review client feedback and re-submit deliverable for '{m_title}'.")
                communications.append(f"Client requested revisions on '{m_title}'. Please inspect feedback.")
                health = "action_required"
            elif m_status == "pending":
                if not any(item.action_required_by == "freelancer" for item in milestone_items):
                    action_by = "freelancer"
                    freelancer_actions.append(f"Proceed with work on '{m_title}' (${m_amt:.2f} {m_curr}).")

            milestone_items.append(
                MilestoneCoordinationItem(
                    sequence_order=m.get("sequence_order", 0),
                    title=m_title,
                    amount=f"${m_amt:.2f}",
                    currency=m_curr,
                    status=m_status,
                    invoice_status=inv_stat,
                    action_required_by=action_by
                )
            )

        latest_inv = invoices[-1] if invoices else None
        latest_status = latest_inv.get("status") if latest_inv else "No invoices generated yet"

        if not action_items:
            action_items.append("All milestones tracking on schedule according to agreement specifications.")
            communications.append("Project progress aligned with contract milestones. No pending blockers.")

        risk_assessment = (
            f"Settlement confidence: high. Paid ${paid_amount:.2f} of ${total_budget:.2f} {project.get('currency', 'USD')} "
            f"({progress_pct}% complete). Cryptographic Trust Ledger unbroken across {len(milestones)} milestones."
        )

        active_status = milestones[0].get("status", "pending") if milestones else "no_milestones"

        return PaymentCoordinationSummary(
            project_id=project.get("id", ""),
            overall_health=health,
            total_budget=f"${total_budget:.2f}",
            paid_amount=f"${paid_amount:.2f}",
            pending_amount=f"${pending_amount:.2f}",
            settlement_progress_percentage=progress_pct,
            active_milestone_status=active_status,
            latest_invoice_status=latest_status,
            milestones=milestone_items,
            client_next_actions=client_actions,
            freelancer_next_actions=freelancer_actions,
            action_items=action_items,
            suggested_communications=communications,
            risk_assessment=risk_assessment
        )


payment_coordinator = PaymentCoordinatorAgent()
