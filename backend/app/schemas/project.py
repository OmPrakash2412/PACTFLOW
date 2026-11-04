from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal


class ProjectMemberSchema(BaseModel):
    user_id: str
    role: str
    full_name: Optional[str] = None
    email: Optional[str] = None


class ProjectCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    budget: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    deadline: Optional[str] = None
    freelancer_email: Optional[str] = None


class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[Decimal] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    client_id: str
    title: str
    description: str
    budget: Decimal
    currency: str
    deadline: Optional[str] = None
    status: str
    created_at: str
    updated_at: str
    client_name: Optional[str] = None
    freelancer_id: Optional[str] = None
    freelancer_name: Optional[str] = None
    freelancer_email: Optional[str] = None
    members: Optional[List[ProjectMemberSchema]] = None

