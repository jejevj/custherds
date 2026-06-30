import hashlib
import hmac as _hmac
import logging
from typing import Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.transaction import Transaction
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.services.xendit import create_disbursement

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────────────────────────

def _verify_xendit_token(x_callback_token: str):
    if not settings.XENDIT_WEBHOOK_TOKEN:
        logger.warning("XENDIT_WEBHOOK_TOKEN belum diset, skip verifikasi")
        return
    if x_callback_token != settings.XENDIT_WEBHOOK_TOKEN:
        raise HTTPException(status_code=401, detail="Xendit callback token tidak valid")


async def _disburse_guide_commission(tx: Transaction, db: Session) -> None:
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if not guide:
        return
    if not all([guide.bank_name, guide.bank_account_number, guide.bank_account_name]):
        logger.info(f"[Disbursement] Guide {guide.id} belum lengkap data bank — komisi tetap di wallet_balance")
        return
    external_id = f"CUSTHERDS-COMM-{tx.transaction_code}"
    description = f"Komisi Guide | Booking {tx.booking_id} | Transaksi {tx.transaction_code}"
    try:
        result = await create_disbursement(
            external_id=external_id,
            bank_code=guide.bank_name,
            account_number=guide.bank_account_number,
            account_holder_name=guide.bank_account_name,
            amount=float(tx.guide_commission),
            description=description,
        )
        tx.xendit_disbursement_id = result.get("id", "")
        logger.info(f"[Disbursement] Berhasil | guide={guide.id} | amount={tx.guide_commission}")
    except Exception as e:
        logger.error(f"[Disbursement] GAGAL | guide={guide.id} | tx={tx.transaction_code} | error={str(e)}")


def _settle_transaction(tx: Transaction, booking: Optional[Booking], guide: Optional[Guide], db: Session, now: datetime) -> None:
    """Shared logic: settle TX, kredit wallet guide, selesaikan booking."""
    tx.status     = "settled"
    tx.paid_at    = now
    tx.settled_at = now

    if guide:
        guide.wallet_balance += tx.guide_commission
        guide.total_earnings += tx.guide_commission
        logger.info(f"[Webhook] Guide {guide.id} wallet +{tx.guide_commission}")

    if booking:
        booking.status       = "completed"
        booking.completed_at = now
        logger.info(f"[Webhook] Booking {booking.booking_code} → completed")


# ── Xendit Webhooks ───────────────────────────────────────────────────────────

@router.post(
    "/xendit/invoice-paid",
    summary="[Webhook] Xendit — Invoice Paid Callback",
    tags=["Webhooks"],
)
async def xendit_invoice_paid(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    _verify_xendit_token(x_callback_token)
    body = await request.json()
    logger.info(f"[Webhook] Xendit Invoice Paid: {body.get('id')} status={body.get('status')}")

    if body.get("status") != "PAID":
        return {"message": "Status bukan PAID, diabaikan"}

    external_id: str = body.get("external_id", "")
    if not external_id.startswith("CUSTHERDS-TX-"):
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        raise HTTPException(404, "Transaction tidak ditemukan")
    if tx.status == "settled":
        return {"message": "Sudah settled"}
    if tx.status != "payment_pending":
        return {"message": f"Status tidak bisa diproses: {tx.status}"}

    now     = datetime.now(timezone.utc)
    guide   = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    tx.xendit_invoice_id = body.get("id", "")
    _settle_transaction(tx, booking, guide, db, now)
    db.commit()
    db.refresh(tx)

    await _disburse_guide_commission(tx, db)
    db.commit()

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

    tx.status             = "pending_vendor_approval"
    tx.payment_method     = None
    tx.xendit_invoice_id  = None
    tx.xendit_invoice_url = None
    tx.vendor_reviewed_at = None
    db.commit()
    logger.info(f"[Webhook] TX {tx.transaction_code} reset ke pending_vendor_approval (Xendit expired)")
    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "reset_to_pending"}


