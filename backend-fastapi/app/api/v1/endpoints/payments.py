from fastapi import APIRouter, HTTPException, Request, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal
import xendit
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.guide_withdrawal import GuideWithdrawal
from app.models.guide import Guide
from app.models.transaction import Transaction
from app.models.booking import Booking
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _init_xendit():
    xendit.api_key = settings.XENDIT_SECRET_KEY


def _verify_webhook(token: Optional[str]):
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
    bank_code: str
    name: str
    expected_amount: Optional[float] = None
    is_closed: Optional[bool] = False
    expiration_date: Optional[str] = None


class CreateQRPayload(BaseModel):
    external_id: Optional[str] = None
    type: Optional[str] = "DYNAMIC"
    callback_url: Optional[str] = None
    amount: Optional[float] = None


# ---------------------------------------------------------------------------
# 1. Create Invoice
# ---------------------------------------------------------------------------

@router.post("/invoice", summary="Create a Xendit Invoice")
async def create_invoice(payload: CreateInvoicePayload):
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
            "expiry_date": str(invoice.expiry_date) if hasattr(invoice, "expiry_date") else None,
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
            "paid_at": str(invoice.paid_at) if hasattr(invoice, "paid_at") and invoice.paid_at else None,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 3. Expire Invoice
# ---------------------------------------------------------------------------

@router.post("/invoice/{invoice_id}/expire", summary="Expire an Invoice")
async def expire_invoice(invoice_id: str):
    _init_xendit()
    try:
        result = xendit.Invoice.expire(invoice_id=invoice_id)
        return {"status": "ok", "invoice_id": result.id, "new_status": result.status}
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 4. Create Virtual Account
# ---------------------------------------------------------------------------

@router.post("/virtual-account", summary="Create a Virtual Account")
async def create_virtual_account(payload: CreateVAPayload):
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
            "expected_amount": getattr(va, "expected_amount", None),
            "expiration_date": str(va.expiration_date) if hasattr(va, "expiration_date") and va.expiration_date else None,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 5. Get Virtual Account
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
            "status": getattr(va, "status", None),
            "name": va.name,
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# 6. Create QR Code
# ---------------------------------------------------------------------------

@router.post("/qr-code", summary="Create a QRIS / QR Code")
async def create_qr_code(payload: CreateQRPayload):
    _init_xendit()
    external_id = payload.external_id or f"qr-{uuid.uuid4().hex[:12]}"
    try:
        kwargs = dict(external_id=external_id, type=payload.type.upper())
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
            "amount": getattr(qr, "amount", None),
        }
    except xendit.XenditError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===========================================================================
# WEBHOOK ROUTES
# ===========================================================================

