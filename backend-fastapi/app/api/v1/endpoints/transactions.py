import uuid
from typing import Any, List, Optional
from datetime import datetime, timezone
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.transaction import Transaction
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.models.revenue_split_config import RevenueSplitConfig
from app.models.payment_gateway_config import PaymentGatewayConfig
from app.schemas.transactions import (
    TransactionCreate, TransactionResponse,
    TransactionVendorApprove, TransactionVendorReject,
    TransactionInvoiceResponse,
)
from app.services.xendit import create_disbursement
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

TX_MAX_ATTEMPT = 3

# Provider DOKU (production + sandbox)
DOKU_PROVIDERS = {"doku", "doku_sandbox"}

# Developer/owner platform bank account settlement ID (hardcoded — 5% dari platform_fee)
DEV_BANK_SETTLEMENT_ID = "BNK-0368-1784799585862"

# Platform share: dari platform_fee, 5% untuk developer, sisanya 95% untuk operasional platform
DEV_SHARE_PERCENT = Decimal("0.05")

# ── MDR QRIS (Opsi C) ──────────────────────────────────────────────────────
# MDR 0.7% ditanggung vendor: tagihan di-gross-up sehingga setelah DOKU
# memotong MDR, net yang didistribusikan ke settlement items = tagihan asli.
# Referensi: BI QRIS MDR standar merchant reguler = 0.7%
QRIS_MDR_RATE = Decimal("0.007")


def _fmt_rp(amount: Decimal) -> str:
    return f"Rp {int(amount):,}".replace(",", ".")


def _generate_tx_code(db: Session) -> str:
    import random, string
    while True:
        code = "TX" + "".join(random.choices(string.digits, k=10))
        if not db.query(Transaction).filter(Transaction.transaction_code == code).first():
            return code


def _get_active_split(db: Session) -> RevenueSplitConfig:
    config = db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).first()  # noqa
    if not config:
        raise HTTPException(500, "Konfigurasi split revenue tidak ditemukan")
    return config


def _get_active_gateway(db: Session) -> Optional[PaymentGatewayConfig]:
    return db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.is_active == True).first()  # noqa


def _get_doku_base_url(gateway: PaymentGatewayConfig) -> str:
    if gateway.provider == "doku_sandbox":
        return "https://api-sandbox.doku.com"
    return "https://api.doku.com" if gateway.is_production else "https://api-sandbox.doku.com"


def _gross_up_mdr(tagihan_net: Decimal) -> tuple[Decimal, Decimal]:
    """
    Gross-up tagihan agar setelah DOKU potong MDR 0.7%, net yang
    diterima = tagihan_net (nilai split asli).

    Formula:  tagihan_gross = tagihan_net / (1 - QRIS_MDR_RATE)
    Dibulatkan ke atas ke satuan rupiah (ROUND_HALF_UP).

    Returns:
        tagihan_gross : nominal yang di-scan vendor (lebih besar)
        mdr_amount    : estimasi potongan MDR oleh DOKU

    Contoh: tagihan_net = 75.000
        → tagihan_gross = 75.529  (75.000 / 0.993, ROUND_HALF_UP)
        → mdr_amount    =    529  (75.529 × 0.007)
        → net diterima  = 75.000  ✓
    """
    tagihan_gross = (tagihan_net / (1 - QRIS_MDR_RATE)).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP
    )
    mdr_amount = (tagihan_gross * QRIS_MDR_RATE).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP
    )
    return tagihan_gross, mdr_amount


