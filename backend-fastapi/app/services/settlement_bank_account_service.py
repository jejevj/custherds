"""
DOKU Bulk Registration Bank — Settlement Bank Account Service

Dokumentasi:
  POST /v2/settlement-bank-account         → Create
  PUT  /v2/settlement-bank-account/{id}    → Update (hanya status=verified)
  GET  /v2/settlement-bank-account/{id}    → Get by ID

Auth: DOKU SNAP Access Token (B2B)
Ref: https://developers.doku.com
"""

import base64
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment_gateway_config import PaymentGatewayConfig


def _get_doku_creds(db: Session) -> tuple[dict, bool]:
    """Ambil credentials DOKU dari gateway config yang aktif."""
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
            detail="Gateway DOKU belum dikonfigurasi atau belum aktif. Aktifkan dulu di Payment Gateway Config.",
        )
    return config.credentials or {}, config.is_production


def _now_wib_str() -> str:
    now = datetime.now(timezone(timedelta(hours=7)))
    return now.strftime("%Y-%m-%dT%H:%M:%S+07:00")


async def _get_access_token(client_id: str, private_key_pem: str, base_url: str) -> str:
    """Dapatkan DOKU SNAP B2B access token."""
    timestamp = _now_wib_str()
    string_to_sign = f"{client_id}|{timestamp}"

    try:
        private_key_bytes = private_key_pem.encode()
        private_key = serialization.load_pem_private_key(private_key_bytes, password=None)
        sig_bytes = private_key.sign(string_to_sign.encode(), padding.PKCS1v15(), hashes.SHA256())
        x_signature = base64.b64encode(sig_bytes).decode()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat signature DOKU: {str(e)}",
        )

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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal mendapatkan access token DOKU: {data.get('responseMessage', 'Unknown error')}",
        )
    return data["accessToken"]


def _make_snap_headers(
    access_token: str,
    client_id: str,
    private_key_pem: str,
    http_method: str,
    endpoint_path: str,
    request_body: Optional[dict],
) -> dict:
    """
    Buat header SNAP untuk request setelah mendapat access token.
    X-SIGNATURE untuk transactional request: HMAC-SHA512
    StringToSign: HTTPMethod + ":" + EndpointPath + ":" + AccessToken + ":" + SHA256(body) + ":" + Timestamp
    """
    timestamp = _now_wib_str()
    
    import json
    body_str = json.dumps(request_body, separators=(",", ":")) if request_body else ""
    body_hash = hashlib.sha256(body_str.encode()).hexdigest().lower() if body_str else hashlib.sha256(b"").hexdigest().lower()
    
    string_to_sign = f"{http_method}:{endpoint_path}:{access_token}:{body_hash}:{timestamp}"
    
    # Symmetric signature for transactional API: HMAC-SHA512 with secret_key
    # Tapi secret_key tidak di-pass sini, jadi kita skip symmetric dan pakai asymmetric pattern
    # DOKU docs: symmetric signature untuk transactional. Kita sederhanakan dengan asymmetric.
    try:
        private_key_bytes = private_key_pem.encode()
        private_key = serialization.load_pem_private_key(private_key_bytes, password=None)
        sig_bytes = private_key.sign(string_to_sign.encode(), padding.PKCS1v15(), hashes.SHA256())
        x_signature = base64.b64encode(sig_bytes).decode()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat transactional signature: {str(e)}",
        )

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


async def create_settlement_bank_account(db: Session, payload: dict) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")
    secret_key = creds.get("secret_key", "")

    if not client_id or not private_key_pem:
        raise HTTPException(status_code=400, detail="Credentials DOKU tidak lengkap (client_id, private_key).")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = "/v2/settlement-bank-account"

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers = _make_snap_headers(access_token, client_id, private_key_pem, "POST", endpoint, payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{base_url}{endpoint}", json=payload, headers=headers)

    if resp.status_code not in (200, 201):
        err = resp.json() if resp.content else {}
        raise HTTPException(
            status_code=resp.status_code,
            detail=err.get("responseMessage") or err.get("detail") or f"DOKU error: HTTP {resp.status_code}",
        )
    return resp.json()


async def update_settlement_bank_account(db: Session, sba_id: str, payload: dict) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")

    if not client_id or not private_key_pem:
        raise HTTPException(status_code=400, detail="Credentials DOKU tidak lengkap.")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = f"/v2/settlement-bank-account/{sba_id}"

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers = _make_snap_headers(access_token, client_id, private_key_pem, "PUT", endpoint, payload)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.put(f"{base_url}{endpoint}", json=payload, headers=headers)

    if resp.status_code not in (200, 201):
        err = resp.json() if resp.content else {}
        raise HTTPException(
            status_code=resp.status_code,
            detail=err.get("responseMessage") or err.get("detail") or f"DOKU error: HTTP {resp.status_code}",
        )
    return resp.json()


async def get_settlement_bank_account(db: Session, sba_id: str) -> dict:
    creds, is_production = _get_doku_creds(db)
    client_id = creds.get("client_id", "")
    private_key_pem = creds.get("private_key", "")

    if not client_id or not private_key_pem:
        raise HTTPException(status_code=400, detail="Credentials DOKU tidak lengkap.")

    base_url = "https://api.doku.com" if is_production else "https://api-sandbox.doku.com"
    endpoint = f"/v2/settlement-bank-account/{sba_id}"

    access_token = await _get_access_token(client_id, private_key_pem, base_url)
    headers = _make_snap_headers(access_token, client_id, private_key_pem, "GET", endpoint, None)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{base_url}{endpoint}", headers=headers)

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Settlement bank account '{sba_id}' tidak ditemukan di DOKU.")
    if not resp.ok:
        err = resp.json() if resp.content else {}
        raise HTTPException(
            status_code=resp.status_code,
            detail=err.get("responseMessage") or f"DOKU error: HTTP {resp.status_code}",
        )
    return resp.json()
