from typing import List, Optional
from pydantic import BaseModel, Field
from decimal import Decimal


class MilestoneCreateRequest(BaseModel):
    project_id: str
    sequence_order: int
    title: str = Field(..., min_length=3, max_length=255)
    description: str
    amount: Decimal = Field(..., gt=0)
    currency: str = "USD"
    deadline: Optional[str] = None
    acceptance_criteria: List[str] = []


class MilestoneUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    acceptance_criteria: Optional[List[str]] = None


class MilestoneResponse(BaseModel):
    id: str
    project_id: str
    agreement_id: Optional[str] = None
    sequence_order: int
    title: str
    description: str
    amount: Decimal
    currency: str
    deadline: Optional[str] = None
    acceptance_criteria: List[str]
    status: str
    created_at: str
    updated_at: str
    has_deliverable: bool = False
    latest_deliverable_id: Optional[str] = None
    latest_verdict: Optional[str] = None
    invoice_id: Optional[str] = None
    invoice_status: Optional[str] = None
    paypal_hosted_url: Optional[str] = None
