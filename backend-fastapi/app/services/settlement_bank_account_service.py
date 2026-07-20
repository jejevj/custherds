"""
DOKU Bulk Registration Bank — Settlement Bank Account Service

API yang digunakan adalah H2H (fc-h2h-api), BUKAN SNAP.
Ref: https://developers.doku.com/accept-payments/finance-and-settlement/bulk-registration-bank

Base URL:
  Production : https://production.doku.com/fc-h2h-api
  Sandbox    : https://sandbox.doku.com/fc-h2h-api

Auth Headers (setiap request):
  Client-Id         : client_id dari credentials
  Request-Id        : UUID unik per request
  Request-Timestamp : ISO8601 UTC+0  (e.g. 2020-08-11T08:45:42Z)
  Signature         : HMACSHA256=<base64(HMAC-SHA256(stringToSign, secret_key))>

String to sign:
  Client-Id + ":" + Request-Id + ":" + Request-Timestamp + ":" + SHA256(minifiedBody)
  (untuk GET/tanpa body, bagian SHA256 dikosongkan)

Payload (snake_case, di dalam key bank_account):
  POST /v2/settlement-bank-account
    { bank_account: { code, number, name, currency, country } }
  PUT  /v2/settlement-bank-account/{sba_id}
    { bank_account: { code, number, name, currency, country } }
  GET  /v2/settlement-bank-account/{sba_id}
"""

import base64
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment_gateway_config import PaymentGatewayConfig
from app.models.settlement_bank_account import SettlementBankAccount

logger = logging.getLogger(__name__)


# ─── Constants ────────────────────────────────────────────────────────────
BASE_URL_PROD    = "https://production.doku.com/fc-h2h-api"
BASE_URL_SANDBOX = "https://sandbox.doku.com/fc-h2h-api"


# ─── Helpers ────────────────────────────────────────────────────────────

def _get_doku_creds(db: Session) -> tuple[dict, bool]:
    config = (
        db.query(PaymentGatewayConfig)
        .filter(
            PaymentGatewayConfig.provider == "doku",
            PaymentGatewayConfig.is_active == True,
        )
        .first()
    )
    if not config:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gateway DOKU belum dikonfigurasi atau belum aktif.",
        )
    return config.credentials or {}, config.is_production