@router.post("/webhook/invoice", summary="[Webhook] Xendit Invoice Paid — settle TX & booking")
async def webhook_invoice(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: Optional[str] = Header(None),
):
    """
    Dipanggil Xendit saat invoice PAID.
    Settle transaksi, kredit wallet guide, dan set booking → completed.
    """
    _verify_webhook(x_callback_token)
    body = await request.json()
    logger.info(f"[Webhook/invoice] received: id={body.get('id')} status={body.get('status')} external_id={body.get('external_id')}")

    status = body.get("status", "")
    external_id: str = body.get("external_id", "")
    xendit_invoice_id: str = body.get("id", "")

    if status != "PAID":
        return {"status": "ok", "message": f"Status {status} diabaikan"}

    if not external_id.startswith("CUSTHERDS-TX-"):
        logger.warning(f"[Webhook/invoice] external_id tidak dikenali: {external_id}")
        return {"status": "ok", "message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        logger.error(f"[Webhook/invoice] Transaction tidak ditemukan: {tx_code}")
        return {"status": "ok", "message": "Transaction tidak ditemukan"}

    if tx.status == "settled":
        return {"status": "ok", "message": "Sudah settled sebelumnya, skip"}

    if tx.status != "payment_pending":
        logger.warning(f"[Webhook/invoice] Status tidak expected: {tx.status}")
        return {"status": "ok", "message": f"Status {tx.status} tidak bisa diproses"}

    now = datetime.now(timezone.utc)

    # 1. Settle transaksi
    tx.status            = "settled"
    tx.paid_at           = now
    tx.settled_at        = now
    tx.xendit_invoice_id = xendit_invoice_id

    # 2. Kredit wallet guide — pakai Decimal agar tipe konsisten dengan kolom NUMERIC
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        commission = Decimal(str(tx.guide_commission))
        guide.wallet_balance = (guide.wallet_balance or Decimal(0)) + commission
        guide.total_earnings = (guide.total_earnings or Decimal(0)) + commission
        logger.info(f"[Webhook/invoice] Guide {guide.id} wallet +{commission}")

    # 3. Booking → completed
    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status       = "completed"
        booking.completed_at = now
        logger.info(f"[Webhook/invoice] Booking {booking.booking_code} → completed")

    db.commit()
    db.refresh(tx)

    logger.info(f"[Webhook/invoice] TX {tx.transaction_code} settled via PAYG")
    return {"status": "ok", "transaction_code": tx.transaction_code, "new_status": "settled"}


@router.post("/webhook/fva", summary="[Webhook] Fixed Virtual Account")
async def webhook_fva(
    request: Request,
    x_callback_token: Optional[str] = Header(None),
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "fva", "fva_event": body.get("event", body.get("status", "UNKNOWN")), "external_id": body.get("external_id")}


@router.post("/webhook/disbursement", summary="[Webhook] Disbursement — Auto update withdrawal guide")
async def webhook_disbursement(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: Optional[str] = Header(None),
):
    _verify_webhook(x_callback_token)
    body = await request.json()
    logger.info(f"Xendit disbursement webhook: {body}")

    xendit_status: str = body.get("status", "").upper()
    xendit_disbursement_id: str = body.get("id", "")
    external_id: str = body.get("external_id", "")

    if not external_id.startswith("CUSTHERDS-WD-"):
        logger.warning(f"external_id tidak dikenali: {external_id}")
        return {"status": "ok", "message": "external_id tidak dikenali, diabaikan"}

    withdrawal_id_str = external_id.replace("CUSTHERDS-WD-", "")
    try:
        withdrawal_id = uuid.UUID(withdrawal_id_str)
    except ValueError:
        logger.error(f"UUID tidak valid: {withdrawal_id_str}")
        return {"status": "ok", "message": "UUID tidak valid"}

    withdrawal = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id).first()
    if not withdrawal:
        logger.error(f"Withdrawal tidak ditemukan: {withdrawal_id}")
        return {"status": "ok", "message": "Withdrawal tidak ditemukan"}

    if not withdrawal.xendit_disbursement_id:
        withdrawal.xendit_disbursement_id = xendit_disbursement_id

    if xendit_status == "COMPLETED":
        if withdrawal.status in ("pending", "processing"):
            withdrawal.status = "completed"
            withdrawal.processed_at = datetime.now(timezone.utc)
            db.commit()
            logger.info(f"Withdrawal {withdrawal.id} COMPLETED via Xendit")
        return {"status": "ok", "message": "Withdrawal completed", "withdrawal_id": str(withdrawal.id)}

    elif xendit_status == "FAILED":
        if withdrawal.status in ("pending", "processing"):
            withdrawal.status = "failed"
            withdrawal.processed_at = datetime.now(timezone.utc)
            withdrawal.notes = (withdrawal.notes or "") + f" | Xendit FAILED: {body.get('failure_code', 'unknown')}"
            guide = db.query(Guide).filter(Guide.id == withdrawal.guide_id).first()
            if guide:
                guide.wallet_balance += withdrawal.amount
                logger.info(f"Guide {guide.id} wallet refunded +{withdrawal.amount} karena disbursement FAILED")
            db.commit()
            logger.info(f"Withdrawal {withdrawal.id} FAILED, saldo dikembalikan")
        return {"status": "ok", "message": "Withdrawal failed, saldo dikembalikan", "withdrawal_id": str(withdrawal.id)}

    else:
        logger.info(f"Disbursement status {xendit_status} diabaikan")
        return {"status": "ok", "message": f"Status {xendit_status} diabaikan"}


