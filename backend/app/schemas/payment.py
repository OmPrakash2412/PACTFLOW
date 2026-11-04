from typing import Optional, Dict, Any
from pydantic import BaseModel
from decimal import Decimal


class PaymentRecordResponse(BaseModel):
    id: str
    invoice_id: str
    milestone_id: str
    project_id: str
    paypal_capture_id: Optional[str] = None
    paypal_transaction_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    payment_method: str
    paid_at: str

