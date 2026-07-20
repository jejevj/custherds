"""
DOKU Bulk Registration Bank — Settlement Bank Account Service

API: H2H (fc-h2h-api) — BUKAN SNAP.
Ref: https://developers.doku.com/accept-payments/finance-and-settlement/bulk-registration-bank
Ref Signature: https://dashboard.doku.com/docs/docs/technical-references/generate-signature

Base URL:
  https://api.doku.com/fc-h2h-api

Format string_to_sign (DOKU Non-SNAP standard):
  POST/PUT:
    Client-Id:{client_id}\n
    Request-Id:{request_id}\n
    Request-Timestamp:{timestamp}\n
    Request-Target:{path}\n
    Digest:{base64(SHA256(body))}

  GET:
    Client-Id:{client_id}\n
    Request-Id:{request_id}\n
    Request-Timestamp:{timestamp}\n
    Request-Target:{path}
"""

import base64
import hashlib
import hmac as hmac_lib
import json
import logging
import math
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
BASE_URL = "https://api.doku.com/fc-h2h-api"


# ─── Helpers ────────────────────────────────────────────────────────────

def _safe_str_credential(v) -> str:
    if v is None:
        return ""
    if isinstance(v, float) and math.isfinite(v) and v == math.floor(v):
        return str(int(v))
    return str(v)


def _get_doku_creds(db: Session) -> dict:
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
    raw = config.credentials or {}
    sanitized = {k: _safe_str_credential(v) for k, v in raw.items()}
    return sanitized


