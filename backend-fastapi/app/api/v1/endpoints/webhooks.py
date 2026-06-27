import hmac
import hashlib
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.transaction import Transaction
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def _verify_xendit_token(x_callback_token: str):
    """Verifikasi Xendit callback token."""
    if not settings.XENDIT_WEBHOOK_TOKEN:
        logger.warning("XENDIT_WEBHOOK_TOKEN belum diset, skip verifikasi")
        return
    if x_callback_token != settings.XENDIT_WEBHOOK_TOKEN:
        raise HTTPException(status_code=401, detail="Xendit callback token tidak valid")


@router.post(
    "/xendit/invoice-paid",
    summary="[Webhook] Xendit — Invoice Paid Callback",
    description="""
Endpoint ini dipanggil otomatis oleh Xendit setelah vendor menyelesaikan pembayaran invoice.

**Cara setup di Xendit Dashboard:**
1. Login ke [dashboard.xendit.co](https://dashboard.xendit.co)
2. Settings → Webhooks
3. Tambahkan URL: `https://api.custherds.ourtestcloud.my.id/api/v1/webhooks/xendit/invoice-paid`
4. Pilih event: **Invoice Paid**
5. Copy Webhook Token → isi ke `.env` sebagai `XENDIT_WEBHOOK_TOKEN`
    """,
    tags=["Webhooks"],
)
async def xendit_invoice_paid(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    _verify_xendit_token(x_callback_token)

    body = await request.json()
    logger.info(f"Xendit webhook received: {body.get('id')} status={body.get('status')}")

    if body.get("status") != "PAID":
        return {"message": "Status bukan PAID, diabaikan"}

    external_id: str = body.get("external_id", "")
    xendit_invoice_id: str = body.get("id", "")

    if not external_id.startswith("CUSTHERDS-TX-"):
        logger.warning(f"external_id tidak dikenali: {external_id}")
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        logger.error(f"Transaction tidak ditemukan untuk code: {tx_code}")
        raise HTTPException(404, "Transaction tidak ditemukan")

    if tx.status == "settled":
        return {"message": "Transaksi sudah settled sebelumnya, skip"}

    if tx.status != "payment_pending":
        logger.warning(f"Status tidak expected: {tx.status}")
        return {"message": f"Status tidak bisa diproses: {tx.status}"}

    now = datetime.now(timezone.utc)

    # ── Update transaction → settled ──────────────────────────────────────
    tx.status = "settled"
    tx.paid_at = now
    tx.settled_at = now
    tx.xendit_invoice_id = xendit_invoice_id

    # ── Kreditkan komisi ke wallet guide ─────────────────────────────────
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        guide.wallet_balance += tx.guide_commission
        guide.total_earnings += tx.guide_commission
        logger.info(f"Guide {guide.id} wallet +{tx.guide_commission}")

    # ── Update booking → completed ────────────────────────────────────────
    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status = "completed"
        booking.completed_at = now
        logger.info(f"Booking {booking.booking_code} → completed (via PAYG webhook)")
    else:
        logger.warning(f"Booking tidak ditemukan untuk tx {tx.transaction_code}")

    db.commit()
    logger.info(f"Transaction {tx.transaction_code} settled via Xendit pay-as-you-go")

    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "settled"}


@router.post(
    "/xendit/invoice-expired",
    summary="[Webhook] Xendit — Invoice Expired Callback",
    tags=["Webhooks"],
)
async def xendit_invoice_expired(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    """Jika invoice expired (tidak dibayar dalam batas waktu), kembalikan status ke pending_vendor_approval."""
    _verify_xendit_token(x_callback_token)

    body = await request.json()
    if body.get("status") != "EXPIRED":
        return {"message": "Bukan EXPIRED, diabaikan"}

    external_id: str = body.get("external_id", "")
    if not external_id.startswith("CUSTHERDS-TX-"):
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx or tx.status != "payment_pending":
        return {"message": "Tidak perlu diproses"}

    # Reset ke pending supaya vendor bisa pilih ulang metode pembayaran
    tx.status = "pending_vendor_approval"
    tx.payment_method = None
    tx.xendit_invoice_id = None
    tx.xendit_invoice_url = None
    tx.vendor_reviewed_at = None
    db.commit()
    logger.info(f"Transaction {tx.transaction_code} direset ke pending_vendor_approval (invoice expired)")

    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "reset_to_pending"}
