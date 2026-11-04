from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from decimal import Decimal
from datetime import datetime


class PayPalTokenResponse(BaseModel):
    scope: str
    access_token: str
    token_type: str
    app_id: str
    expires_in: int
    nonce: Optional[str] = None


class CurrencyAmount(BaseModel):
    currency_code: str = "USD"
    value: str


class BillingInfo(BaseModel):
    email_address: EmailStr
    name: Optional[Dict[str, str]] = None
    business_name: Optional[str] = None


class InvoiceRecipient(BaseModel):
    billing_info: BillingInfo


class InvoiceItem(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: str = "1"
    unit_amount: CurrencyAmount
    unit_of_measure: Optional[str] = "QUANTITY"


class InvoiceDetail(BaseModel):
    invoice_number: Optional[str] = None
    reference: Optional[str] = None
    invoice_date: Optional[str] = None
    currency_code: str = "USD"
    note: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    memo: Optional[str] = None


class Invoicer(BaseModel):
    name: Optional[Dict[str, str]] = None
    email_address: Optional[EmailStr] = None
    business_name: Optional[str] = None


class InvoiceConfiguration(BaseModel):
    allow_tip: bool = False
    tax_calculated_after_discount: bool = True
    tax_inclusive: bool = False
    template_id: Optional[str] = None


class InvoiceCreateRequest(BaseModel):
    detail: InvoiceDetail
    invoicer: Optional[Invoicer] = None
    primary_recipients: List[InvoiceRecipient]
    items: List[InvoiceItem]
    configuration: Optional[InvoiceConfiguration] = None


class InvoiceLink(BaseModel):
    rel: str
    href: str
    method: str


class InvoiceResponse(BaseModel):
    id: str
    status: str
    detail: Optional[Dict[str, Any]] = None
    invoicer: Optional[Dict[str, Any]] = None
    primary_recipients: Optional[List[Dict[str, Any]]] = None
    items: Optional[List[Dict[str, Any]]] = None
    amount: Optional[Dict[str, Any]] = None
    links: Optional[List[InvoiceLink]] = None

    @property
    def hosted_payer_url(self) -> Optional[str]:
        if not self.links:
            return None
        for link in self.links:
            if link.rel in ("payer-view", "payer_view", "self"):
                return link.href
        return None


class InvoiceSendResponse(BaseModel):
    links: Optional[List[InvoiceLink]] = None

    @property
    def hosted_payer_url(self) -> Optional[str]:
        if not self.links:
            return None
        for link in self.links:
            if link.rel in ("payer-view", "payer_view"):
                return link.href
        return None


class WebhookVerifyRequest(BaseModel):
    auth_algo: str
    cert_url: str
    transmission_id: str
    transmission_sig: str
    transmission_time: str
    webhook_id: str
    webhook_event: Dict[str, Any]


class WebhookVerifyResponse(BaseModel):
    verification_status: str  # "SUCCESS" or "FAILURE"


class PayPalWebhookEvent(BaseModel):
    id: str
    event_version: Optional[str] = None
    create_time: datetime
    resource_type: str
    event_type: str
    summary: Optional[str] = None
    resource: Dict[str, Any]
    links: Optional[List[Dict[str, Any]]] = None