async def _disburse_guide_commission(tx: Transaction, db: Session) -> None:
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if not guide:
        return
    if not all([guide.bank_name, guide.bank_account_number, guide.bank_account_name]):
        logger.info(f"[Disbursement] Guide {guide.id} belum lengkap data bank — komisi tetap di wallet_balance")
        return
    external_id = f"CUSTHERDS-COMM-{tx.transaction_code}"
    description = f"Komisi Guide | Booking {tx.booking_id} | Transaksi {tx.transaction_code}"
    try:
        result = await create_disbursement(
            external_id=external_id,
            bank_code=guide.bank_name,
            account_number=guide.bank_account_number,
            account_holder_name=guide.bank_account_name,
            amount=float(tx.guide_commission),
            description=description,
        )
        tx.xendit_disbursement_id = result.get("id", "")
        logger.info(f"[Disbursement] Berhasil | guide={guide.id} | amount={tx.guide_commission}")
    except Exception as e:
        logger.error(f"[Disbursement] GAGAL | guide={guide.id} | tx={tx.transaction_code} | error={str(e)}")


def _build_settlement_items(tx: Transaction, guide: Optional[Guide]) -> list:
    """
    Susun 3 settlement items untuk DOKU QRIS — menggunakan nilai NET
    (sebelum gross-up MDR). DOKU mendistribusikan net ini setelah
    memotong MDR dari tagihan_gross yang di-scan vendor.

    Distribusi platform_fee:
      1. Developer  (5%)  → DEV_BANK_SETTLEMENT_ID
      2. Platform   (95%) → DEV_BANK_SETTLEMENT_ID
      3. Guide commission → guide.bank_settlement_id

    Raises HTTPException 422 jika guide belum memiliki bank_settlement_id.
    """
    if not guide:
        logger.error("[Settlement] Guide tidak ditemukan untuk transaksi ini.")
        raise HTTPException(
            422,
            "Guide tidak ditemukan. Tidak dapat memproses settlement QRIS."
        )

    if not guide.bank_settlement_id:
        logger.error(
            f"[Settlement] Guide {guide.id} belum memiliki bank_settlement_id. "
            "QRIS tidak dapat di-generate."
        )
        raise HTTPException(
            422,
            "Status bank guide belum terdaftar untuk settlement. "
            "Pembayaran QRIS tidak dapat diproses. "
            "Silakan konfirmasi ke Admin untuk pengecekan status distribusi rekening guide."
        )

    platform_fee = Decimal(str(tx.platform_fee))
    guide_comm   = Decimal(str(tx.guide_commission))

    # 5% dari platform_fee → developer (dibulatkan ke bawah ke satuan rupiah)
    dev_share      = (platform_fee * DEV_SHARE_PERCENT).quantize(Decimal("1"), rounding=ROUND_DOWN)
    # Sisa 95% → platform operasional
    platform_share = platform_fee - dev_share

    items = [
        {
            "bank_account_settlement_id": DEV_BANK_SETTLEMENT_ID,
            "value": str(int(dev_share)),
            "type": "FIX",
        },
        {
            "bank_account_settlement_id": DEV_BANK_SETTLEMENT_ID,
            "value": str(int(platform_share)),
            "type": "FIX",
        },
        {
            "bank_account_settlement_id": guide.bank_settlement_id,
            "value": str(int(guide_comm)),
            "type": "FIX",
        },
    ]

    logger.info(
        f"[Settlement] TX={tx.transaction_code} "
        f"platform_fee={platform_fee} dev_share={dev_share} platform_share={platform_share} "
        f"guide_comm={guide_comm} guide_bank_settlement_id={guide.bank_settlement_id}"
    )

    return items


