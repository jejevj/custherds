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
    Buat Xendit Invoice untuk pembayaran tagihan vendor (PAYG).
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


async def create_disbursement(
    external_id: str,
    bank_code: str,
    account_number: str,
    account_holder_name: str,
    amount: float,
    description: str,
) -> dict:
    """
    Kirim dana otomatis ke rekening guide via Xendit Disbursement.

    Args:
        external_id      : ID unik, format: CUSTHERDS-COMM-{transaction_code}
        bank_code        : Kode bank Xendit, misal "BCA", "BNI", "MANDIRI"
                           (guide.bank_name harus sesuai kode Xendit)
        account_number   : Nomor rekening tujuan
        account_holder_name: Nama pemilik rekening
        amount           : Nominal dalam IDR (tanpa desimal)
        description      : Keterangan transfer

    Returns:
        dict: Response Xendit, berisi id, status (PENDING/COMPLETED/FAILED)

    Raises:
        httpx.HTTPStatusError: jika Xendit mengembalikan error
    """
    payload = {
        "external_id": external_id,
        "bank_code": bank_code.upper(),
        "account_holder_name": account_holder_name,
        "account_number": account_number,
        "description": description,
        "amount": int(amount),  # Xendit disbursement pakai integer IDR
        "currency": "IDR",
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
