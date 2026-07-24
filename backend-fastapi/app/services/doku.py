"""
DOKU SNAP Service
"""
from __future__ import annotations

import base64
import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

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
    request_body_minified: str,
    timestamp: str,
    client_secret: str,
) -> str:
    import hmac as _hmac
    body_hash = hashlib.sha256(request_body_minified.encode()).hexdigest().lower()
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
    logger.info(f"[DOKU:token] status={resp.status_code} responseCode={raw.get('responseCode')}")

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
    description: str = "",
    customer_name: str = "",
    customer_email: str = "",
    callback_url: str = "",
    expired_time: int = 30,
    postal_code: str = "10110",
    settlement_items: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Generate DOKU SNAP QRIS MPM.

    settlement_items (opsional): list of settlement split yang akan dimasukkan ke
    additionalInfo.settlement. Setiap item:
        {
            "bank_account_settlement_id": str,
            "value": str,   # exact IDR amount (FIX) atau percentage string (PERCENTAGE)
            "type": "FIX" | "PERCENTAGE"
        }
    Jika disediakan, additionalInfo.hold_settlement akan di-set True secara otomatis.
    """
    access_token = await get_token_b2b(base_url, client_id, private_key_pem)

    endpoint  = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate"
    timestamp = _now_wib()

    validity_dt     = datetime.now(_WIB) + timedelta(minutes=expired_time)
    validity_period = validity_dt.strftime("%Y-%m-%dT%H:%M:%S+07:00")
    amount_str      = f"{int(amount)}.00"

    import time as _time
    external_id = str(int(_time.time() * 1000))

    additional_info: Dict[str, Any] = {
        "postalCode": postal_code,
        "feeType": "1",
    }

    if settlement_items:
        additional_info["hold_settlement"] = True
        additional_info["settlement"] = settlement_items

    body: Dict[str, Any] = {
        "partnerReferenceNo": order_id,
        "amount": {
            "value": amount_str,
            "currency": "IDR",
        },
        "merchantId": merchant_id,
        "terminalId": terminal_id,
        "validityPeriod": validity_period,
        "additionalInfo": additional_info,
    }

    body_minified = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
    sym_sig = _symmetric_signature("POST", endpoint, access_token, body_minified, timestamp, client_secret)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
        "X-PARTNER-ID": client_id,
        "X-EXTERNAL-ID": external_id,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": sym_sig,
        "CHANNEL-ID": "H2H",
    }

    logger.info(
        f"[DOKU:qris:REQUEST] endpoint={endpoint} "
        f"X-PARTNER-ID={client_id} merchantId={merchant_id} "
        f"terminalId={terminal_id} amount={amount_str} orderId={order_id} "
        f"X-EXTERNAL-ID={external_id} X-TIMESTAMP={timestamp} "
        f"settlement_items={json.dumps(settlement_items, ensure_ascii=False) if settlement_items else 'none'} "
        f"body={body_minified}"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{base_url}{endpoint}",
            content=body_minified.encode("utf-8"),
            headers=headers,
        )

    try:
        raw = resp.json()
    except Exception:
        raw = {"_raw_text": resp.text}

    logger.info(
        f"[DOKU:qris:RESPONSE] HTTP={resp.status_code} "
        f"responseCode={raw.get('responseCode')} "
        f"responseMessage={raw.get('responseMessage')} "
        f"referenceNo={raw.get('referenceNo')} "
        f"partnerReferenceNo={raw.get('partnerReferenceNo')} "
        f"full={json.dumps(raw, ensure_ascii=False)}"
    )

    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"DOKU create_qris gagal: {raw.get('responseMessage')} "
            f"(responseCode={raw.get('responseCode')}, HTTP {resp.status_code})"
        )

    qris_string = raw.get("qrContent") or raw.get("additionalInfo", {}).get("qrContent")

    doku_reference_no    = raw.get("referenceNo", "")
    partner_reference_no = raw.get("partnerReferenceNo") or order_id

    return {
        "qris_string":          qris_string,
        "reference_no":         doku_reference_no or partner_reference_no,
        "doku_reference_no":    doku_reference_no,
        "partner_reference_no": partner_reference_no,
        "expired_time":         expired_time,
        "raw":                  raw,
    }
