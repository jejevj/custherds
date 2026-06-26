import httpx
from typing import Optional
from app.core.config import settings

XENDIT_BASE_URL = "https://api.xendit.co"


async def create_disbursement(
    external_id: str,
    bank_code: str,
    account_holder_name: str,
    account_number: str,
    description: str,
    amount: float,
) -> dict:
    """
    Buat Xendit Disbursement (transfer ke rekening bank guide).
    Mengembalikan full response Xendit termasuk disbursement id & status.
    """
    payload = {
        "external_id": external_id,
        "bank_code": bank_code.upper(),
        "account_holder_name": account_holder_name,
        "account_number": account_number,
        "description": description,
        "amount": float(amount),
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{XENDIT_BASE_URL}/disbursements",
            json=payload,
            auth=(settings.XENDIT_SECRET_KEY, ""),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def get_disbursement(xendit_disbursement_id: str) -> dict:
    """Cek status disbursement dari Xendit."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{XENDIT_BASE_URL}/disbursements/{xendit_disbursement_id}",
            auth=(settings.XENDIT_SECRET_KEY, ""),
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()