async def _create_doku_qris(tx: Transaction, tagihan_net: Decimal, db: Session) -> dict:
    """
    Generate DOKU QRIS untuk TX.

    Opsi C — MDR ditanggung vendor:
      - tagihan_net  : nilai split asli (guide_commission + platform_fee)
                       → dipakai sebagai settlement items (net)
      - tagihan_gross: tagihan_net di-gross-up MDR 0.7%
                       → nominal QR yang di-scan vendor
      Setelah vendor scan & bayar tagihan_gross, DOKU potong MDR lalu
      mendistribusikan tagihan_net ke settlement items secara otomatis.

    Return dict: qris_string, doku_ref, partner_ref, tagihan_gross, mdr_amount
    """
    gateway = _get_active_gateway(db)
    if not gateway:
        raise HTTPException(503, "Tidak ada payment gateway aktif. Hubungi admin.")

    if gateway.provider not in DOKU_PROVIDERS:
        raise HTTPException(503, f"Gateway aktif ({gateway.provider}) bukan DOKU. Fitur QRIS hanya tersedia untuk DOKU.")

    creds: dict   = gateway.credentials or {}
    base_url      = _get_doku_base_url(gateway)
    client_id     = creds.get("client_id", "")
    private_key   = creds.get("private_key", "")
    client_secret = creds.get("secret_key") or creds.get("client_secret", "")
    merchant_id   = creds.get("qris_merchant_id") or creds.get("merchant_id")
    terminal_id   = creds.get("qris_terminal_id") or creds.get("terminal_id") or "A01"

    logger.info(f"[DOKU QRIS] provider={gateway.provider} base_url={base_url}")

    if not client_id or not private_key:
        raise HTTPException(503, "Konfigurasi DOKU belum lengkap (client_id / private_key).")
    if not client_secret:
        raise HTTPException(503, "Konfigurasi DOKU belum lengkap (secret_key).")
    if not merchant_id:
        raise HTTPException(503, "Konfigurasi DOKU belum lengkap: 'qris_merchant_id' tidak ditemukan.")

    # ── Gross-up MDR 0.7% (Opsi C) ──────────────────────────────────────
    tagihan_gross, mdr_amount = _gross_up_mdr(tagihan_net)
    logger.info(
        f"[MDR Gross-up] TX={tx.transaction_code} "
        f"tagihan_net={tagihan_net} mdr={mdr_amount} tagihan_gross={tagihan_gross} "
        f"(MDR 0.7% ditanggung vendor)"
    )

    ts       = int(datetime.now(timezone.utc).timestamp())
    order_id = f"CST-{tx.transaction_code}-{ts}"

    # Ambil guide & validasi bank_settlement_id — akan raise 422 jika belum diset
    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    # Settlement items menggunakan nilai NET — DOKU distribusi net setelah potong MDR
    settlement_items = _build_settlement_items(tx, guide)

    try:
        from app.services.doku import create_qris
        doku_result = await create_qris(
            base_url=base_url,
            client_id=client_id,
            private_key_pem=private_key,
            client_secret=client_secret,
            order_id=order_id,
            amount=int(tagihan_gross),      # ← gross (yang di-scan vendor)
            merchant_id=merchant_id,
            terminal_id=terminal_id,
            expired_time=30,
            settlement_items=settlement_items,  # ← net values
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DOKU QRIS] Gagal buat QRIS untuk TX {tx.transaction_code}: {e}")
        raise HTTPException(502, f"Gagal membuat QRIS DOKU: {str(e)}")

    doku_ref    = doku_result.get("doku_reference_no") or doku_result.get("reference_no", "")
    partner_ref = doku_result.get("partner_reference_no") or order_id
    qris_string = doku_result.get("qris_string") or ""

    logger.info(
        f"[DOKU QRIS] TX={tx.transaction_code} "
        f"doku_referenceNo={doku_ref} "
        f"partnerReferenceNo={partner_ref} "
        f"qris_string_len={len(qris_string)}"
    )

    return {
        "qris_string":    qris_string,
        "doku_ref":       doku_ref or partner_ref,
        "partner_ref":    partner_ref,
        "tagihan_gross":  tagihan_gross,
        "mdr_amount":     mdr_amount,
    }