def _utc_now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _serialize_body(body: dict) -> bytes:
    return json.dumps(body, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def _make_digest(body_bytes: bytes) -> str:
    return base64.b64encode(hashlib.sha256(body_bytes).digest()).decode()


def _sanitize_doku_payload(body: dict) -> dict:
    if "bank_account" in body:
        ba = dict(body["bank_account"])
        if "number" in ba:
            num_str = str(ba["number"]).strip()
            if num_str.endswith(".0"):
                num_str = num_str[:-2]
            ba["number"] = num_str
        ba.setdefault("currency", "IDR")
        ba.setdefault("country", "Indonesia")
        return {**body, "bank_account": ba}
    return body


def _make_h2h_headers_and_body(
    client_id: str,
    secret_key: str,
    request_target: str,
    body: Optional[dict] = None,
) -> tuple[dict, Optional[bytes]]:
    client_id  = _safe_str_credential(client_id).strip()
    secret_key = _safe_str_credential(secret_key).strip()

    request_id = str(uuid.uuid4())
    timestamp  = _utc_now_str()

    logger.warning("[DOKU DEBUG] === STEP 1: CREDENTIALS ===")
    logger.warning("[DOKU DEBUG] client_id      = %r", client_id)
    logger.warning("[DOKU DEBUG] secret_key     = %r", secret_key)
    logger.warning("[DOKU DEBUG] secret_key len = %d", len(secret_key))
    logger.warning("[DOKU DEBUG] request_id     = %r", request_id)
    logger.warning("[DOKU DEBUG] timestamp      = %r", timestamp)
    logger.warning("[DOKU DEBUG] request_target = %r", request_target)

    if body is not None:
        body_bytes = _serialize_body(body)
        digest     = _make_digest(body_bytes)
        string_to_sign = (
            f"Client-Id:{client_id}\n"
            f"Request-Id:{request_id}\n"
            f"Request-Timestamp:{timestamp}\n"
            f"Request-Target:{request_target}\n"
            f"Digest:{digest}"
        )
        logger.warning("[DOKU DEBUG] === STEP 2: BODY ===")
        logger.warning("[DOKU DEBUG] body_bytes = %r", body_bytes)
        logger.warning("[DOKU DEBUG] digest     = %r", digest)
    else:
        body_bytes = None
        digest     = None
        string_to_sign = (
            f"Client-Id:{client_id}\n"
            f"Request-Id:{request_id}\n"
            f"Request-Timestamp:{timestamp}\n"
            f"Request-Target:{request_target}"
        )
        logger.warning("[DOKU DEBUG] === STEP 2: BODY === (no body / GET request)")

    logger.warning("[DOKU DEBUG] === STEP 3: STRING TO SIGN ===")
    logger.warning("[DOKU DEBUG] string_to_sign = %r", string_to_sign)

    sig_bytes = hmac_lib.new(
        secret_key.encode("utf-8"),
        string_to_sign.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    signature = "HMACSHA256=" + base64.b64encode(sig_bytes).decode()

    logger.warning("[DOKU DEBUG] === STEP 4: SIGNATURE ===")
    logger.warning("[DOKU DEBUG] signature = %r", signature)

    headers = {
        "Content-Type":      "application/json",
        "Client-Id":         client_id,
        "Request-Id":        request_id,
        "Request-Timestamp": timestamp,
        "Signature":         signature,
    }

    logger.warning("[DOKU DEBUG] === STEP 5: HEADERS ===")
    for k, v in headers.items():
        logger.warning("[DOKU DEBUG] header %s = %r", k, v)

    return headers, body_bytes


def _raise_doku_error(resp: httpx.Response, context: str) -> None:
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

    logger.warning("[DOKU DEBUG] === STEP 6: RESPONSE HEADERS ===")
    for k, v in resp.headers.items():
        logger.warning("[DOKU DEBUG] resp_header %s = %r", k, v)

    if isinstance(body, dict):
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
    ba = doku_data.get("bank_account") or doku_data
    sba_id = ba.get("bank_account_settlement_id")
    if sba_id:
        rec.doku_sba_id = str(sba_id)
    raw_status = ba.get("status")
    if raw_status:
        rec.doku_status = raw_status.upper()
        rec.status      = _doku_status_to_internal(raw_status)
    rec.doku_rejection_reason = ba.get("rejection_reason") or rec.doku_rejection_reason
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


# ─── DOKU H2H API Calls ──────────────────────────────────────────────────────

async def create_settlement_bank_account(db: Session, doku_payload: dict) -> dict:
    creds      = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    if not client_id or not secret_key:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap (client_id, secret_key).")

    endpoint       = "/v2/settlement-bank-account"
    request_target = endpoint
    doku_payload   = _sanitize_doku_payload(doku_payload)

    logger.warning("[DOKU DEBUG] === CREATE SBA START ===")
    logger.warning("[DOKU DEBUG] full_url = %r", f"{BASE_URL}{endpoint}")
    logger.warning("[DOKU DEBUG] doku_payload = %s", json.dumps(doku_payload))

    headers, body_bytes = _make_h2h_headers_and_body(
        client_id, secret_key, request_target=request_target, body=doku_payload
    )

    logger.warning("[DOKU DEBUG] === STEP 7: FULL REQUEST ===")
    logger.warning("[DOKU DEBUG] method  = POST")
    logger.warning("[DOKU DEBUG] url     = %r", f"{BASE_URL}{endpoint}")
    logger.warning("[DOKU DEBUG] body    = %r", body_bytes)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{BASE_URL}{endpoint}",
            content=body_bytes,
            headers=headers,
        )

    logger.warning("[DOKU DEBUG] === STEP 8: RESPONSE ===")
    logger.warning("[DOKU DEBUG] status_code = %d", resp.status_code)
    logger.warning("[DOKU DEBUG] resp_body   = %r", resp.text)

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, "CREATE SBA")

    doku_data = resp.json()
    logger.info("[DOKU CREATE SBA] response: %s", json.dumps(doku_data))

    ba             = doku_data.get("bank_account") or doku_data
    account_number = str(ba.get("number") or doku_payload.get("bank_account", {}).get("number", ""))
    bank_code      = str(ba.get("code")   or doku_payload.get("bank_account", {}).get("code", ""))

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
    creds      = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    if not client_id or not secret_key:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap.")

    endpoint       = f"/v2/settlement-bank-account/{doku_sba_id}"
    request_target = endpoint
    headers, _     = _make_h2h_headers_and_body(
        client_id, secret_key, request_target=request_target, body=None
    )

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{BASE_URL}{endpoint}", headers=headers)

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
        raise HTTPException(400, detail="Record belum punya doku_sba_id.")

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

    creds      = _get_doku_creds(db)
    client_id  = creds.get("client_id", "")
    secret_key = creds.get("secret_key", "") or creds.get("client_secret", "")

    endpoint       = "/v2/settlement-bank-account"
    request_target = endpoint
    doku_payload   = _sanitize_doku_payload(doku_payload)
    headers, body_bytes = _make_h2h_headers_and_body(
        client_id, secret_key, request_target=request_target, body=doku_payload
    )

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.put(
            f"{BASE_URL}{endpoint}",
            content=body_bytes,
            headers=headers,
        )

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, f"UPDATE SBA {rec.doku_sba_id}")

    doku_data = resp.json()
    _apply_doku_response_to_record(rec, doku_data)
    db.commit()
    db.refresh(rec)
    return _serialize_record(rec)


# Backward compat
async def get_settlement_bank_account(db: Session, sba_id: str) -> dict:
    return await _fetch_from_doku(db, sba_id)
