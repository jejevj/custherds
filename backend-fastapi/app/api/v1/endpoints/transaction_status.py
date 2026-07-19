"""
Polling endpoint: GET /api/v1/transactions/{tx_id}/payment-status

Frontend memanggil ini tiap 5 detik saat QRIS modal ditampilkan.
Backend akan query langsung ke DOKU API untuk status terkini,
lalu update DB jika sudah PAID.

DOKU tidak push webhook — merchant harus polling via:
POST /snap-adapter/b2b/v1.0/qr/qr-mpm-query
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
import uuid
from datetime import datetime, timezone
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

router = APIRouter()
logger = logging.getLogger(__name__)

DOKU_SANDBOX = "https://api-sandbox.doku.com"
DOKU_PROD    = "https://api.doku.com"
QRIS_QUERY_PATH = "/snap-adapter/b2b/v1.0/qr/qr-mpm-query"
QRIS_SERVICE_CODE = "47"


def _get_gateway(db: Session) -> PaymentGatewayConfig | None:
    return db.query(PaymentGatewayConfig).filter(
        PaymentGatewayConfig.is_active == True  # noqa
    ).first()


def _build_doku_timestamp() -> str:
    """ISO 8601 dengan offset +07:00"""
    now = datetime.now(timezone.utc)
    # +07:00 WIB
    offset = "+07:00"
    ts = now.strftime("%Y-%m-%dT%H:%M:%S") + offset
    return ts


def _build_symmetric_signature(
    client_secret: str,
    http_method: str,
    endpoint_path: str,
    access_token: str,
    body_str: str,
    timestamp: str,
) -> str:
    """
    HMAC_SHA512(clientSecret, stringToSign)
    stringToSign = METHOD:PATH:Bearer token:lowercase(hex(sha256(minify(body)))):timestamp
    """
    import base64
    body_hash     = hashlib.sha256(body_str.encode()).hexdigest().lower()
    str_to_sign   = f"{http_method}:{endpoint_path}:{access_token}:{body_hash}:{timestamp}"
    raw_hmac      = hmac.new(client_secret.encode(), str_to_sign.encode(), hashlib.sha512).digest()
    return base64.b64encode(raw_hmac).decode()


async def _get_b2b_token(client_id: str, base_url: str) -> str | None:
    """
    Ambil B2B Access Token dari DOKU.
    Untuk token generation pakai Asymmetric (RSA), tapi untuk polling
    kita gunakan token yang sudah ada di env atau generate minimal.
    Catatan: implementasi penuh perlu private key RSA.
    Ini versi simplified — return empty string jika tidak ada.
    """
    # TODO: Implementasi penuh dengan RSA private key
    # Untuk sekarang, gunakan token yang disimpan di credentials
    return ""


async def _query_doku_qris(
    tx: Transaction,
    gateway: PaymentGatewayConfig,
) -> dict | None:
    """
    Panggil DOKU Query QRIS API untuk cek status pembayaran terkini.
    Returns dict response dari DOKU, atau None jika gagal.
    """
    creds         = gateway.credentials or {}
    client_id     = creds.get("client_id") or creds.get("brand_id", "")
    client_secret = creds.get("secret_key") or creds.get("client_secret", "")
    merchant_id   = creds.get("qris_merchant_id") or creds.get("merchant_id", "")
    is_sandbox    = creds.get("is_sandbox", True)
    base_url      = DOKU_SANDBOX if is_sandbox else DOKU_PROD

    if not all([client_id, client_secret, merchant_id]):
        logger.warning("[DOKU:query] Kredensial tidak lengkap")
        return None

    # originalPartnerReferenceNo = format saat generate: CST-{tx_code}-{timestamp}
    # Kita simpan di xendit_invoice_id saat generate
    original_partner_ref = tx.xendit_invoice_id or f"CST-{tx.transaction_code}"
    original_ref         = tx.xendit_invoice_url or ""  # referenceNo dari DOKU saat generate

    timestamp   = _build_doku_timestamp()
    external_id = str(int(time.time() * 1000))  # unique per hari

    body = {
        "originalReferenceNo":        original_ref,
        "originalPartnerReferenceNo": original_partner_ref,
        "serviceCode":                QRIS_SERVICE_CODE,
        "merchantId":                 merchant_id,
    }
    body_str = json.dumps(body, separators=(",", ":"))

    # Untuk signature, access_token diisi kosong jika pakai B2B token bearer
    # Implementasi penuh butuh RSA token — ini placeholder yg tetap kirim request
    access_token = ""
    signature = _build_symmetric_signature(
        client_secret, "POST", QRIS_QUERY_PATH, access_token, body_str, timestamp
    )

    headers = {
        "X-PARTNER-ID":  client_id,
        "X-EXTERNAL-ID": external_id,
        "X-TIMESTAMP":   timestamp,
        "X-SIGNATURE":   signature,
        "Authorization": f"Bearer {access_token}",
        "CHANNEL-ID":    "H2H",
        "Content-Type":  "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{base_url}{QRIS_QUERY_PATH}",
                headers=headers,
                content=body_str,
            )
        data = resp.json()
        logger.info(
            f"[DOKU:query] tx={tx.transaction_code} "
            f"status={data.get('latestTransactionStatus')} "
            f"responseCode={data.get('responseCode')}"
        )
        return data
    except Exception as e:
        logger.error(f"[DOKU:query] error: {e}")
        return None


async def _settle_transaction(tx: Transaction, doku_ref: str, db: Session) -> None:
    """Update TX ke settled + update guide wallet + booking completed."""
    tx.status     = "settled"
    tx.paid_at    = datetime.now(timezone.utc)
    tx.settled_at = datetime.now(timezone.utc)
    if doku_ref:
        tx.xendit_invoice_id = doku_ref

    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        guide.wallet_balance += tx.guide_commission
        guide.total_earnings += tx.guide_commission

    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status       = "completed"
        booking.completed_at = datetime.now(timezone.utc)

    db.commit()
    logger.info(f"[DOKU:query] TX {tx.transaction_code} auto-settled via polling")


@router.get("/{tx_id}/payment-status", summary="Polling status pembayaran QRIS")
async def get_payment_status(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    1. Cek status TX di DB terlebih dahulu.
    2. Jika masih payment_pending, query ke DOKU API untuk status terkini.
    3. Jika DOKU bilang PAID (00), auto-settle TX di DB.
    4. Return status terkini ke frontend.

    DOKU tidak push webhook untuk QRIS — merchant harus polling aktif.
    """
    # Akses kontrol: vendor hanya bisa cek TX miliknya
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

    # Kalau sudah final, langsung return — tidak perlu query DOKU
    if tx.status in ("settled", "payment_failed", "rejected"):
        return {
            "tx_id":      str(tx.id),
            "status":     tx.status,
            "paid_at":    tx.paid_at.isoformat() if tx.paid_at else None,
            "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
            "qris_string": None,
        }

    # Masih payment_pending — query DOKU untuk status terkini
    if tx.status == "payment_pending":
        gateway = _get_gateway(db)
        if gateway:
            doku_resp = await _query_doku_qris(tx, gateway)
            if doku_resp:
                tx_status_code = doku_resp.get("latestTransactionStatus", "")
                doku_ref       = doku_resp.get("originalReferenceNo", "")

                # 00 = SUCCESS
                if tx_status_code == "00":
                    await _settle_transaction(tx, doku_ref, db)
                    db.refresh(tx)

                # 03/05 = FAILED/EXPIRED
                elif tx_status_code in ("03", "05"):
                    tx.status = "payment_failed"
                    db.commit()
                    db.refresh(tx)

    return {
        "tx_id":      str(tx.id),
        "status":     tx.status,
        "paid_at":    tx.paid_at.isoformat() if tx.paid_at else None,
        "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
        "qris_string": None,  # tidak perlu kirim ulang ke frontend
    }