@router.post("", response_model=TransactionResponse, status_code=201, summary="Guide submit nota transaksi")
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")

    booking = db.query(Booking).filter(Booking.id == payload.booking_id, Booking.guide_id == guide.id).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan")
    if booking.status != "pending_receipt":
        raise HTTPException(400, f"Booking belum siap submit transaksi, status: {booking.status}")

    existing_active_tx = db.query(Transaction).filter(
        Transaction.booking_id == booking.id,
        Transaction.status == "pending_vendor_approval",
    ).first()
    if existing_active_tx:
        raise HTTPException(400, "Sudah ada transaksi aktif menunggu approval vendor.")

    if booking.booking_type == "package" and booking.subtotal_package:
        extra = payload.extra_amount or Decimal("0")
        expected_gross = booking.subtotal_package + extra
        if payload.gross_amount != expected_gross:
            raise HTTPException(
                400,
                f"gross_amount tidak sesuai. Subtotal package: {booking.subtotal_package}, "
                f"extra: {extra}, total seharusnya: {expected_gross}"
            )

    split = _get_active_split(db)
    gross = Decimal(str(payload.gross_amount))
    vendor_amount = (gross * Decimal(str(split.vendor_percent))   / 100).quantize(Decimal("0.01"))
    guide_comm    = (gross * Decimal(str(split.guide_percent))    / 100).quantize(Decimal("0.01"))
    platform_fee  = (gross * Decimal(str(split.platform_percent)) / 100).quantize(Decimal("0.01"))

    tx = Transaction(
        transaction_code=_generate_tx_code(db),
        booking_id=booking.id,
        vendor_id=booking.vendor_id,
        guide_id=guide.id,
        gross_amount=gross,
        extra_amount=payload.extra_amount,
        extra_notes=payload.extra_notes,
        receipt_image=payload.receipt_image,
        receipt_notes=payload.receipt_notes,
        split_config_id=split.id,
        vendor_percent_snapshot=split.vendor_percent,
        guide_percent_snapshot=split.guide_percent,
        platform_percent_snapshot=split.platform_percent,
        vendor_amount=vendor_amount,
        guide_commission=guide_comm,
        platform_fee=platform_fee,
        status="pending_vendor_approval",
    )
    db.add(tx)
    booking.status = "pending_completion"
    booking.receipt_uploaded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("", response_model=List[TransactionResponse], summary="List transaksi saya")
