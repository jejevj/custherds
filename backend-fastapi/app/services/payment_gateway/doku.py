import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional

import httpx

from .base import PaymentGatewayBase


class DokuGateway(PaymentGatewayBase):
    """
    DOKU SNAP Payment Gateway.
    Docs: https://github.com/PTNUSASATUINTIARTHA-DOKU/doku-python-library
    Konfigurasi diambil dari PaymentGatewayConfig di database.
    """

    SANDBOX_BASE_URL = "https://api-sandbox.doku.com"
    PRODUCTION_BASE_URL = "https://api.doku.com"

    def __init__(self, config: Dict[str, Any]):
        self.client_id: str = config["client_id"]
        self.secret_key: str = config["secret_key"]
        self.private_key: str = config.get("private_key", "")
        self.public_key: str = config.get("public_key", "")
        self.is_production: bool = config.get("is_production", False)
        self.base_url = self.PRODUCTION_BASE_URL if self.is_production else self.SANDBOX_BASE_URL

    def _build_headers(self, endpoint: str, body: Dict) -> Dict[str, str]:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S+07:00")
        body_str = json.dumps(body, separators=(",", ":"))
        body_hash = hashlib.sha256(body_str.encode()).hexdigest()
        string_to_sign = f"{self.client_id}|{timestamp}"
        signature = hmac.new(self.secret_key.encode(), string_to_sign.encode(), hashlib.sha512).hexdigest()
        return {
            "Content-Type": "application/json",
            "Client-Id": self.client_id,
            "Request-Id": f"req-{int(time.time())}",
            "Request-Timestamp": timestamp,
            "Signature": f"HMACSHA512={signature}",
        }

    async def create_invoice(self, amount: float, order_id: str, customer: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        endpoint = "/checkout/v1/payment"
        body = {
            "order": {
                "invoice_number": order_id,
                "line_items": [{"name": kwargs.get("description", "Payment"), "price": int(amount), "quantity": 1}],
                "amount": int(amount),
                "currency": "IDR",
                "callback_url": kwargs.get("callback_url", ""),
                "auto_redirect": True,
            },
            "payment": {"payment_due_date": kwargs.get("due_date", 60)},
            "customer": {
                "id": customer.get("id", ""),
                "name": customer.get("name", ""),
                "email": customer.get("email", ""),
                "phone": customer.get("phone", ""),
            },
        }
        headers = self._build_headers(endpoint, body)
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}{endpoint}", json=body, headers=headers)
            return response.json()

    async def create_virtual_account(
        self, amount: float, order_id: str, customer: Dict[str, Any], channel: str, **kwargs
    ) -> Dict[str, Any]:
        endpoint = "/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va"
        body = {
            "partnerServiceId": self.client_id[:8],
            "customerNo": customer.get("phone", ""),
            "virtualAccountNo": f"{self.client_id[:8]}{customer.get('phone', '')}",
            "virtualAccountName": customer.get("name", ""),
            "trxId": order_id,
            "totalAmount": {"value": f"{amount:.2f}", "currency": "IDR"},
            "additionalInfo": {"channel": channel, "virtualAccountConfig": {"reusableStatus": False}},
            "virtualAccountTrxType": "C",
            "expiredDate": kwargs.get("expired_date", ""),
        }
        headers = self._build_headers(endpoint, body)
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}{endpoint}", json=body, headers=headers)
            return response.json()

    async def check_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        endpoint = "/orders/v1/status"
        body = {"invoice_number": transaction_id}
        headers = self._build_headers(endpoint, body)
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}{endpoint}", json=body, headers=headers)
            return response.json()

    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        received_signature = headers.get("Signature", "")
        body_str = json.dumps(payload, separators=(",", ":"))
        expected = hmac.new(self.secret_key.encode(), body_str.encode(), hashlib.sha512).hexdigest()
        is_valid = hmac.compare_digest(f"HMACSHA512={expected}", received_signature)
        return {"valid": is_valid, "payload": payload}

    async def refund(self, transaction_id: str, amount: Optional[float] = None, reason: str = "") -> Dict[str, Any]:
        endpoint = "/refunds/v1.0/debit/refund"
        body = {
            "originalPartnerReferenceNo": transaction_id,
            "refundAmount": {"value": f"{amount:.2f}", "currency": "IDR"} if amount else None,
            "reason": reason,
        }
        headers = self._build_headers(endpoint, body)
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}{endpoint}", json=body, headers=headers)
            return response.json()
