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


def _verify_webhook(token: Optional[str]):
    """Reusable webhook token verifier."""
    if settings.XENDIT_WEBHOOK_TOKEN:
        if token != settings.XENDIT_WEBHOOK_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid webhook token")


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


# ===========================================================================
# WEBHOOK ROUTES — Satu endpoint per product Xendit
# Semua menggunakan token verifikasi yang sama (XENDIT_WEBHOOK_TOKEN)
# Daftarkan masing-masing URL di Dashboard Xendit > Settings > Callbacks
# ===========================================================================

# ---------------------------------------------------------------------------
# W1. Invoice Webhook
# URL: /api/v1/payments/webhook/invoice
# Dashboard: INVOICES > Invoices paid, also notify expired
# ---------------------------------------------------------------------------
@router.post("/webhook/invoice", summary="[Webhook] Xendit Invoice")
async def webhook_invoice(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    status = body.get("status", "UNKNOWN")
    external_id = body.get("external_id")
    paid_amount = body.get("paid_amount")
    # TODO: update order/invoice status in DB
    # status: PAID, EXPIRED, SETTLED
    return {"status": "ok", "event": "invoice", "invoice_status": status, "external_id": external_id, "paid_amount": paid_amount}


# ---------------------------------------------------------------------------
# W2. Fixed Virtual Account (FVA) Webhook
# URL: /api/v1/payments/webhook/fva
# Dashboard: FIXED VIRTUAL ACCOUNTS > FVA created
# ---------------------------------------------------------------------------
@router.post("/webhook/fva", summary="[Webhook] Fixed Virtual Account")
async def webhook_fva(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", body.get("status", "UNKNOWN"))
    external_id = body.get("external_id")
    # TODO: handle FVA created / payment received
    return {"status": "ok", "event": "fva", "fva_event": event, "external_id": external_id}


# ---------------------------------------------------------------------------
# W3. Disbursement Webhook
# URL: /api/v1/payments/webhook/disbursement
# Dashboard: DISBURSEMENT > Disbursement sent, Batch disbursement sent
# ---------------------------------------------------------------------------
@router.post("/webhook/disbursement", summary="[Webhook] Disbursement")
async def webhook_disbursement(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    status = body.get("status", "UNKNOWN")
    disbursement_id = body.get("id") or body.get("disbursement_id")
    # TODO: update disbursement record in DB
    # status: COMPLETED, FAILED
    return {"status": "ok", "event": "disbursement", "disbursement_status": status, "disbursement_id": disbursement_id}


# ---------------------------------------------------------------------------
# W4. Payout Link Webhook
# URL: /api/v1/payments/webhook/payout
# Dashboard: PAYOUT LINK > Payout Links
# ---------------------------------------------------------------------------
@router.post("/webhook/payout", summary="[Webhook] Payout Link")
async def webhook_payout(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    status = body.get("status", "UNKNOWN")
    # TODO: handle payout completed/failed
    return {"status": "ok", "event": "payout", "payout_status": status, "raw": body}


# ---------------------------------------------------------------------------
# W5. Retail Outlets / OTC Webhook
# URL: /api/v1/payments/webhook/retail
# Dashboard: RETAIL OUTLETS (OTC) > Retail outlets (OTC) paid
# ---------------------------------------------------------------------------
@router.post("/webhook/retail", summary="[Webhook] Retail Outlets (OTC)")
async def webhook_retail(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    external_id = body.get("external_id")
    amount = body.get("amount")
    # TODO: update order status in DB for OTC payment
    return {"status": "ok", "event": "retail_otc", "external_id": external_id, "amount": amount}


# ---------------------------------------------------------------------------
# W6. Cards Webhook (Authentication & Tokenization)
# URL: /api/v1/payments/webhook/cards
# Dashboard: CARDS > Cards authentication, Cards tokenization
# ---------------------------------------------------------------------------
@router.post("/webhook/cards", summary="[Webhook] Cards Auth & Tokenization")
async def webhook_cards(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle card auth result / token saved
    return {"status": "ok", "event": "cards", "card_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W7. Direct Debit Webhook
# URL: /api/v1/payments/webhook/direct-debit
# Dashboard: DIRECT DEBIT > Account linked, Payment completed,
#            Expiring/Expired payment method, Refund finalized
# ---------------------------------------------------------------------------
@router.post("/webhook/direct-debit", summary="[Webhook] Direct Debit")
async def webhook_direct_debit(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", body.get("type", "UNKNOWN"))
    # TODO: handle account linked, payment completed, expired, refund
    return {"status": "ok", "event": "direct_debit", "dd_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W8. E-Wallet Webhook
# URL: /api/v1/payments/webhook/ewallet
# Dashboard: E-WALLETS > eWallet Payment Status, eWallet Reconciliation
# ---------------------------------------------------------------------------
@router.post("/webhook/ewallet", summary="[Webhook] E-Wallet")
async def webhook_ewallet(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    reference_id = body.get("data", {}).get("reference_id") or body.get("reference_id")
    # TODO: update order status for e-wallet payments
    # event: ewallet.payment.succeeded, ewallet.payment.failed
    return {"status": "ok", "event": "ewallet", "ewallet_event": event, "reference_id": reference_id}


# ---------------------------------------------------------------------------
# W9. QR Code Webhook
# URL: /api/v1/payments/webhook/qr
# Dashboard: QR CODES > QR code paid & refunded, QR Reconciliation
# ---------------------------------------------------------------------------
@router.post("/webhook/qr", summary="[Webhook] QR Code / QRIS")
async def webhook_qr(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", body.get("status", "UNKNOWN"))
    external_id = body.get("external_id")
    amount = body.get("amount")
    # TODO: update order status for QR/QRIS payment
    return {"status": "ok", "event": "qr", "qr_event": event, "external_id": external_id, "amount": amount}


# ---------------------------------------------------------------------------
# W10. PayLater Webhook
# URL: /api/v1/payments/webhook/paylater
# Dashboard: PAYLATER > Paylater Payment Status
# ---------------------------------------------------------------------------
@router.post("/webhook/paylater", summary="[Webhook] PayLater")
async def webhook_paylater(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: update order status for paylater payments
    return {"status": "ok", "event": "paylater", "paylater_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W11. Payment Requests V2 Webhook
# URL: /api/v1/payments/webhook/payment-requests-v2
# Dashboard: PAYMENT REQUESTS V2 (/v2/payment_requests)
#            Payment Succeeded, Awaiting Capture, Pending, Failed,
#            Captured Succeeded, Captured Failed
# ---------------------------------------------------------------------------
@router.post("/webhook/payment-requests-v2", summary="[Webhook] Payment Requests V2")
async def webhook_payment_requests_v2(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    payment_request_id = body.get("data", {}).get("id") or body.get("id")
    # TODO: update payment/order status
    return {"status": "ok", "event": "payment_request_v2", "pr_event": event, "payment_request_id": payment_request_id}


# ---------------------------------------------------------------------------
# W12. Payment Requests V3 Webhook
# URL: /api/v1/payments/webhook/payment-requests-v3
# Dashboard: PAYMENT REQUESTS V3 (/v3/payment_requests)
#            Payment Status, Payment Request Status
# ---------------------------------------------------------------------------
@router.post("/webhook/payment-requests-v3", summary="[Webhook] Payment Requests V3")
async def webhook_payment_requests_v3(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    payment_request_id = body.get("data", {}).get("id") or body.get("id")
    # TODO: update payment/order status for v3
    return {"status": "ok", "event": "payment_request_v3", "pr_event": event, "payment_request_id": payment_request_id}


# ---------------------------------------------------------------------------
# W13. Payment Tokens V3 Webhook
# URL: /api/v1/payments/webhook/payment-tokens-v3
# Dashboard: PAYMENT TOKENS V3 (/v3/payment_tokens) > Payment Token Status
# ---------------------------------------------------------------------------
@router.post("/webhook/payment-tokens-v3", summary="[Webhook] Payment Tokens V3")
async def webhook_payment_tokens_v3(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: update saved payment method / token status
    return {"status": "ok", "event": "payment_token_v3", "token_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W14. Unified Refunds Webhook (BETA)
# URL: /api/v1/payments/webhook/refunds
# Dashboard: Unified Refunds (BETA) > Refund request succeeded/failed
# ---------------------------------------------------------------------------
@router.post("/webhook/refunds", summary="[Webhook] Unified Refunds")
async def webhook_refunds(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    refund_id = body.get("data", {}).get("id") or body.get("id")
    # TODO: update refund status in DB
    return {"status": "ok", "event": "refund", "refund_event": event, "refund_id": refund_id}


# ---------------------------------------------------------------------------
# W15. Recurring Webhook
# URL: /api/v1/payments/webhook/recurring
# Dashboard: RECURRING > Recurring
# ---------------------------------------------------------------------------
@router.post("/webhook/recurring", summary="[Webhook] Recurring Payment")
async def webhook_recurring(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle recurring payment cycle events
    return {"status": "ok", "event": "recurring", "recurring_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W16. Payment Session Webhook
# URL: /api/v1/payments/webhook/payment-session
# Dashboard: PAYMENT SESSION > Payment Session Completed, Expired
# ---------------------------------------------------------------------------
@router.post("/webhook/payment-session", summary="[Webhook] Payment Session")
async def webhook_payment_session(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    session_id = body.get("data", {}).get("id") or body.get("id")
    # TODO: handle session completed/expired
    return {"status": "ok", "event": "payment_session", "session_event": event, "session_id": session_id}


# ---------------------------------------------------------------------------
# W17. XenPlatform Webhook
# URL: /api/v1/payments/webhook/xenplatform
# Dashboard: XenPlatform > Account Created/Updated/Suspension/Verification/Split
# ---------------------------------------------------------------------------
@router.post("/webhook/xenplatform", summary="[Webhook] XenPlatform")
async def webhook_xenplatform(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle platform sub-account events
    return {"status": "ok", "event": "xenplatform", "platform_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W18. Payment Method V2 Webhook
# URL: /api/v1/payments/webhook/payment-method-v2
# Dashboard: PAYMENT METHOD V2 (/v2/payment_methods) > Payment method
# ---------------------------------------------------------------------------
@router.post("/webhook/payment-method-v2", summary="[Webhook] Payment Method V2")
async def webhook_payment_method_v2(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle payment method linked/expired/updated
    return {"status": "ok", "event": "payment_method_v2", "pm_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W19. Bill Payments Webhook
# URL: /api/v1/payments/webhook/bill-payments
# Dashboard: BILL PAYMENTS > Bill Payments
# ---------------------------------------------------------------------------
@router.post("/webhook/bill-payments", summary="[Webhook] Bill Payments")
async def webhook_bill_payments(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle bill payment events
    return {"status": "ok", "event": "bill_payments", "bill_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W20. Payouts V2 & V3 Webhook
# URL: /api/v1/payments/webhook/payouts
# Dashboard: Payouts v2 & Payouts v3
# ---------------------------------------------------------------------------
@router.post("/webhook/payouts", summary="[Webhook] Payouts V2 & V3")
async def webhook_payouts(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    payout_id = body.get("data", {}).get("id") or body.get("id")
    # TODO: handle payout success/failed
    return {"status": "ok", "event": "payouts", "payout_event": event, "payout_id": payout_id}


# ---------------------------------------------------------------------------
# W21. Recipient Verification Webhook
# URL: /api/v1/payments/webhook/recipient-verification
# Dashboard: Recipient Verification > Recipient Verification
# ---------------------------------------------------------------------------
@router.post("/webhook/recipient-verification", summary="[Webhook] Recipient Verification")
async def webhook_recipient_verification(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle recipient verification result
    return {"status": "ok", "event": "recipient_verification", "rv_event": event, "raw": body}


# ---------------------------------------------------------------------------
# W22. Report Webhook (Balance & Transactions)
# URL: /api/v1/payments/webhook/report
# Dashboard: REPORT > Balance and Transactions report
# ---------------------------------------------------------------------------
@router.post("/webhook/report", summary="[Webhook] Balance & Transactions Report")
async def webhook_report(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    report_type = body.get("report_type", "UNKNOWN")
    download_url = body.get("download_url")
    # TODO: notify admin / trigger report download
    return {"status": "ok", "event": "report", "report_type": report_type, "download_url": download_url}


# ---------------------------------------------------------------------------
# W23. Conversions Webhook
# URL: /api/v1/payments/webhook/conversions
# Dashboard: Conversions > Conversion
# ---------------------------------------------------------------------------
@router.post("/webhook/conversions", summary="[Webhook] Conversions")
async def webhook_conversions(
    request: Request,
    x_callback_token: Optional[str] = Header(None)
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    event = body.get("event", "UNKNOWN")
    # TODO: handle currency conversion events
    return {"status": "ok", "event": "conversions", "conversion_event": event, "raw": body}