def _utc_now_str() -> str:
    """ISO8601 UTC+0 tanpa microseconds, e.g. 2020-08-11T08:45:42Z"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _make_h2h_signature(
    client_id: str,
    request_id: str,
    timestamp: str,
    secret_key: str,
    body: Optional[dict] = None,
) -> str:
    """
    Signature = HMACSHA256=<base64(HMAC-SHA256(stringToSign, secret_key))>

    stringToSign:
      - Dengan body : Client-Id:Request-Id:Request-Timestamp:SHA256Hex(minifiedBody)
      - Tanpa body  : Client-Id:Request-Id:Request-Timestamp
    """
    if body is not None:
        body_str  = json.dumps(body, separators=(",", ":"))
        body_hash = hashlib.sha256(body_str.encode()).hexdigest()
        string_to_sign = f"{client_id}:{request_id}:{timestamp}:{body_hash}"
    else:
        string_to_sign = f"{client_id}:{request_id}:{timestamp}"

    sig_bytes = hmac.new(
        secret_key.encode(),
        string_to_sign.encode(),
        hashlib.sha256,
    ).digest()
    return "HMACSHA256=" + base64.b64encode(sig_bytes).decode()


def _make_h2h_headers(
    client_id: str,
    secret_key: str,
    body: Optional[dict] = None,
) -> dict:
    request_id = str(uuid.uuid4())
    timestamp  = _utc_now_str()
    signature  = _make_h2h_signature(client_id, request_id, timestamp, secret_key, body)
    return {
        "Content-Type":      "application/json",
        "Client-Id":         client_id,
        "Request-Id":        request_id,
        "Request-Timestamp": timestamp,
        "Signature":         signature,
    }


def _raise_doku_error(resp: httpx.Response, context: str) -> None:
    """Log full response dan raise HTTPException dengan pesan yang bisa dibaca user."""
    try:
        body = resp.json()
    except Exception:
        body = resp.text

    logger.error(
        "[DOKU %s] HTTP %s | body: %s",
        context,
        resp.status_code,
        json.dumps(body) if isinstance(body, dict) else body,
    )

    if isinstance(body, dict):
        # H2H error format: { error: { message, type } }
        if isinstance(body.get("error"), dict):
            detail = body["error"].get("message") or f"DOKU error HTTP {resp.status_code}"
        else:
            detail = (
                body.get("message")
                or body.get("responseMessage")
                or body.get("detail")
                or f"DOKU error HTTP {resp.status_code}"
            )
    else:
        detail = str(body) or f"DOKU error HTTP {resp.status_code}"

    raise HTTPException(status_code=resp.status_code, detail=str(detail))


def _doku_status_to_internal(doku_status: Optional[str]) -> str:
    return {
        "PENDING":  "pending_verification",
        "VERIFIED": "verified",
        "REJECTED": "rejected",
        "INACTIVE": "inactive",
    }.get((doku_status or "").upper(), "pending_verification")


def _serialize_record(rec: SettlementBankAccount) -> dict:
    return {
        "id":                    str(rec.id),
        "guide_id":              str(rec.guide_id)  if rec.guide_id  else None,
        "vendor_id":             str(rec.vendor_id) if rec.vendor_id else None,
        "bank_code":             rec.bank_code,
        "bank_name":             getattr(rec, "bank_name", None),
        "account_number":        rec.account_number,
        "account_name":          rec.account_name,
        "merchant_reference":    getattr(rec, "merchant_reference", None),
        "account_email":         getattr(rec, "account_email", None),
        "doku_sba_id":           rec.doku_sba_id,
        "doku_reference_no":     rec.doku_reference_no,
        "doku_status":           rec.doku_status,
        "doku_rejection_reason": rec.doku_rejection_reason,
        "status":                rec.status,
        "is_primary":            rec.is_primary,
        "registered_at":         rec.registered_at.isoformat() if rec.registered_at else None,
        "verified_at":           rec.verified_at.isoformat()   if rec.verified_at   else None,
        "created_at":            rec.created_at.isoformat()    if rec.created_at    else None,
        "updated_at":            rec.updated_at.isoformat()    if rec.updated_at    else None,
    }


def _apply_doku_response_to_record(rec: SettlementBankAccount, doku_data: dict) -> None:
    """
    Update field DB lokal dari response body DOKU H2H.
    Response H2H membungkus data di dalam key bank_account.
    """
    ba = doku_data.get("bank_account") or doku_data  # fallback ke root
    rec.doku_sba_id           = ba.get("bank_account_settlement_id") or rec.doku_sba_id
    rec.doku_reference_no     = ba.get("referenceNo")                or rec.doku_reference_no
    raw_status                = ba.get("status") or ba.get("bankAccountStatus")
    if raw_status:
        rec.doku_status = raw_status.upper()
        rec.status      = _doku_status_to_internal(raw_status)
    rec.doku_rejection_reason = ba.get("rejectionReason") or rec.doku_rejection_reason
    rec.doku_raw_response     = json.dumps(doku_data)
    if rec.status == "verified" and not rec.verified_at:
        rec.verified_at = datetime.now(timezone.utc)


# ─── Local DB ────────────────────────────────────────────────────────────

def list_settlement_bank_accounts(
    db: Session, page: int = 1, size: int = 20, status: Optional[str] = None,
) -> dict:
    query = db.query(SettlementBankAccount)
    if status:
        query = query.filter(SettlementBankAccount.status == status)
    total   = query.count()
    records = (
        query
        .order_by(SettlementBankAccount.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return {"items": [_serialize_record(r) for r in records], "total": total, "page": page, "size": size}


# ─── DOKU H2H API Calls ─────────────────────────────────────────────────────

async def create_settlement_bank_account(db: Session, doku_payload: dict) -> dict:
    """
    doku_payload (dari router/endpoint layer):
      {
        bank_account: {
          code     : "002",
          number   : "1234567890",   # string
          name     : "JOHN DOE",
          currency : "IDR",
          country  : "ID"
        }
      }
    """
    creds, is_production = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    if not client_id or not secret_key:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap (client_id, secret_key).")

    base_url = BASE_URL_PROD if is_production else BASE_URL_SANDBOX
    endpoint = "/v2/settlement-bank-account"

    logger.info(
        "[DOKU CREATE SBA] base_url=%s payload=%s",
        base_url,
        json.dumps(doku_payload),
    )

    headers = _make_h2h_headers(client_id, secret_key, body=doku_payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{base_url}{endpoint}", json=doku_payload, headers=headers)

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, "CREATE SBA")

    doku_data = resp.json()
    logger.info("[DOKU CREATE SBA] response: %s", json.dumps(doku_data))

    ba = doku_data.get("bank_account") or doku_data
    account_number = str(ba.get("number") or "")
    bank_code      = str(ba.get("code")   or doku_payload.get("bank_account", {}).get("code", ""))

    # Idempotent
    existing = (
        db.query(SettlementBankAccount)
        .filter(
            SettlementBankAccount.account_number == account_number,
            SettlementBankAccount.bank_code       == bank_code,
        )
        .first()
    )

    if existing:
        _apply_doku_response_to_record(existing, doku_data)
        db.commit()
        db.refresh(existing)
        return _serialize_record(existing)

    payload_ba = doku_payload.get("bank_account", {})
    rec = SettlementBankAccount(
        bank_code      = payload_ba.get("code", ""),
        account_number = str(payload_ba.get("number", "")),
        account_name   = payload_ba.get("name", ""),
        registered_at  = datetime.now(timezone.utc),
        status         = "pending_verification",
    )
    _apply_doku_response_to_record(rec, doku_data)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return _serialize_record(rec)


async def _fetch_from_doku(db: Session, doku_sba_id: str) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    if not client_id or not secret_key:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap.")

    base_url = BASE_URL_PROD if is_production else BASE_URL_SANDBOX
    endpoint = f"/v2/settlement-bank-account/{doku_sba_id}"

    headers = _make_h2h_headers(client_id, secret_key, body=None)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{base_url}{endpoint}", headers=headers)

    if not resp.is_success:
        _raise_doku_error(resp, f"GET SBA {doku_sba_id}")

    return resp.json()


async def sync_from_doku(db: Session, record_id: str) -> dict:
    try:
        uid = uuid.UUID(record_id)
    except ValueError:
        raise HTTPException(400, detail="ID tidak valid (harus UUID).")

    rec = db.query(SettlementBankAccount).filter(SettlementBankAccount.id == uid).first()
    if not rec:
        raise HTTPException(404, detail=f"Record '{record_id}' tidak ditemukan di DB lokal.")
    if not rec.doku_sba_id:
        raise HTTPException(400, detail="Record belum punya doku_sba_id. Create ke DOKU mungkin belum berhasil.")

    doku_data = await _fetch_from_doku(db, rec.doku_sba_id)
    _apply_doku_response_to_record(rec, doku_data)
    db.commit()
    db.refresh(rec)
    return {"message": "Sync berhasil.", "data": _serialize_record(rec)}


async def get_and_sync_settlement_bank_account(db: Session, record_id: str) -> dict:
    try:
        uid = uuid.UUID(record_id)
    except ValueError:
        raise HTTPException(400, detail="ID tidak valid (harus UUID).")

    rec = db.query(SettlementBankAccount).filter(SettlementBankAccount.id == uid).first()
    if not rec:
        raise HTTPException(404, detail=f"Settlement bank account '{record_id}' tidak ditemukan di DB lokal.")

    if rec.doku_sba_id and rec.status in ("pending_verification", "pending"):
        try:
            doku_data = await _fetch_from_doku(db, rec.doku_sba_id)
            _apply_doku_response_to_record(rec, doku_data)
            db.commit()
            db.refresh(rec)
        except HTTPException:
            pass

    return _serialize_record(rec)


async def update_settlement_bank_account(db: Session, sba_id: str, doku_payload: dict) -> dict:
    """
    doku_payload:
      {
        bank_account: { code, number, name, currency, country }
      }
    """
    try:
        uid = uuid.UUID(sba_id)
    except ValueError:
        raise HTTPException(400, detail="ID tidak valid (harus UUID).")

    rec = db.query(SettlementBankAccount).filter(SettlementBankAccount.id == uid).first()
    if not rec:
        raise HTTPException(404, detail="Record tidak ditemukan di DB lokal.")
    if not rec.doku_sba_id:
        raise HTTPException(400, detail="Record belum punya doku_sba_id.")
    if rec.status != "verified":
        raise HTTPException(400, detail="Hanya rekening berstatus verified yang bisa diupdate.")

    creds, is_production = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    base_url = BASE_URL_PROD if is_production else BASE_URL_SANDBOX
    endpoint = f"/v2/settlement-bank-account/{rec.doku_sba_id}"

    headers = _make_h2h_headers(client_id, secret_key, body=doku_payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.put(f"{base_url}{endpoint}", json=doku_payload, headers=headers)

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, f"UPDATE SBA {rec.doku_sba_id}")

    doku_data = resp.json()
    _apply_doku_response_to_record(rec, doku_data)
    db.commit()
    db.refresh(rec)
    return _serialize_record(rec)


# Kept for backward compat
async def get_settlement_bank_account(db: Session, sba_id: str) -> dict:
    return await _fetch_from_doku(db, sba_id)
