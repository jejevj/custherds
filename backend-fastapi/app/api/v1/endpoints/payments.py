from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import xendit
from xendit.apis import InvoiceApi, PaymentRequestApi
from xendit.model.create_invoice_request import CreateInvoiceRequest
from app.core.config import settings
import uuid
import hmac
import hashlib

router = APIRouter()

# ---------------------------------------------------------------------------
# Xendit API client (initialised once, reused per request)
# ---------------------------------------------------------------------------

def _get_api_client() -> xendit.ApiClient:
    configuration = xendit.Configuration(
        access_token=settings.XENDIT_SECRET_KEY
    )
    return xendit.ApiClient(configuration)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CreateInvoicePayload(BaseModel):
    amount: float
    payer_email: EmailStr
    description: str
    external_id: Optional[str] = None
    currency: Optional[str] = "IDR"
    success_redirect_url: Optional[str] = None
    failure_redirect_url: Optional[str] = None


class CreatePaymentRequestPayload(BaseModel):
    amount: float
    currency: Optional[str] = "IDR"
    payment_method_type: str  # e.g. "QR_CODE" or "VIRTUAL_ACCOUNT"
    reference_id: Optional[str] = None
    description: Optional[str] = ""
    # Virtual Account specific
    bank_code: Optional[str] = None          # e.g. "BNI", "BCA", "MANDIRI"
    # QR Code specific
    qr_type: Optional[str] = "DYNAMIC"       # STATIC | DYNAMIC


# ---------------------------------------------------------------------------
# 1. Create Invoice
# ---------------------------------------------------------------------------

