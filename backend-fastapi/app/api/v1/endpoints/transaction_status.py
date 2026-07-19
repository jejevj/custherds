"""
Polling endpoint: GET /api/v1/transactions/{tx_id}/payment-status

Field mapping TX model:
  xendit_invoice_id  = referenceNo DOKU (dari response generate);
                       jika DOKU tidak kembalikan referenceNo, fallback ke partnerReferenceNo
                       (format CST-TX...-timestamp)
  xendit_invoice_url = qris_string (konten QRIS untuk render QR code)

Query DOKU:
  originalReferenceNo        = xendit_invoice_id  (referenceNo DOKU)
  originalPartnerReferenceNo = xendit_invoice_id  (sama, karena mungkin DOKU echo partnerRef)
"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.payment_gateway_config import PaymentGatewayConfig
from app.models.transaction import Transaction
from app.models.user import User
from app.models.vendor import Vendor
from app.services.doku import get_token_b2b, _symmetric_signature, _now_wib

router = APIRouter()
logger = logging.getLogger(__name__)

DOKU_SANDBOX      = "https://api-sandbox.doku.com"
DOKU_PROD         = "https://api.doku.com"
QRIS_QUERY_PATH   = "/snap-adapter/b2b/v1.0/qr/qr-mpm-query"
QRIS_SERVICE_CODE = "47"


def _get_gateway(db: Session) -> PaymentGatewayConfig | None:
    return db.query(PaymentGatewayConfig).filter(
        PaymentGatewayConfig.is_active == True  # noqa
    ).first()


async def _query_doku_qris(tx: Transaction, gateway: PaymentGatewayConfig) -> dict | None:
    creds         = gateway.credentials or {}
    client_id     = creds.get("client_id", "")
    private_key   = creds.get("private_key", "")
    client_secret = creds.get("secret_key") or creds.get("client_secret", "")
    merchant_id   = creds.get("qris_merchant_id") or creds.get("merchant_id", "")
    is_prod       = getattr(gateway, "is_production", False)
    base_url      = DOKU_PROD if is_prod else DOKU_SANDBOX

    if not all([client_id, private_key, client_secret, merchant_id]):
        logger.warning("[DOKU:query] Kredensial tidak lengkap — skip")
        return None

    ref = tx.xendit_invoice_id
    if not ref:
        logger.warning(f"[DOKU:query] TX {tx.transaction_code} xendit_invoice_id kosong")
        return None

    try:
        access_token = await get_token_b2b(base_url, client_id, private_key)
    except Exception as e:
        logger.error(f"[DOKU:query] Gagal get token: {e}")
        return None

    import time as _time
    timestamp   = _now_wib()
    external_id = str(int(_time.time() * 1000))

    body = {
        "originalReferenceNo":        ref,
        "originalPartnerReferenceNo": ref,
        "serviceCode":                QRIS_SERVICE_CODE,
        "merchantId":                 merchant_id,
    }
    body_str = json.dumps(body, separators=(",", ":"))

    signature = _symmetric_signature(
        "POST", QRIS_QUERY_PATH, access_token, body_str, timestamp, client_secret
    )

    headers = {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-PARTNER-ID":  client_id,
        "X-EXTERNAL-ID": external_id,
        "X-TIMESTAMP":   timestamp,
        "X-SIGNATURE":   signature,
        "CHANNEL-ID":    "H2H",
    }

    logger.info(
        f"[DOKU:query:REQUEST] TX={tx.transaction_code} "
        f"ref={ref} merchantId={merchant_id} "
        f"X-EXTERNAL-ID={external_id} X-TIMESTAMP={timestamp}"
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{base_url}{QRIS_QUERY_PATH}",
                content=body_str.encode("utf-8"),
                headers=headers,
            )
        data = resp.json()
    except Exception as e:
        logger.error(f"[DOKU:query] HTTP error: {e}")
        return None

    # ---- FULL RESPONSE LOG ----
    logger.info(
        f"[DOKU:query:RESPONSE] TX={tx.transaction_code} "
        f"HTTP={resp.status_code} "
        f"responseCode={data.get('responseCode')} "
        f"responseMessage={data.get('responseMessage')} "
        f"latestTransactionStatus={data.get('latestTransactionStatus')} "
        f"transactionStatusDesc={data.get('transactionStatusDesc')} "
        f"paidTime={data.get('paidTime')} "
        f"originalReferenceNo={data.get('originalReferenceNo')} "
        f"originalPartnerReferenceNo={data.get('originalPartnerReferenceNo')} "
        f"full={json.dumps(data, ensure_ascii=False)}"
    )

    return data


async def _settle_transaction(tx: Transaction, db: Session, doku_ref: str = "") -> None:
    from app.services.xendit import create_disbursement

    now = datetime.now(timezone.utc)
    tx.status     = "settled"
    tx.paid_at    = now
    tx.settled_at = now
    if doku_ref:
        tx.xendit_invoice_id = doku_ref

    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        commission           = Decimal(str(tx.guide_commission))
        guide.wallet_balance = (guide.wallet_balance or Decimal(0)) + commission
        guide.total_earnings = (guide.total_earnings or Decimal(0)) + commission

    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status       = "completed"
        booking.completed_at = now

    db.commit()
    logger.info(f"[DOKU:query] TX {tx.transaction_code} auto-settled")

    if guide and all([guide.bank_name, guide.bank_account_number, guide.bank_account_name]):
        try:
            await create_disbursement(
                external_id=f"CUSTHERDS-COMM-{tx.transaction_code}",
                bank_code=guide.bank_name,
                account_number=guide.bank_account_number,
                account_holder_name=guide.bank_account_name,
                amount=float(tx.guide_commission),
                description=f"Komisi Guide | TX {tx.transaction_code}",
            )
            db.commit()
        except Exception as e:
            logger.error(f"[DOKU:query] Disbursement gagal (non-fatal): {e}")


@router.get("/{tx_id}/payment-status", summary="Polling status pembayaran QRIS")
async def get_payment_status(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(404, "Vendor tidak ditemukan")
        tx = db.query(Transaction).filter(
            Transaction.id == tx_id,
            Transaction.vendor_id == vendor.id,
        ).first()
    else:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()

    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")

    if tx.status in ("settled", "payment_failed", "rejected"):
        return {
            "tx_id":      str(tx.id),
            "status":     tx.status,
            "paid_at":    tx.paid_at.isoformat() if tx.paid_at else None,
            "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
        }

    if tx.status == "payment_pending":
        gateway = _get_gateway(db)
        if gateway:
            doku_resp = await _query_doku_qris(tx, gateway)
            if doku_resp:
                status_code = doku_resp.get("latestTransactionStatus", "")
                doku_ref    = (
                    doku_resp.get("originalReferenceNo")
                    or doku_resp.get("originalPartnerReferenceNo")
                    or ""
                )

                if status_code == "00":           # PAID
                    await _settle_transaction(tx, db, doku_ref)
                    db.refresh(tx)
                elif status_code in ("03", "05"): # FAILED / EXPIRED
                    tx.status = "payment_failed"
                    db.commit()
                    db.refresh(tx)
                # status lain (pending, dll) — tidak diubah

    return {
        "tx_id":      str(tx.id),
        "status":     tx.status,
        "paid_at":    tx.paid_at.isoformat() if tx.paid_at else None,
        "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
    }
