from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from decimal import Decimal

VerdictType = Literal["satisfied", "uncertain", "missing", "unable_to_verify"]


class CriterionEvaluation(BaseModel):
    criterion: str
    verdict: VerdictType
    evidence_reference: str
    notes: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)


class VerificationReportStructure(BaseModel):
    summary: str
    criteria_analysis: List[CriterionEvaluation]
    satisfied_criteria: List[str]
    uncertain_criteria: List[str]
    missing_criteria: List[str]
    missing_evidence: List[str]
    recommendations: List[str]
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    overall_verdict: VerdictType


class VerificationReportResponse(BaseModel):
    id: str
    deliverable_id: str
    milestone_id: str
    summary: str
    criteria_analysis: List[CriterionEvaluation]
    satisfied_criteria: List[str]
    uncertain_criteria: List[str]
    missing_criteria: List[str]
    missing_evidence: List[str]
    recommendations: List[str]
    confidence_score: float
    overall_verdict: VerdictType
    generated_by: str
    created_at: str


class ClientApprovalRequest(BaseModel):
    milestone_id: str
    action: Literal["approve", "request_revisions"]
    feedback: Optional[str] = None

