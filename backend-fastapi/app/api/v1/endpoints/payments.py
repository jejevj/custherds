from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import xendit
from app.core.config import settings
import uuid

router = APIRouter()

# ---------------------------------------------------------------------------
# Init Xendit (Python 3.9 compatible — uses xendit-python v0.x API style)
# ---------------------------------------------------------------------------

def _init_xendit():
    xendit.api_key = settings.XENDIT_SECRET_KEY


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


class CreateVAPayload(BaseModel):
    external_id: Optional[str] = None
    bank_code: str  # e.g. "BNI", "BCA", "MANDIRI", "BRI"
    name: str
    expected_amount: Optional[float] = None
    is_closed: Optional[bool] = False
    expiration_date: Optional[str] = None  # ISO8601 string


class CreateQRPayload(BaseModel):
    external_id: Optional[str] = None
    type: Optional[str] = "DYNAMIC"   # STATIC | DYNAMIC
    callback_url: Optional[str] = None
    amount: Optional[float] = None


# ---------------------------------------------------------------------------
# 1. Create Invoice
# ---------------------------------------------------------------------------

@router.post("/invoice", summary="Create a Xendit Invoice")
async def create_invoice(payload: CreateInvoicePayload):
    """
    Creates a Xendit-hosted payment invoice and returns `invoice_url`
    that the payer opens to complete payment.
    """
    _init_xendit()
    external_id = payload.external_id or f"inv-{uuid.uuid4().hex[:12]}"

    try:
        kwargs = dict(
            external_id=external_id,
            amount=payload.amount,
            payer_email=payload.payer_email,
            description=payload.description,
            currency=payload.currency,
        )
        if payload.success_redirect_url:
            kwargs["success_redirect_url"] = payload.success_redirect_url
        if payload.failure_redirect_url:
            kwargs["failure_redirect_url"] = payload.failure_redirect_url

        invoice = xendit.Invoice.create(**kwargs)

        return {
            "status": "ok",
            "invoice_id": invoice.id,
            "external_id": invoice.external_id,
            "invoice_url": invoice.invoice_url,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "expiry_date": str(invoice.expiry_date) if hasattr(invoice, 'expiry_date') else None,
        }

    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
    _init_xendit()
    try:
        invoice = xendit.Invoice.get(invoice_id=invoice_id)
        return {
            "invoice_id": invoice.id,
            "external_id": invoice.external_id,
            "status": invoice.status,
            "amount": invoice.amount,
            "currency": invoice.currency,
            "invoice_url": invoice.invoice_url,
            "paid_at": str(invoice.paid_at) if hasattr(invoice, 'paid_at') and invoice.paid_at else None,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
    _init_xendit()
    try:
        result = xendit.Invoice.expire(invoice_id=invoice_id)
        return {
            "status": "ok",
            "invoice_id": result.id,
            "new_status": result.status,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 4. Create Virtual Account
# ---------------------------------------------------------------------------

@router.post("/virtual-account", summary="Create a Virtual Account")
async def create_virtual_account(payload: CreateVAPayload):
    """
    Creates a Virtual Account for payment.
    `bank_code` options: BNI, BCA, MANDIRI, BRI, PERMATA, BSI, BJB
    """
    _init_xendit()
    external_id = payload.external_id or f"va-{uuid.uuid4().hex[:12]}"

    try:
        kwargs = dict(
            external_id=external_id,
            bank_code=payload.bank_code.upper(),
            name=payload.name,
        )
        if payload.expected_amount is not None:
            kwargs["expected_amount"] = payload.expected_amount
            kwargs["is_closed"] = True
        if payload.expiration_date:
            kwargs["expiration_date"] = payload.expiration_date

        va = xendit.VirtualAccount.create(**kwargs)

        return {
            "status": "ok",
            "id": va.id,
            "external_id": va.external_id,
            "bank_code": va.bank_code,
            "account_number": va.account_number,
            "name": va.name,
            "expected_amount": getattr(va, 'expected_amount', None),
            "expiration_date": str(va.expiration_date) if hasattr(va, 'expiration_date') and va.expiration_date else None,
        }

    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 5. Get Virtual Account by ID
# ---------------------------------------------------------------------------

@router.get("/virtual-account/{va_id}", summary="Get Virtual Account by ID")
async def get_virtual_account(va_id: str):
    _init_xendit()
    try:
        va = xendit.VirtualAccount.get(id=va_id)
        return {
            "id": va.id,
            "external_id": va.external_id,
            "bank_code": va.bank_code,
            "account_number": va.account_number,
            "status": getattr(va, 'status', None),
            "name": va.name,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 6. Create QR Code (QRIS)
# ---------------------------------------------------------------------------

@router.post("/qr-code", summary="Create a QRIS / QR Code")
async def create_qr_code(payload: CreateQRPayload):
    """
    Creates a QRIS QR Code for payment.
    - `type`: DYNAMIC (one-time) or STATIC (reusable)
    - `amount`: required for DYNAMIC QR
    """
    _init_xendit()
    external_id = payload.external_id or f"qr-{uuid.uuid4().hex[:12]}"

    try:
        kwargs = dict(
            external_id=external_id,
            type=payload.type.upper(),
        )
        if payload.callback_url:
            kwargs["callback_url"] = payload.callback_url
        if payload.amount is not None:
            kwargs["amount"] = payload.amount

        qr = xendit.QRCode.create(**kwargs)

        return {
            "status": "ok",
            "id": qr.id,
            "external_id": qr.external_id,
            "qr_string": qr.qr_string,
            "type": qr.type,
            "amount": getattr(qr, 'amount', None),
        }

    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 7. Webhook handler
# ---------------------------------------------------------------------------

@router.post("/webhook", summary="Xendit Webhook Receiver")
async def xendit_webhook(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    """
    Receives Xendit callback/webhook events.
    Verifies `x-callback-token` against `XENDIT_WEBHOOK_TOKEN` in `.env`.
    """
    if settings.XENDIT_WEBHOOK_TOKEN:
        if x_callback_token != settings.XENDIT_WEBHOOK_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid webhook token")

    body = await request.json()
    event_type = body.get("event") or body.get("status", "UNKNOWN")

    if event_type in ("PAID", "SETTLED"):
        external_id = body.get("external_id")
        paid_amount = body.get("paid_amount")
        # TODO: update order status in DB
        return {"status": "ok", "message": f"Invoice {external_id} paid", "amount": paid_amount}

    if event_type == "ACTIVE":
        # Virtual Account created / active
        return {"status": "ok", "event": "VA_ACTIVE", "data": body}

    if event_type == "COMPLETED":
        # QR Code payment completed
        external_id = body.get("external_id")
        return {"status": "ok", "message": f"QR payment {external_id} completed"}

    if event_type == "EXPIRED":
        external_id = body.get("external_id")
        return {"status": "ok", "message": f"Invoice {external_id} expired"}

    return {"status": "ok", "event": event_type, "raw": body}
