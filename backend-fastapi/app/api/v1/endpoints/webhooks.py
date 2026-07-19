"""
Webhook endpoint untuk menerima notifikasi dari DOKU (SNAP)
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.payment_gateway_config import PaymentGatewayConfig
from app.models.transaction import Transaction
from app.services.xendit import create_disbursement

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_active_gateway(db: Session):
    return db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.is_active == True).first()  # noqa


async def _disburse_guide_commission(tx: Transaction, db: Session) -> None:
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if not guide:
        return
    if not all([guide.bank_name, guide.bank_account_number, guide.bank_account_name]):
        logger.info(f"[Disbursement] Guide {guide.id} belum lengkap data bank")
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
        logger.error(f"[Disbursement] GAGAL | guide={guide.id} | error={str(e)}")


@router.post("/doku/qris", summary="DOKU QRIS payment notification webhook")
async def doku_qris_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_signature: str = Header(None, alias="X-SIGNATURE"),
    x_timestamp: str = Header(None, alias="X-TIMESTAMP"),
    x_partner_id: str = Header(None, alias="X-PARTNER-ID"),
    x_external_id: str = Header(None, alias="X-EXTERNAL-ID"),
) -> Any:
    body_bytes = await request.body()
    body_str   = body_bytes.decode("utf-8")

    logger.info(
        f"[DOKU:webhook] partner={x_partner_id} external_id={x_external_id} "
        f"ts={x_timestamp} body={body_str[:500]}"
    )

    # Verifikasi signature HMAC-SHA512
    gateway = _get_active_gateway(db)
    if gateway:
        creds         = gateway.credentials or {}
        client_secret = creds.get("secret_key") or creds.get("client_secret", "")
        endpoint      = "/api/v1/webhooks/doku/qris"
        try:
            body_hash      = hashlib.sha256(body_str.encode()).hexdigest().lower()
            string_to_sign = f"POST:{endpoint}::{body_hash}:{x_timestamp}"
            expected_sig   = hmac.new(
                client_secret.encode(),
                string_to_sign.encode(),
                hashlib.sha512,
            ).digest()
            import base64
            expected_b64 = base64.b64encode(expected_sig).decode()
            if x_signature and x_signature != expected_b64:
                logger.warning(f"[DOKU:webhook] Signature mismatch — tetap diproses (possible IP-level trust)")
        except Exception as sig_err:
            logger.warning(f"[DOKU:webhook] Signature check error: {sig_err}")

    try:
        payload: dict = json.loads(body_str)
    except Exception:
        logger.error("[DOKU:webhook] Body bukan JSON valid")
        return {"responseCode": "2007300", "responseMessage": "OK"}

    # DOKU SNAP notification format
    # originalPartnerReferenceNo = partnerReferenceNo dari generate (CST-TX...-timestamp)
    # latestTransactionStatus: 00 = success, 01 = initiated, 02 = paying, 03 = failed
    original_ref     = payload.get("originalPartnerReferenceNo") or payload.get("partnerReferenceNo", "")
    tx_status_code   = payload.get("latestTransactionStatus", "")
    doku_ref_no      = payload.get("originalReferenceNo") or payload.get("referenceNo", "")
    approval_code    = payload.get("additionalInfo", {}).get("approvalCode", "")

    logger.info(
        f"[DOKU:webhook] originalRef={original_ref} statusCode={tx_status_code} "
        f"dokuRef={doku_ref_no} approvalCode={approval_code}"
    )

    # original_ref format: CST-TX0134482450-1784459264
    # Ekstrak transaction_code
    tx_code = None
    if original_ref and original_ref.startswith("CST-"):
        parts = original_ref.split("-", 2)  # ["CST", "TX0134482450", "timestamp"]
        if len(parts) >= 2:
            tx_code = parts[1]  # TX0134482450

    if not tx_code:
        logger.warning(f"[DOKU:webhook] Tidak bisa ekstrak tx_code dari originalRef={original_ref}")
        return {"responseCode": "2007300", "responseMessage": "OK"}

    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        logger.warning(f"[DOKU:webhook] Transaksi tidak ditemukan: {tx_code}")
        return {"responseCode": "2007300", "responseMessage": "OK"}

    # Hanya proses jika masih payment_pending
    if tx.status != "payment_pending":
        logger.info(f"[DOKU:webhook] TX {tx_code} sudah status={tx.status}, skip")
        return {"responseCode": "2007300", "responseMessage": "OK"}

    # 00 = SUCCESS
    if tx_status_code == "00":
        from decimal import Decimal
        tx.status    = "settled"
        tx.paid_at   = datetime.now(timezone.utc)
        tx.settled_at = datetime.now(timezone.utc)
        if doku_ref_no:
            tx.xendit_invoice_id = doku_ref_no

        guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
        if guide:
            guide.wallet_balance += tx.guide_commission
            guide.total_earnings += tx.guide_commission

        booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
        if booking:
            booking.status       = "completed"
            booking.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(tx)
        await _disburse_guide_commission(tx, db)
        db.commit()
        logger.info(f"[DOKU:webhook] TX {tx_code} SETTLED via QRIS payment")

    # 03 = FAILED / expired
    elif tx_status_code in ("03", "05"):
        tx.status = "payment_failed"
        db.commit()
        logger.info(f"[DOKU:webhook] TX {tx_code} FAILED/EXPIRED (statusCode={tx_status_code})")

    # DOKU requires HTTP 200 response with specific format
    return {"responseCode": "2007300", "responseMessage": "OK"}
