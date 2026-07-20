"""
DOKU Bulk Registration Bank — Settlement Bank Account Service

Payload ke DOKU selalu camelCase (transform dilakukan di endpoint layer):
  POST /v2/settlement-bank-account  → { bankCode, accountNo, accountName, merchantReference }
  PUT  /v2/settlement-bank-account/{id} → { accountName, merchantReference }
  GET  /v2/settlement-bank-account/{id}

Auth: DOKU SNAP Access Token (B2B)
Ref: https://developers.doku.com
"""

import base64
import hashlib
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment_gateway_config import PaymentGatewayConfig
from app.models.settlement_bank_account import SettlementBankAccount

logger = logging.getLogger(__name__)


# ─── Helpers ─────────────────────────────────────────────────────────────────

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


def _now_wib_str() -> str:
    now = datetime.now(timezone(timedelta(hours=7)))
    return now.strftime("%Y-%m-%dT%H:%M:%S+07:00")


async def _get_access_token(client_id: str, private_key_pem: str, base_url: str) -> str:
    timestamp = _now_wib_str()
    string_to_sign = f"{client_id}|{timestamp}"

    try:
        private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
        sig_bytes = private_key.sign(string_to_sign.encode(), padding.PKCS1v15(), hashes.SHA256())
        x_signature = base64.b64encode(sig_bytes).decode()
    except Exception as e:
        raise HTTPException(500, detail=f"Gagal membuat signature DOKU: {e}")

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{base_url}/authorization/v1/access-token/b2b",
            json={"grantType": "client_credentials"},
            headers={
                "Content-Type": "application/json",
                "X-CLIENT-KEY": client_id,
                "X-TIMESTAMP": timestamp,
                "X-SIGNATURE": x_signature,
            },
        )

    data = resp.json()
    if resp.status_code != 200 or not data.get("accessToken"):
        raise HTTPException(502, detail=f"Gagal access token DOKU: {data.get('responseMessage', 'Unknown')}")
    return data["accessToken"]


def _make_snap_headers(
    access_token: str,
    client_id: str,
    private_key_pem: str,
    http_method: str,
    endpoint_path: str,
    request_body: Optional[dict],
) -> dict:
    timestamp = _now_wib_str()
    body_str  = json.dumps(request_body, separators=(",", ":")) if request_body else ""
    body_hash = hashlib.sha256(body_str.encode()).hexdigest().lower()
    string_to_sign = f"{http_method}:{endpoint_path}:{access_token}:{body_hash}:{timestamp}"

    try:
        private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
        sig_bytes = private_key.sign(string_to_sign.encode(), padding.PKCS1v15(), hashes.SHA256())
        x_signature = base64.b64encode(sig_bytes).decode()
    except Exception as e:
        raise HTTPException(500, detail=f"Gagal transactional signature: {e}")

    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-CLIENT-KEY": client_id,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": x_signature,
        "X-PARTNER-ID": client_id,
        "X-EXTERNAL-ID": str(uuid.uuid4()).replace("-", "")[:32],
        "CHANNEL-ID": "95221",
    }


def _raise_doku_error(resp: httpx.Response, context: str) -> None:
    """Log full DOKU response body dan raise HTTPException dengan detail lengkap."""
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
        detail = (
            body.get("responseMessage")
            or body.get("message")
            or body.get("detail")
            or body.get("error")
            or f"DOKU error: HTTP {resp.status_code}"
        )
        # Sertakan responseCode jika ada untuk diagnosis
        code = body.get("responseCode") or body.get("code")
        if code:
            detail = f"[{code}] {detail}"
    else:
        detail = body or f"DOKU error: HTTP {resp.status_code}"

    raise HTTPException(status_code=resp.status_code, detail=detail)


def _doku_status_to_internal(doku_status: Optional[str]) -> str:
    return {"PENDING": "pending", "VERIFIED": "verified", "REJECTED": "rejected"}.get(
        (doku_status or "").upper(), "pending"
    )


