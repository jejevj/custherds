import httpx
from typing import Optional
from app.core.config import settings

XENDIT_BASE_URL = "https://api.xendit.co"


async def create_invoice(
    external_id: str,
    amount: float,
    payer_email: str,
    description: str,
    success_redirect_url: Optional[str] = None,
    failure_redirect_url: Optional[str] = None,
) -> dict:
    """
    Buat Xendit Invoice.
    Mengembalikan full response dari Xendit termasuk invoice_url.
    """
    payload = {
        "external_id": external_id,
        "amount": float(amount),
        "payer_email": payer_email,
        "description": description,
        "currency": "IDR",
        "invoice_duration": 86400,  # 24 jam
        "reminder_time": 1,
    }
    if success_redirect_url:
        payload["success_redirect_url"] = success_redirect_url
    if failure_redirect_url:
        payload["failure_redirect_url"] = failure_redirect_url

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{XENDIT_BASE_URL}/v2/invoices",
            json=payload,
            auth=(settings.XENDIT_SECRET_KEY, ""),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def get_invoice(xendit_invoice_id: str) -> dict:
    """Ambil detail invoice dari Xendit."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{XENDIT_BASE_URL}/v2/invoices/{xendit_invoice_id}",
            auth=(settings.XENDIT_SECRET_KEY, ""),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()