@router.post("/invoice", summary="Create a Xendit Invoice")
async def create_invoice(payload: CreateInvoicePayload):
    """
    Creates a Xendit-hosted payment invoice and returns the `invoice_url`
    that the payer can open in a browser to complete payment.
    """
    external_id = payload.external_id or f"inv-{uuid.uuid4().hex[:12]}"

    try:
        with _get_api_client() as api_client:
            api_instance = InvoiceApi(api_client)
            body = CreateInvoiceRequest(
                external_id=external_id,
                amount=payload.amount,
                payer_email=payload.payer_email,
                description=payload.description,
                currency=payload.currency,
                **(dict(success_redirect_url=payload.success_redirect_url) if payload.success_redirect_url else {}),
                **(dict(failure_redirect_url=payload.failure_redirect_url) if payload.failure_redirect_url else {}),
            )
            invoice = api_instance.create_invoice(create_invoice_request=body)

        return {
            "status": "ok",
            "invoice_id": invoice.id,
            "external_id": invoice.external_id,
            "invoice_url": invoice.invoice_url,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "expiry_date": str(invoice.expiry_date) if hasattr(invoice, 'expiry_date') else None,
        }

    except xendit.ApiException as e:
        raise HTTPException(status_code=e.status, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 2. Get Invoice by ID
# ---------------------------------------------------------------------------

@router.get("/invoice/{invoice_id}", summary="Get Invoice by ID")
async def get_invoice(invoice_id: str):
    """
    Fetches the current status and details of a Xendit invoice.
    """
    try:
        with _get_api_client() as api_client:
            api_instance = InvoiceApi(api_client)
            invoice = api_instance.get_invoice_by_id(invoice_id=invoice_id)

        return {
            "invoice_id": invoice.id,
            "external_id": invoice.external_id,
            "status": invoice.status,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "invoice_url": invoice.invoice_url,
            "paid_at": str(invoice.paid_at) if hasattr(invoice, 'paid_at') and invoice.paid_at else None,
        }

    except xendit.ApiException as e:
        raise HTTPException(status_code=e.status, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 3. Expire / Cancel an Invoice
# ---------------------------------------------------------------------------

@router.post("/invoice/{invoice_id}/expire", summary="Expire an Invoice")
async def expire_invoice(invoice_id: str):
    """
    Marks an unpaid invoice as EXPIRED so it can no longer be paid.
    """
    try:
        with _get_api_client() as api_client:
            api_instance = InvoiceApi(api_client)
            result = api_instance.expire_invoice(invoice_id=invoice_id)

        return {
            "status": "ok",
            "invoice_id": result.id,
            "new_status": result.status,
        }

    except xendit.ApiException as e:
        raise HTTPException(status_code=e.status, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 4. Create Payment Request (Virtual Account or QR Code / QRIS)
# ---------------------------------------------------------------------------

@router.post("/payment-request", summary="Create Virtual Account or QR Code payment")
async def create_payment_request(payload: CreatePaymentRequestPayload):
    """
    Creates a Xendit Payment Request for:
    - **Virtual Account** (`payment_method_type="VIRTUAL_ACCOUNT"`, provide `bank_code`)
    - **QRIS / QR Code** (`payment_method_type="QR_CODE"`)

    Returns the payment method details (VA number or QR string).
    """
    reference_id = payload.reference_id or f"pr-{uuid.uuid4().hex[:12]}"

    try:
        with _get_api_client() as api_client:
            api_instance = PaymentRequestApi(api_client)

            pmt_type = payload.payment_method_type.upper()

            if pmt_type == "VIRTUAL_ACCOUNT":
                if not payload.bank_code:
                    raise HTTPException(
                        status_code=400,
                        detail="bank_code is required for VIRTUAL_ACCOUNT payment method"
                    )
                payment_method = {
                    "type": "VIRTUAL_ACCOUNT",
                    "reusability": "ONE_TIME_USE",
                    "virtual_account": {
                        "channel_code": payload.bank_code.upper(),
                        "channel_properties": {
                            "customer_name": "Custherds Customer",
                            "expires_at": None,
                        },
                    },
                }
            elif pmt_type == "QR_CODE":
                payment_method = {
                    "type": "QR_CODE",
                    "reusability": "ONE_TIME_USE",
                    "qr_code": {
                        "channel_code": "QRIS",
                    },
                }
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported payment_method_type: {pmt_type}. Use VIRTUAL_ACCOUNT or QR_CODE."
                )

            body = {
                "reference_id": reference_id,
                "amount": payload.amount,
                "currency": payload.currency,
                "payment_method": payment_method,
                "description": payload.description,
            }

            result = api_instance.create_payment_request(
                for_user_id=None,
                payment_request_parameters=body
            )

        return {
            "status": "ok",
            "payment_request_id": result.id,
            "reference_id": result.reference_id,
            "payment_method_type": pmt_type,
            "amount": result.amount,
            "currency": result.currency,
            "payment_method": result.payment_method,
        }

    except HTTPException:
        raise
    except xendit.ApiException as e:
        raise HTTPException(status_code=e.status, detail=e.reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 5. Webhook handler
# ---------------------------------------------------------------------------

@router.post("/webhook", summary="Xendit Webhook Receiver", include_in_schema=True)
async def xendit_webhook(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    """
    Receives Xendit callback/webhook events (invoice paid, payment completed, etc.).

    Xendit sends an `x-callback-token` header — verify it matches
    `XENDIT_WEBHOOK_TOKEN` in your `.env` before processing.
    """
    # Verify callback token
    if settings.XENDIT_WEBHOOK_TOKEN:
        if x_callback_token != settings.XENDIT_WEBHOOK_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid webhook token")

    body = await request.json()
    event_type = body.get("event") or body.get("status", "UNKNOWN")

    # --- Handle events ---
    if event_type in ("PAID", "SETTLED"):
        # Invoice paid — update your DB order status here
        external_id = body.get("external_id")
        paid_amount = body.get("paid_amount")
        # TODO: update order status in DB via SQLAlchemy
        return {"status": "ok", "message": f"Invoice {external_id} marked as paid", "amount": paid_amount}

    if event_type == "payment.succeeded":
        # Payment Request succeeded (VA / QRIS)
        reference_id = body.get("data", {}).get("reference_id")
        # TODO: update order status in DB
        return {"status": "ok", "message": f"Payment {reference_id} succeeded"}

    if event_type == "EXPIRED":
        external_id = body.get("external_id")
        return {"status": "ok", "message": f"Invoice {external_id} expired"}

    # Default ack
    return {"status": "ok", "event": event_type, "raw": body}