@router.post(
    "/xendit/disbursement-completed",
    summary="[Webhook] Xendit — Disbursement Completed/Failed Callback",
    tags=["Webhooks"],
)
async def xendit_disbursement_callback(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    _verify_xendit_token(x_callback_token)
    body        = await request.json()
    status      = body.get("status", "")
    external_id = body.get("external_id", "")
    failure_code = body.get("failure_code", "")
    logger.info(f"[Disbursement CB] external_id={external_id} status={status}")

    if not external_id.startswith("CUSTHERDS-COMM-"):
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-COMM-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        return {"message": "Transaction tidak ditemukan"}

    if status == "COMPLETED":
        logger.info(f"[Disbursement CB] Komisi guide TX {tx_code} berhasil dikirim")
    elif status == "FAILED":
        logger.error(f"[Disbursement CB] GAGAL kirim komisi TX {tx_code} | failure_code={failure_code}")

    return {"message": "OK", "status": status}


# ── DOKU SNAP Webhook ───────────────────────────────────────────────────────────

@router.post(
    "/doku/qris-notify",
    summary="[Webhook] DOKU SNAP — QRIS Payment Notification",
    description="""
Endpoint ini dipanggil otomatis oleh DOKU setelah pembayaran QRIS selesai.

**Setup di DOKU Dashboard (Sandbox / Production):**
1. Login → Settings → Configuration → Notification URL
2. Isi URL: `https://api-custherds.ourtestcloud.my.id/api/v1/webhooks/doku/qris-notify`
3. Pilih event: **Payment Notification**

**Verifikasi:** DOKU mengirim header `X-Signature` (HMAC-SHA512) dan `Request-Id`.
Sistem memverifikasi signature menggunakan `client_secret` dari gateway aktif.
    """,
    tags=["Webhooks"],
)
async def doku_qris_notify(
    request: Request,
    db: Session = Depends(get_db),
) -> Any:
    from app.models.payment_gateway_config import PaymentGatewayConfig
    import json, base64

    raw_body = await request.body()
    body: dict = {}
    try:
        body = json.loads(raw_body)
    except Exception:
        raise HTTPException(400, "Body tidak valid JSON")

    logger.info(f"[DOKU Webhook] QRIS notify received: {body}")

    # ── Verifikasi Signature ──────────────────────────────────────────────────
    gateway = db.query(PaymentGatewayConfig).filter(
        PaymentGatewayConfig.provider == "doku",
        PaymentGatewayConfig.is_active == True,  # noqa
    ).first()

    if gateway:
        creds         = gateway.credentials or {}
        client_secret = creds.get("client_secret", "")
        if client_secret:
            try:
                notify_url   = "/api/v1/webhooks/doku/qris-notify"
                request_id   = request.headers.get("Request-Id", "")
                timestamp    = request.headers.get("Request-Timestamp", "")
                x_signature  = request.headers.get("X-Signature", "")
                body_hash    = hashlib.sha256(raw_body).hexdigest().lower()
                str_to_sign  = f"{notify_url}:{request_id}:{timestamp}:{body_hash}"
                expected_sig = base64.b64encode(
                    _hmac.new(client_secret.encode(), str_to_sign.encode(), hashlib.sha512).digest()
                ).decode()
                if x_signature and x_signature != expected_sig:
                    logger.warning(f"[DOKU Webhook] Signature mismatch — req={x_signature[:20]}... exp={expected_sig[:20]}...")
                    raise HTTPException(401, "DOKU signature tidak valid")
            except HTTPException:
                raise
            except Exception as e:
                logger.warning(f"[DOKU Webhook] Signature verification error: {e} — dilanjutkan tanpa verifikasi")

    # ── Identifikasi transaksi ────────────────────────────────────────────────
    partner_ref = (
        body.get("originalPartnerReferenceNo")
        or body.get("partnerReferenceNo")
        or body.get("order", {}).get("invoice_number", "")
    )
    tx_status_code = (
        body.get("latestTransactionStatus")
        or body.get("transactionStatus")
        or body.get("resultInfo", {}).get("resultStatus", "")
    )
    doku_reference = body.get("originalReferenceNo") or body.get("referenceNo", "")

    logger.info(f"[DOKU Webhook] partnerRef={partner_ref} status={tx_status_code} dokuRef={doku_reference}")

    if not partner_ref:
        logger.warning("[DOKU Webhook] partnerReferenceNo tidak ditemukan di body")
        return {"message": "partnerReferenceNo tidak ditemukan, diabaikan"}

    if tx_status_code not in ("00", "SUCCESS", "success"):
        logger.info(f"[DOKU Webhook] Status {tx_status_code} bukan sukses, diabaikan")
        return {"message": f"Status {tx_status_code} bukan sukses, diabaikan"}

    # ── Cari transaksi ─────────────────────────────────────────────────────
    tx_code = str(partner_ref).replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        logger.error(f"[DOKU Webhook] Transaction {tx_code} tidak ditemukan")
        raise HTTPException(404, "Transaction tidak ditemukan")

    if tx.status == "settled":
        return {"message": "Sudah settled sebelumnya, skip"}
    if tx.status != "payment_pending":
        return {"message": f"Status tidak bisa diproses: {tx.status}"}

    # ── Settle ────────────────────────────────────────────────────────────────
    now     = datetime.now(timezone.utc)
    guide   = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()

    if doku_reference:
        tx.xendit_invoice_id = doku_reference

    _settle_transaction(tx, booking, guide, db, now)
    db.commit()
    db.refresh(tx)

    await _disburse_guide_commission(tx, db)
    db.commit()

    logger.info(f"[DOKU Webhook] TX {tx.transaction_code} settled via QRIS")
    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "settled"}