def _serialize_record(rec: SettlementBankAccount) -> dict:
    return {
        "id":                    str(rec.id),
        "guide_id":              str(rec.guide_id)  if rec.guide_id  else None,
        "vendor_id":             str(rec.vendor_id) if rec.vendor_id else None,
        "bank_code":             rec.bank_code,
        "account_number":        rec.account_number,
        "account_name":          rec.account_name,
        "account_email":         rec.account_email,
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


# ─── Local DB ─────────────────────────────────────────────────────────────────

def list_settlement_bank_accounts(
    db: Session, page: int = 1, size: int = 20, status: Optional[str] = None,
) -> dict:
    query = db.query(SettlementBankAccount)
    if status:
        query = query.filter(SettlementBankAccount.status == status)
    total   = query.count()
    records = query.order_by(SettlementBankAccount.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": [_serialize_record(r) for r in records], "total": total, "page": page, "size": size}


def _apply_doku_response_to_record(rec: SettlementBankAccount, doku_data: dict) -> None:
    """Update field DB lokal dari response DOKU (camelCase)."""
    rec.doku_sba_id           = doku_data.get("bankAccountSettlementId") or rec.doku_sba_id
    rec.doku_reference_no     = doku_data.get("referenceNo")             or rec.doku_reference_no
    raw_status                = doku_data.get("status") or doku_data.get("bankAccountStatus")
    if raw_status:
        rec.doku_status = raw_status.upper()
        rec.status      = _doku_status_to_internal(raw_status)
    rec.doku_rejection_reason = doku_data.get("rejectionReason") or rec.doku_rejection_reason
    rec.doku_raw_response     = json.dumps(doku_data)
    if rec.status == "verified" and not rec.verified_at:
        rec.verified_at = datetime.now(timezone.utc)


# ─── DOKU API Calls ──────────────────────────────────────────────────────────

async def create_settlement_bank_account(db: Session, doku_payload: dict) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id       = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")

    if not client_id or not private_key_pem:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap (client_id, private_key).")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = "/v2/settlement-bank-account"

    logger.info("[DOKU CREATE SBA] base_url=%s payload=%s", base_url, json.dumps(doku_payload))

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers      = _make_snap_headers(access_token, client_id, private_key_pem, "POST", endpoint, doku_payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{base_url}{endpoint}", json=doku_payload, headers=headers)

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, "CREATE SBA")

    doku_data = resp.json()
    logger.info("[DOKU CREATE SBA] response: %s", json.dumps(doku_data))

    # Idempotent: cek berdasarkan accountNo + bankCode
    existing = (
        db.query(SettlementBankAccount)
        .filter(
            SettlementBankAccount.account_number == doku_payload.get("accountNo"),
            SettlementBankAccount.bank_code       == doku_payload.get("bankCode"),
        )
        .first()
    )

    if existing:
        _apply_doku_response_to_record(existing, doku_data)
        db.commit()
        db.refresh(existing)
        return _serialize_record(existing)

    rec = SettlementBankAccount(
        bank_code      = doku_payload.get("bankCode", ""),
        account_number = doku_payload.get("accountNo", ""),
        account_name   = doku_payload.get("accountName", ""),
        registered_at  = datetime.now(timezone.utc),
        status         = "pending",
    )
    _apply_doku_response_to_record(rec, doku_data)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return _serialize_record(rec)


async def get_and_sync_settlement_bank_account(db: Session, record_id: str) -> dict:
    try:
        uid = uuid.UUID(record_id)
    except ValueError:
        raise HTTPException(400, detail="ID tidak valid (harus UUID).")

    rec = db.query(SettlementBankAccount).filter(SettlementBankAccount.id == uid).first()
    if not rec:
        raise HTTPException(404, detail=f"Settlement bank account '{record_id}' tidak ditemukan di DB lokal.")

    if rec.doku_sba_id and rec.status == "pending":
        try:
            doku_data = await _fetch_from_doku(db, rec.doku_sba_id)
            _apply_doku_response_to_record(rec, doku_data)
            db.commit()
            db.refresh(rec)
        except HTTPException:
            pass

    return _serialize_record(rec)


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


async def _fetch_from_doku(db: Session, doku_sba_id: str) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id       = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")

    if not client_id or not private_key_pem:
        raise HTTPException(400, detail="Credentials DOKU tidak lengkap.")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = f"/v2/settlement-bank-account/{doku_sba_id}"

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers      = _make_snap_headers(access_token, client_id, private_key_pem, "GET", endpoint, None)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{base_url}{endpoint}", headers=headers)

    if not resp.is_success:
        _raise_doku_error(resp, f"GET SBA {doku_sba_id}")

    return resp.json()


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

    creds, is_production = _get_doku_creds(db)
    client_id       = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = f"/v2/settlement-bank-account/{rec.doku_sba_id}"

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers      = _make_snap_headers(access_token, client_id, private_key_pem, "PUT", endpoint, doku_payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.put(f"{base_url}{endpoint}", json=doku_payload, headers=headers)

    if resp.status_code not in (200, 201):
        _raise_doku_error(resp, f"UPDATE SBA {rec.doku_sba_id}")

    return resp.json()


# Kept for backward compat
async def get_settlement_bank_account(db: Session, sba_id: str) -> dict:
    return await _fetch_from_doku(db, sba_id)
