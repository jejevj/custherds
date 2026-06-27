import logging
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.transaction import Transaction
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.services.xendit import create_disbursement

logger = logging.getLogger(__name__)
router = APIRouter()


def _verify_xendit_token(x_callback_token: str):
    """Verifikasi Xendit callback token."""
    if not settings.XENDIT_WEBHOOK_TOKEN:
        logger.warning("XENDIT_WEBHOOK_TOKEN belum diset, skip verifikasi")
        return
    if x_callback_token != settings.XENDIT_WEBHOOK_TOKEN:
        raise HTTPException(status_code=401, detail="Xendit callback token tidak valid")


async def _disburse_guide_commission(tx: Transaction, db: Session) -> None:
    """
    Kirim komisi guide ke rekening via Xendit Disbursement.
    Dipanggil setelah transaksi settled (baik deposit maupun PAYG).

    Flow:
      1. Cek guide punya data bank lengkap
      2. Buat disbursement ke Xendit
      3. Catat xendit_disbursement_id ke transaction
      4. Jika guide tidak punya data bank → skip (komisi tetap di wallet_balance)
    """
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if not guide:
        logger.warning(f"[Disbursement] Guide tidak ditemukan untuk tx {tx.transaction_code}")
        return

    # Cek kelengkapan data bank guide
    if not all([guide.bank_name, guide.bank_account_number, guide.bank_account_name]):
        logger.info(
            f"[Disbursement] Guide {guide.id} belum lengkap data bank — "
            f"komisi Rp {tx.guide_commission} tetap di wallet_balance"
        )
        return

    external_id = f"CUSTHERDS-COMM-{tx.transaction_code}"
    description = (
        f"Komisi Guide | Booking {tx.booking_id} | "
        f"Transaksi {tx.transaction_code}"
    )

    try:
        result = await create_disbursement(
            external_id=external_id,
            bank_code=guide.bank_name,          # guide.bank_name harus berisi kode bank Xendit, misal "BCA"
            account_number=guide.bank_account_number,
            account_holder_name=guide.bank_account_name,
            amount=float(tx.guide_commission),
            description=description,
        )
        xendit_disb_id = result.get("id", "")
        logger.info(
            f"[Disbursement] Berhasil dibuat untuk guide {guide.id} "
            f"| amount={tx.guide_commission} | xendit_id={xendit_disb_id}"
        )
        # Simpan ID disbursement ke transaksi untuk audit trail
        tx.xendit_disbursement_id = xendit_disb_id
    except Exception as e:
        # Jangan gagalkan transaksi hanya karena disbursement error
        # Komisi tetap ada di wallet_balance, bisa retry manual
        logger.error(
            f"[Disbursement] GAGAL untuk guide {guide.id} | "
            f"tx={tx.transaction_code} | error={str(e)}"
        )


@router.post(
    "/xendit/invoice-paid",
    summary="[Webhook] Xendit — Invoice Paid Callback",
    description="""
Endpoint ini dipanggil otomatis oleh Xendit setelah vendor menyelesaikan pembayaran invoice.

**Cara setup di Xendit Dashboard:**
1. Login ke [dashboard.xendit.co](https://dashboard.xendit.co)
2. Settings → Webhooks
3. Tambahkan URL: `https://api.custherds.ourtestcloud.my.id/api/v1/webhooks/xendit/invoice-paid`
4. Pilih event: **Invoice Paid**
5. Copy Webhook Token → isi ke `.env` sebagai `XENDIT_WEBHOOK_TOKEN`
    """,
    tags=["Webhooks"],
)
async def xendit_invoice_paid(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    _verify_xendit_token(x_callback_token)

    body = await request.json()
    logger.info(f"[Webhook] Invoice Paid received: {body.get('id')} status={body.get('status')}")

    if body.get("status") != "PAID":
        return {"message": "Status bukan PAID, diabaikan"}

    external_id: str = body.get("external_id", "")
    xendit_invoice_id: str = body.get("id", "")

    if not external_id.startswith("CUSTHERDS-TX-"):
        logger.warning(f"[Webhook] external_id tidak dikenali: {external_id}")
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        logger.error(f"[Webhook] Transaction tidak ditemukan: {tx_code}")
        raise HTTPException(404, "Transaction tidak ditemukan")

    if tx.status == "settled":
        return {"message": "Transaksi sudah settled sebelumnya, skip"}

    if tx.status != "payment_pending":
        logger.warning(f"[Webhook] Status tidak expected: {tx.status}")
        return {"message": f"Status tidak bisa diproses: {tx.status}"}

    now = datetime.now(timezone.utc)

    # ── 1. Settle transaksi ────────────────────────────────────────────────
    tx.status         = "settled"
    tx.paid_at        = now
    tx.settled_at     = now
    tx.xendit_invoice_id = xendit_invoice_id

    # ── 2. Kredit wallet guide ─────────────────────────────────────────────
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        guide.wallet_balance  += tx.guide_commission
        guide.total_earnings  += tx.guide_commission
        logger.info(f"[Webhook] Guide {guide.id} wallet +{tx.guide_commission}")

    # ── 3. Selesaikan booking ──────────────────────────────────────────────
    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status       = "completed"
        booking.completed_at = now
        logger.info(f"[Webhook] Booking {booking.booking_code} → completed (PAYG)")

    db.commit()
    db.refresh(tx)

    # ── 4. Disbursement komisi ke rekening guide (async, non-blocking) ─────
    await _disburse_guide_commission(tx, db)
    db.commit()  # simpan xendit_disbursement_id jika ada

    logger.info(f"[Webhook] Transaction {tx.transaction_code} fully settled via PAYG")
    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "settled"}