def list_transactions(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.user_type == 1:
        guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
        q = db.query(Transaction).filter(Transaction.guide_id == guide.id) if guide else db.query(Transaction).filter(False)
    elif current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        q = db.query(Transaction).filter(Transaction.vendor_id == vendor.id) if vendor else db.query(Transaction).filter(False)
    else:
        q = db.query(Transaction)
    if status:
        q = q.filter(Transaction.status == status)
    return q.order_by(Transaction.created_at.desc()).all()


@router.get("/by-booking/{booking_id}", response_model=TransactionResponse, summary="Ambil transaksi aktif berdasarkan booking")
def get_transaction_by_booking(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    tx = db.query(Transaction).filter(
        Transaction.booking_id == booking_id,
        Transaction.status.notin_(["rejected"]),
    ).order_by(Transaction.created_at.desc()).first()
    if not tx:
        raise HTTPException(404, "Transaksi aktif tidak ditemukan untuk booking ini")
    return tx


@router.get("/{tx_id}", response_model=TransactionResponse, summary="Detail transaksi")
def get_transaction(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")
    return tx


@router.post("/{tx_id}/approve", response_model=TransactionInvoiceResponse, summary="Vendor approve transaksi")
async def vendor_approve_transaction(
    tx_id: uuid.UUID,
    payload: TransactionVendorApprove,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.vendor_id == vendor.id).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")
    if tx.status != "pending_vendor_approval":
        raise HTTPException(400, f"Transaksi tidak bisa diproses, status saat ini: {tx.status}")

    # tagihan_net = nilai split asli yang harus diterima guide + platform
    tagihan_net = Decimal(str(tx.guide_commission)) + Decimal(str(tx.platform_fee))

    # ── DEPOSIT ────────────────────────────────────────────────────────────
    # Deposit tidak kena MDR — vendor bayar tagihan_net langsung dari saldo
    if payload.payment_method == "deposit":
        if vendor.deposit_balance < tagihan_net:
            raise HTTPException(
                400,
                f"Saldo deposit tidak cukup. "
                f"Saldo: {_fmt_rp(vendor.deposit_balance)}, "
                f"Tagihan (Komisi Guide + Fee Platform): {_fmt_rp(tagihan_net)}"
            )
        vendor.deposit_balance -= tagihan_net
        tx.status              = "settled"
        tx.payment_method      = "deposit"
        tx.paid_at             = datetime.now(timezone.utc)
        tx.settled_at          = datetime.now(timezone.utc)
        tx.vendor_reviewed_at  = datetime.now(timezone.utc)

        guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
        if guide:
            guide.wallet_balance  += tx.guide_commission
            guide.total_earnings  += tx.guide_commission

        booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
        if booking:
            booking.status       = "completed"
            booking.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(tx)
        await _disburse_guide_commission(tx, db)
        db.commit()

        return TransactionInvoiceResponse(
            transaction=tx,
            payment_method="deposit",
            invoice_url=None,
            xendit_invoice_id=None,
            qris_string=None,
            doku_reference_no=None,
            tagihan_gross=None,
            mdr_amount=None,
            message="Pembayaran via deposit berhasil. Komisi guide sedang diproses ke rekening.",
        )

    # ── PAY AS YOU GO — DOKU SNAP QRIS (Opsi C: MDR ditanggung vendor) ───
    elif payload.payment_method == "pay_as_you_go":
        qris = await _create_doku_qris(tx, tagihan_net, db)

        tx.status             = "payment_pending"
        tx.payment_method     = "pay_as_you_go"
        tx.vendor_reviewed_at = datetime.now(timezone.utc)
        tx.xendit_invoice_url = qris["qris_string"]
        tx.xendit_invoice_id  = qris["doku_ref"]

        db.commit()
        db.refresh(tx)

        tagihan_gross = qris["tagihan_gross"]
        mdr_amount    = qris["mdr_amount"]

        return TransactionInvoiceResponse(
            transaction=tx,
            payment_method="pay_as_you_go",
            invoice_url=None,
            xendit_invoice_id=qris["doku_ref"],
            qris_string=qris["qris_string"],
            doku_reference_no=qris["doku_ref"],
            tagihan_gross=tagihan_gross,
            mdr_amount=mdr_amount,
            message=(
                f"QRIS DOKU berhasil dibuat. "
                f"Nominal scan: {_fmt_rp(tagihan_gross)} "
                f"(termasuk MDR QRIS {_fmt_rp(mdr_amount)}). "
                f"Silakan scan QR untuk menyelesaikan pembayaran."
            ),
        )

    else:
        raise HTTPException(400, "payment_method harus 'deposit' atau 'pay_as_you_go'")


@router.post("/{tx_id}/retry-payment", response_model=TransactionInvoiceResponse, summary="Vendor retry QRIS setelah expired/gagal")
async def retry_payment(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    """
    Generate ulang QRIS untuk TX yang statusnya payment_failed atau payment_pending
    (QRIS lama expired). Reset ke payment_pending dengan QRIS baru.
    MDR gross-up tetap diterapkan (Opsi C).
    """
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(404, "Vendor tidak ditemukan")

    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.vendor_id == vendor.id,
    ).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")

    if tx.status not in ("payment_failed", "payment_pending"):
        raise HTTPException(
            400,
            f"Retry hanya bisa untuk TX payment_failed atau payment_pending. "
            f"Status saat ini: {tx.status}"
        )

    tagihan_net = Decimal(str(tx.guide_commission)) + Decimal(str(tx.platform_fee))
    qris = await _create_doku_qris(tx, tagihan_net, db)

    tx.status             = "payment_pending"
    tx.xendit_invoice_url = qris["qris_string"]
    tx.xendit_invoice_id  = qris["doku_ref"]

    db.commit()
    db.refresh(tx)

    logger.info(f"[RetryPayment] TX {tx.transaction_code} QRIS baru dibuat oleh vendor {vendor.id}")

    tagihan_gross = qris["tagihan_gross"]
    mdr_amount    = qris["mdr_amount"]

    return TransactionInvoiceResponse(
        transaction=tx,
        payment_method="pay_as_you_go",
        invoice_url=None,
        xendit_invoice_id=qris["doku_ref"],
        qris_string=qris["qris_string"],
        doku_reference_no=qris["doku_ref"],
        tagihan_gross=tagihan_gross,
        mdr_amount=mdr_amount,
        message=(
            f"QRIS baru berhasil dibuat. "
            f"Nominal scan: {_fmt_rp(tagihan_gross)} "
            f"(termasuk MDR QRIS {_fmt_rp(mdr_amount)}). "
            f"Silakan scan ulang untuk menyelesaikan pembayaran."
        ),
    )


@router.post("/{tx_id}/reject", response_model=TransactionResponse, summary="Vendor reject transaksi")
def vendor_reject_transaction(
    tx_id: uuid.UUID,
    payload: TransactionVendorReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.vendor_id == vendor.id).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")
    if tx.status != "pending_vendor_approval":
        raise HTTPException(400, f"Status tidak bisa diproses: {tx.status}")

    tx.status = "rejected"
    tx.vendor_rejection_reason = payload.reason
    tx.vendor_reviewed_at = datetime.now(timezone.utc)

    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.tx_attempt = (booking.tx_attempt or 0) + 1
        if booking.tx_attempt >= TX_MAX_ATTEMPT:
            booking.status = "rejected"
            booking.vendor_rejection_reason = (
                f"Transaksi ditolak {TX_MAX_ATTEMPT}x oleh vendor. "
                f"Alasan terakhir: {payload.reason}"
            )
        else:
            booking.status = "pending_receipt"

    db.commit()
    db.refresh(tx)
    return tx


@router.get("/{tx_id}/invoice-url", response_model=TransactionInvoiceResponse, summary="Ambil ulang QRIS / link pembayaran")
def get_invoice_url(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.vendor_id == vendor.id).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")
    if tx.status != "payment_pending":
        raise HTTPException(400, f"Tidak ada pembayaran aktif untuk transaksi ini. Status: {tx.status}")

    # Recalculate gross untuk ditampilkan ulang
    tagihan_net = Decimal(str(tx.guide_commission)) + Decimal(str(tx.platform_fee))
    tagihan_gross, mdr_amount = _gross_up_mdr(tagihan_net)

    return TransactionInvoiceResponse(
        transaction=tx,
        payment_method=tx.payment_method,
        invoice_url=None,
        xendit_invoice_id=tx.xendit_invoice_id,
        qris_string=tx.xendit_invoice_url,
        doku_reference_no=tx.xendit_invoice_id,
        tagihan_gross=tagihan_gross,
        mdr_amount=mdr_amount,
        message="QRIS aktif.",
    )


@router.post(
    "/{tx_id}/manual-settle",
    response_model=TransactionResponse,
    summary="[Admin] Force-settle TX yang sudah paid di DOKU tapi stuck di DB",
)
async def manual_settle_transaction(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(0)),
) -> Any:
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")
    if tx.status == "settled":
        return tx
    if tx.status not in ("payment_pending", "payment_failed"):
        raise HTTPException(
            400,
            f"Hanya bisa settle TX dengan status payment_pending/payment_failed. "
            f"Status saat ini: {tx.status}"
        )

    now = datetime.now(timezone.utc)
    tx.status     = "settled"
    tx.paid_at    = tx.paid_at or now
    tx.settled_at = now

    guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
    if guide:
        commission           = Decimal(str(tx.guide_commission))
        guide.wallet_balance = (guide.wallet_balance or Decimal(0)) + commission
        guide.total_earnings = (guide.total_earnings or Decimal(0)) + commission

    booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
    if booking:
        booking.status       = "completed"
        booking.completed_at = now

    db.commit()
    db.refresh(tx)
    logger.info(f"[ManualSettle] TX {tx.transaction_code} di-settle oleh admin {current_user.id}")

    await _disburse_guide_commission(tx, db)
    db.commit()

    return tx
