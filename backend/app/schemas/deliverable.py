from typing import List, Optional
from pydantic import BaseModel, Field


class DeliverableSubmitRequest(BaseModel):
    milestone_id: str
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    file_urls: List[str] = []
    demo_url: Optional[str] = None
    notes: Optional[str] = None


class DeliverableResponse(BaseModel):
    id: str
    milestone_id: str
    submitted_by: str
    title: str
    description: str
    file_urls: List[str]
    demo_url: Optional[str] = None
    notes: Optional[str] = None
    version: int
    status: str
    created_at: str
    updated_at: str
    has_verification_report: bool = False
    verification_report_id: Optional[str] = None