@router.post(
    "/xendit/invoice-expired",
    summary="[Webhook] Xendit — Invoice Expired Callback",
    tags=["Webhooks"],
)
async def xendit_invoice_expired(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    """Jika invoice expired, kembalikan TX ke pending_vendor_approval agar vendor bisa pilih ulang."""
    _verify_xendit_token(x_callback_token)

    body = await request.json()
    if body.get("status") != "EXPIRED":
        return {"message": "Bukan EXPIRED, diabaikan"}

    external_id: str = body.get("external_id", "")
    if not external_id.startswith("CUSTHERDS-TX-"):
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-TX-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx or tx.status != "payment_pending":
        return {"message": "Tidak perlu diproses"}

    tx.status              = "pending_vendor_approval"
    tx.payment_method      = None
    tx.xendit_invoice_id   = None
    tx.xendit_invoice_url  = None
    tx.vendor_reviewed_at  = None
    db.commit()
    logger.info(f"[Webhook] TX {tx.transaction_code} reset ke pending_vendor_approval (expired)")

    return {"message": "OK", "transaction_code": tx.transaction_code, "status": "reset_to_pending"}


@router.post(
    "/xendit/disbursement-completed",
    summary="[Webhook] Xendit — Disbursement Completed/Failed Callback",
    tags=["Webhooks"],
)
async def xendit_disbursement_callback(
    request: Request,
    db: Session = Depends(get_db),
    x_callback_token: str = Header("", alias="x-callback-token"),
) -> Any:
    """
    Callback dari Xendit setelah disbursement komisi guide selesai atau gagal.
    Setup di Xendit Dashboard → Settings → Webhooks → Disbursement Completed.
    URL: https://api.custherds.ourtestcloud.my.id/api/v1/webhooks/xendit/disbursement-completed
    """
    _verify_xendit_token(x_callback_token)

    body = await request.json()
    status      = body.get("status", "")          # COMPLETED / FAILED
    external_id = body.get("external_id", "")     # CUSTHERDS-COMM-{tx_code}
    failure_code = body.get("failure_code", "")

    logger.info(f"[Disbursement CB] external_id={external_id} status={status}")

    if not external_id.startswith("CUSTHERDS-COMM-"):
        return {"message": "external_id tidak dikenali"}

    tx_code = external_id.replace("CUSTHERDS-COMM-", "")
    tx = db.query(Transaction).filter(Transaction.transaction_code == tx_code).first()
    if not tx:
        return {"message": "Transaction tidak ditemukan"}

    if status == "COMPLETED":
        logger.info(f"[Disbursement CB] Komisi guide untuk TX {tx_code} berhasil dikirim")
        # Opsional: update flag disbursement_status di tx jika kolom tersedia

    elif status == "FAILED":
        logger.error(
            f"[Disbursement CB] GAGAL kirim komisi TX {tx_code} "
            f"| failure_code={failure_code} "
            f"— komisi tetap di wallet_balance guide, perlu retry manual"
        )
        # Komisi sudah ada di wallet_balance, tidak perlu rollback
        # Admin bisa trigger manual disbursement dari dashboard Xendit

    return {"message": "OK", "status": status}