@router.post("/webhook/payout", summary="[Webhook] Payout Link")
async def webhook_payout(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payout", "payout_status": body.get("status", "UNKNOWN"), "raw": body}


@router.post("/webhook/retail", summary="[Webhook] Retail Outlets (OTC)")
async def webhook_retail(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "retail_otc", "external_id": body.get("external_id"), "amount": body.get("amount")}


@router.post("/webhook/cards", summary="[Webhook] Cards Auth & Tokenization")
async def webhook_cards(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "cards", "card_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/direct-debit", summary="[Webhook] Direct Debit")
async def webhook_direct_debit(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "direct_debit", "dd_event": body.get("event", body.get("type", "UNKNOWN")), "raw": body}


@router.post("/webhook/ewallet", summary="[Webhook] E-Wallet")
async def webhook_ewallet(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "ewallet", "ewallet_event": body.get("event", "UNKNOWN"), "reference_id": body.get("data", {}).get("reference_id")}


@router.post("/webhook/qr", summary="[Webhook] QR Code / QRIS")
async def webhook_qr(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "qr", "qr_event": body.get("event", body.get("status", "UNKNOWN")), "external_id": body.get("external_id"), "amount": body.get("amount")}


@router.post("/webhook/paylater", summary="[Webhook] PayLater")
async def webhook_paylater(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "paylater", "paylater_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/payment-requests-v2", summary="[Webhook] Payment Requests V2")
async def webhook_payment_requests_v2(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payment_request_v2", "pr_event": body.get("event", "UNKNOWN"), "payment_request_id": body.get("data", {}).get("id")}


@router.post("/webhook/payment-requests-v3", summary="[Webhook] Payment Requests V3")
async def webhook_payment_requests_v3(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payment_request_v3", "pr_event": body.get("event", "UNKNOWN"), "payment_request_id": body.get("data", {}).get("id")}


@router.post("/webhook/payment-tokens-v3", summary="[Webhook] Payment Tokens V3")
async def webhook_payment_tokens_v3(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payment_token_v3", "token_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/refunds", summary="[Webhook] Unified Refunds")
async def webhook_refunds(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "refund", "refund_event": body.get("event", "UNKNOWN"), "refund_id": body.get("data", {}).get("id")}


@router.post("/webhook/recurring", summary="[Webhook] Recurring Payment")
async def webhook_recurring(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "recurring", "recurring_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/payment-session", summary="[Webhook] Payment Session")
async def webhook_payment_session(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payment_session", "session_event": body.get("event", "UNKNOWN"), "session_id": body.get("data", {}).get("id")}


@router.post("/webhook/xenplatform", summary="[Webhook] XenPlatform")
async def webhook_xenplatform(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "xenplatform", "platform_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/payment-method-v2", summary="[Webhook] Payment Method V2")
async def webhook_payment_method_v2(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payment_method_v2", "pm_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/bill-payments", summary="[Webhook] Bill Payments")
async def webhook_bill_payments(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "bill_payments", "bill_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/payouts", summary="[Webhook] Payouts V2 & V3")
async def webhook_payouts(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "payouts", "payout_event": body.get("event", "UNKNOWN"), "payout_id": body.get("data", {}).get("id")}


@router.post("/webhook/recipient-verification", summary="[Webhook] Recipient Verification")
async def webhook_recipient_verification(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "recipient_verification", "rv_event": body.get("event", "UNKNOWN"), "raw": body}


@router.post("/webhook/report", summary="[Webhook] Balance & Transactions Report")
async def webhook_report(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "report", "report_type": body.get("report_type", "UNKNOWN"), "download_url": body.get("download_url")}


@router.post("/webhook/conversions", summary="[Webhook] Conversions")
async def webhook_conversions(request: Request, x_callback_token: Optional[str] = Header(None)):
    _verify_webhook(x_callback_token)
    body = await request.json()
    return {"status": "ok", "event": "conversions", "conversion_event": body.get("event", "UNKNOWN"), "raw": body}
