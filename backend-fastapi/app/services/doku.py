"""
DOKU SNAP Service
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional

import httpx
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

logger = logging.getLogger(__name__)

_WIB = timezone(timedelta(hours=7))


def _now_wib() -> str:
    return datetime.now(_WIB).strftime("%Y-%m-%dT%H:%M:%S+07:00")


def _asymmetric_signature(client_id: str, private_key_pem: str, timestamp: str) -> str:
    string_to_sign = f"{client_id}|{timestamp}"
    pk_bytes = private_key_pem.encode()
    if not private_key_pem.strip().startswith("-----"):
        pk_bytes = base64.b64decode(private_key_pem)
        private_key = serialization.load_der_private_key(pk_bytes, password=None)
    else:
        private_key = serialization.load_pem_private_key(pk_bytes, password=None)
    sig = private_key.sign(string_to_sign.encode(), padding.PKCS1v15(), hashes.SHA256())
    return base64.b64encode(sig).decode()


def _symmetric_signature(
    http_method: str,
    endpoint: str,
    access_token: str,
    request_body: dict,
    timestamp: str,
    client_secret: str,
) -> str:
    import hmac as _hmac
    minified_body = json.dumps(request_body, separators=(",", ":"), ensure_ascii=False)
    body_hash = hashlib.sha256(minified_body.encode()).hexdigest().lower()
    string_to_sign = f"{http_method.upper()}:{endpoint}:{access_token}:{body_hash}:{timestamp}"
    sig = _hmac.new(client_secret.encode(), string_to_sign.encode(), hashlib.sha512).digest()
    return base64.b64encode(sig).decode()


async def get_token_b2b(
    base_url: str,
    client_id: str,
    private_key_pem: str,
) -> str:
    timestamp = _now_wib()
    signature = _asymmetric_signature(client_id, private_key_pem, timestamp)

    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-KEY": client_id,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": signature,
    }
    body = {"grantType": "client_credentials"}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{base_url}/authorization/v1/access-token/b2b",
            json=body,
            headers=headers,
        )

    raw = resp.json()
    logger.error(f"[DOKU:token] status={resp.status_code} response={raw}")

    if resp.status_code != 200 or not raw.get("accessToken"):
        raise RuntimeError(
            f"DOKU get_token_b2b gagal: {raw.get('responseMessage')} "
            f"(responseCode={raw.get('responseCode')}, HTTP {resp.status_code})"
        )
    return raw["accessToken"]


async def create_qris(
    base_url: str,
    client_id: str,
    private_key_pem: str,
    client_secret: str,
    *,
    order_id: str,
    amount: int,
    merchant_id: str,
    terminal_id: str,
    partner_id: Optional[str] = None,
    description: str = "",
    customer_name: str = "",
    customer_email: str = "",
    callback_url: str = "",
    expired_time: int = 30,
    postal_code: str = "10110",
) -> Dict[str, Any]:
    access_token = await get_token_b2b(base_url, client_id, private_key_pem)

    # X-PARTNER-ID: pakai partner_id (qris_client_id=75143) kalau ada,
    # fallback ke client_id (BRN-...) kalau tidak
    x_partner_id = partner_id or client_id

    endpoint  = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate"
    timestamp = _now_wib()

    validity_dt     = datetime.now(_WIB) + timedelta(minutes=expired_time)
    validity_period = validity_dt.strftime("%Y-%m-%dT%H:%M:%S+07:00")
    amount_str      = f"{int(amount)}.00"

    import time as _time
    external_id = str(int(_time.time() * 1000))

    body: Dict[str, Any] = {
        "partnerReferenceNo": order_id,
        "amount": {
            "value": amount_str,
            "currency": "IDR",
        },
        "merchantId": merchant_id,
        "terminalId": terminal_id,
        "validityPeriod": validity_period,
        "additionalInfo": {
            "postalCode": postal_code,
            "feeType": "1",
        },
    }

    sym_sig = _symmetric_signature("POST", endpoint, access_token, body, timestamp, client_secret)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-PARTNER-ID": x_partner_id,
        "X-EXTERNAL-ID": external_id,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": sym_sig,
        "CHANNEL-ID": "H2H",
    }

    logger.error(
        f"[DOKU:qris:REQUEST] endpoint={endpoint} "
        f"X-PARTNER-ID={x_partner_id} merchantId={merchant_id} "
        f"terminalId={terminal_id} amount={amount_str} orderId={order_id} "
        f"X-EXTERNAL-ID={external_id} X-TIMESTAMP={timestamp} "
        f"body={json.dumps(body, ensure_ascii=False)}"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{base_url}{endpoint}", json=body, headers=headers)

    try:
        raw = resp.json()
    except Exception:
        raw = {"_raw_text": resp.text}

    logger.error(
        f"[DOKU:qris:RESPONSE] status={resp.status_code} "
        f"responseCode={raw.get('responseCode')} "
        f"responseMessage={raw.get('responseMessage')} "
        f"full={json.dumps(raw, ensure_ascii=False)}"
    )

    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"DOKU create_qris gagal: {raw.get('responseMessage')} "
            f"(responseCode={raw.get('responseCode')}, HTTP {resp.status_code})"
        )

    qris_string = raw.get("qrContent") or raw.get("additionalInfo", {}).get("qrContent")

    return {
        "qris_string": qris_string,
        "reference_no": raw.get("referenceNo") or raw.get("partnerReferenceNo"),
        "expired_time": expired_time,
        "raw": raw,
    }
