import base64
import time
from typing import Any, Dict, Optional

import httpx

from .base import PaymentGatewayBase


class XenditGateway(PaymentGatewayBase):
    """
    Xendit Payment Gateway.
    Docs: https://developers.xendit.co
    Konfigurasi diambil dari PaymentGatewayConfig di database.
    """

    BASE_URL = "https://api.xendit.co"

    def __init__(self, config: Dict[str, Any]):
        self.api_key: str = config["api_key"]
        self.webhook_token: str = config.get("webhook_token", "")
        self.is_production: bool = config.get("is_production", False)
        _encoded = base64.b64encode(f"{self.api_key}:".encode()).decode()
        self._auth_header = f"Basic {_encoded}"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": self._auth_header,
            "Content-Type": "application/json",
            "api-version": "2022-07-31",
        }

    async def create_invoice(self, amount: float, order_id: str, customer: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        body = {
            "external_id": order_id,
            "amount": amount,
            "currency": "IDR",
            "customer": {
                "given_names": customer.get("name", ""),
                "email": customer.get("email", ""),
                "mobile_number": customer.get("phone", ""),
            },
            "customer_notification_preference": {"invoice_created": ["email"], "invoice_paid": ["email"]},
            "success_redirect_url": kwargs.get("success_url", ""),
            "failure_redirect_url": kwargs.get("failure_url", ""),
            "invoice_duration": kwargs.get("duration", 86400),
            "description": kwargs.get("description", "Payment"),
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.BASE_URL}/v2/invoices", json=body, headers=self._headers())
            return response.json()

    async def create_virtual_account(
        self, amount: float, order_id: str, customer: Dict[str, Any], channel: str, **kwargs
    ) -> Dict[str, Any]:
        body = {
            "external_id": order_id,
            "bank_code": channel,
            "name": customer.get("name", ""),
            "expected_amount": amount,
            "is_single_use": kwargs.get("is_single_use", True),
            "is_closed": True,
            "expiration_date": kwargs.get("expired_date", ""),
            "virtual_account_number": kwargs.get("va_number", ""),
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.BASE_URL}/callback_virtual_accounts", json=body, headers=self._headers())
            return response.json()

    async def check_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.BASE_URL}/v2/invoices/{transaction_id}", headers=self._headers())
            return response.json()

    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        received_token = headers.get("x-callback-token", "")
        is_valid = received_token == self.webhook_token
        return {"valid": is_valid, "payload": payload}

    async def refund(self, transaction_id: str, amount: Optional[float] = None, reason: str = "") -> Dict[str, Any]:
        body = {
            "invoice_id": transaction_id,
            "reason": reason,
        }
        if amount:
            body["amount"] = amount
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.BASE_URL}/refunds", json=body, headers=self._headers())
            return response.json()
