from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal


class InvoiceGenerateRequest(BaseModel):
    milestone_id: str


class InvoiceResponseSchema(BaseModel):
    id: str
    milestone_id: str
    project_id: str
    client_id: str
    freelancer_id: str
    paypal_invoice_id: Optional[str] = None
    paypal_invoice_number: Optional[str] = None
    status: str
    amount: Decimal
    currency: str
    invoice_date: str
    due_date: Optional[str] = None
    paypal_hosted_url: Optional[str] = None
    created_at: str
    updated_at: str

