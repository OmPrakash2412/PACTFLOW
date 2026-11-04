from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal


class BudgetItem(BaseModel):
    milestone: str
    amount: Decimal
    percentage: float


class SuggestedMilestone(BaseModel):
    sequence_order: int
    title: str
    description: str
    amount: Decimal
    acceptance_criteria: List[str]


class AgreementStructure(BaseModel):
    title: str
    scope_of_work: str
    budget_allocation: List[BudgetItem]
    acceptance_criteria: List[str]
    assumptions: List[str]
    clarification_questions: List[str]
    suggested_milestones: List[SuggestedMilestone]


class AgreementGenerateRequest(BaseModel):
    project_id: str
    requirements: Optional[str] = None
    target_budget: Optional[Decimal] = None
    target_deadline: Optional[str] = None


class AgreementAcceptRequest(BaseModel):
    agreement_id: str


class AgreementAcceptanceRecord(BaseModel):
    id: str
    agreement_id: str
    user_id: str
    role: str
    accepted_at: str
    signature_hash: str


class AgreementResponse(BaseModel):
    id: str
    project_id: str
    version: int
    title: str
    scope_of_work: str
    budget_allocation: List[Dict[str, Any]]
    acceptance_criteria: List[str]
    assumptions: List[str]
    clarification_questions: List[str]
    status: str
    created_at: str
    updated_at: str
    acceptances: Optional[List[AgreementAcceptanceRecord]] = None
    is_client_accepted: bool = False
    is_freelancer_accepted: bool = False

