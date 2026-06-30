"""
DOKU SNAP Service
=================
Menyediakan:
  - get_token_b2b()   : ambil access token B2B via SHA256withRSA
  - create_qris()     : buat QRIS payment request SNAP

Ref: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/qris
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict

import httpx
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

logger = logging.getLogger(__name__)

_WIB = timezone(timedelta(hours=7))


def _now_wib() -> str:
    """ISO8601 timestamp WIB: 2024-01-01T12:00:00+07:00"""
    return datetime.now(_WIB).strftime("%Y-%m-%dT%H:%M:%S+07:00")


def _asymmetric_signature(client_id: str, private_key_pem: str, timestamp: str) -> str:
    """
    SHA256withRSA( private_key, client_id + '|' + timestamp ) -> Base64
    Digunakan untuk header X-SIGNATURE pada Get Token B2B.
    """
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
    """
    HMAC-SHA512 symmetric signature untuk request setelah mendapat access token.
    Format: HMAC-SHA512( client_secret,
              uppercase(http_method) + ':' + endpoint + ':' + access_token + ':'
              + lowercase_hex(SHA256(minified_body)) + ':' + timestamp )
    """
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
    """
    POST /authorization/v1/access-token/b2b
    Mengembalikan accessToken (Bearer) untuk digunakan di request berikutnya.
    """
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
    logger.info(f"[DOKU] get_token_b2b status={resp.status_code} body={raw}")

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
    description: str,
    customer_name: str,
    customer_email: str,
    callback_url: str,
    expired_time: int = 30,
) -> Dict[str, Any]:
    """
    Buat QRIS payment via DOKU SNAP.
    Endpoint: POST /checkout/v1/payment
    Channel : QRIS

    Ref: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/qris

    Returns dict:
      - qris_string  : QRIS EMV string untuk di-render jadi QR image
      - reference_no : DOKU reference number
      - expired_time : menit expired
      - raw          : full DOKU response
    """
    access_token = await get_token_b2b(base_url, client_id, private_key_pem)

    endpoint  = "/checkout/v1/payment"
    timestamp = _now_wib()

    # Amount harus string format "50000.00"
    amount_str = f"{amount:.2f}"

    body: Dict[str, Any] = {
        "partnerReferenceNo": order_id,
        "amount": {
            "value": amount_str,
            "currency": "IDR",
        },
        "paymentType": "QRIS",
        "feeType": "OUR",
        "customer": {
            "id": customer_email,
            "name": customer_name,
            "email": customer_email,
        },
        "order": {
            "amount": {
                "value": amount_str,
                "currency": "IDR",
            },
            "description": description[:255],
            "sessionId": order_id,
        },
        "additionalInfo": {
            "channel": "QRIS",
            "origin": {
                "product": "SDK",
                "source": "WEB",
                "system": "SNAP",
                "apiFormat": "SNAP",
            },
            "callbackUrl": callback_url,
            "expiryTime": str(expired_time),
        },
    }

    sym_sig = _symmetric_signature("POST", endpoint, access_token, body, timestamp, client_secret)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-CLIENT-KEY": client_id,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": sym_sig,
        "X-PARTNER-ID": client_id,
        "X-EXTERNAL-ID": order_id[:36],
        "CHANNEL-ID": "DIRECT",
    }

    logger.info(f"[DOKU] create_qris request body={json.dumps(body, ensure_ascii=False)}")

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{base_url}{endpoint}", json=body, headers=headers)

    raw = resp.json()
    logger.info(
        f"[DOKU] create_qris status={resp.status_code} "
        f"responseCode={raw.get('responseCode')} "
        f"responseMessage={raw.get('responseMessage')} "
        f"full_response={raw}"
    )

    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"DOKU create_qris gagal: {raw.get('responseMessage')} "
            f"(responseCode={raw.get('responseCode')}, HTTP {resp.status_code})"
        )

    # DOKU SNAP QRIS response: qrContent atau additionalInfo.qrisValue
    qris_string = (
        raw.get("qrContent")
        or raw.get("qrCode")
        or raw.get("additionalInfo", {}).get("qrisValue")
        or raw.get("additionalInfo", {}).get("qrContent")
        or raw.get("additionalInfo", {}).get("qrString")
    )

    return {
        "qris_string": qris_string,
        "reference_no": raw.get("referenceNo") or raw.get("partnerReferenceNo"),
        "expired_time": expired_time,
        "raw": raw,
    }
