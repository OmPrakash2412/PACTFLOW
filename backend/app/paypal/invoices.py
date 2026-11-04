from typing import Optional, Dict, Any, List
from decimal import Decimal
import logging
from .client import PayPalClient, paypal_client
from .schemas import (
    InvoiceCreateRequest,
    InvoiceResponse,
    InvoiceSendResponse,
    InvoiceDetail,
    InvoiceRecipient,
    BillingInfo,
    InvoiceItem,
    CurrencyAmount,
    Invoicer,
    InvoiceConfiguration,
)

logger = logging.getLogger(__name__)


class PayPalInvoiceService:
    def __init__(self, client: Optional[PayPalClient] = None):
        self._client = client or paypal_client

    async def generate_invoice_number(self) -> str:
        """
        Calls PayPal API to get the next sequential invoice number.
        """
        response = await self._client.request(
            method="POST",
            path="/v2/invoicing/generate-next-invoice-number"
        )
        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"Failed to generate invoice number ({response.status_code}): {response.text}"
            )
        data = response.json()
        return data.get("invoice_number", f"PACTFLOW-{response.status_code}")

    async def create_invoice(self, request: InvoiceCreateRequest) -> InvoiceResponse:
        """
        Creates a draft invoice in PayPal Sandbox Invoicing API v2.
        """
        payload = request.model_dump(exclude_none=True)
        response = await self._client.request(
            method="POST",
            path="/v2/invoicing/invoices",
            json_data=payload
        )
        if response.status_code not in (200, 201):
            raise RuntimeError(
                f"Failed to create PayPal invoice ({response.status_code}): {response.text}"
            )
        data = response.json()
        return InvoiceResponse(**data)

    async def send_invoice(
        self,
        invoice_id: str,
        subject: Optional[str] = None,
        note: Optional[str] = None,
        send_to_recipient: bool = True,
        send_to_invoicer: bool = True
    ) -> InvoiceSendResponse:
        """
        Sends the invoice via PayPal Invoicing API v2.
        PayPal sends an email with the payment link and returns the payer-view link.
        """
        payload: Dict[str, Any] = {
            "send_to_recipient": send_to_recipient,
            "send_to_invoicer": send_to_invoicer
        }
        if subject:
            payload["subject"] = subject
        if note:
            payload["note"] = note

        response = await self._client.request(
            method="POST",
            path=f"/v2/invoicing/invoices/{invoice_id}/send",
            json_data=payload
        )
        if response.status_code not in (200, 202):
            raise RuntimeError(
                f"Failed to send PayPal invoice {invoice_id} ({response.status_code}): {response.text}"
            )

        data = response.json() if response.content else {}
        return InvoiceSendResponse(**data)

    async def get_invoice(self, invoice_id: str) -> InvoiceResponse:
        """
        Authoritatively retrieves an invoice's live status from PayPal Sandbox.
        """
        response = await self._client.request(
            method="GET",
            path=f"/v2/invoicing/invoices/{invoice_id}"
        )
        if response.status_code != 200:
            raise RuntimeError(
                f"Failed to retrieve PayPal invoice {invoice_id} ({response.status_code}): {response.text}"
            )
        data = response.json()
        return InvoiceResponse(**data)

    async def create_milestone_invoice(
        self,
        milestone_title: str,
        amount: Decimal,
        currency: str,
        client_email: str,
        freelancer_email: str,
        project_title: str,
        milestone_id: str
    ) -> InvoiceResponse:
        """
        Convenience builder that structures and creates a milestone invoice for PayPal.
        """
        try:
            inv_number = await self.generate_invoice_number()
        except Exception:
            inv_number = f"PF-{milestone_id[:8].upper()}"

        req = InvoiceCreateRequest(
            detail=InvoiceDetail(
                invoice_number=inv_number,
                reference=f"PACTFLOW-MS-{milestone_id}",
                currency_code=currency,
                note=f"PACTFLOW Milestone Settlement: {milestone_title} (Project: {project_title})",
                terms_and_conditions="Payment releases upon deliverable verification and client approval in PACTFLOW."
            ),
            invoicer=Invoicer(
                email_address=freelancer_email,
                business_name="PACTFLOW Verified Freelancer"
            ),
            primary_recipients=[
                InvoiceRecipient(
                    billing_info=BillingInfo(
                        email_address=client_email
                    )
                )
            ],
            items=[
                InvoiceItem(
                    name=milestone_title,
                    description=f"Verified deliverable for milestone under project: {project_title}",
                    quantity="1",
                    unit_amount=CurrencyAmount(
                        currency_code=currency,
                        value=f"{amount:.2f}"
                    )
                )
            ],
            configuration=InvoiceConfiguration(
                allow_tip=False,
                tax_calculated_after_discount=True
            )
        )
        return await self.create_invoice(req)


paypal_invoice_service = PayPalInvoiceService()

