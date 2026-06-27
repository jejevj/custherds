import uuid
from typing import Any, List
from datetime import datetime, timezone
from decimal import Decimal
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
from app.schemas.transactions import (
    TransactionCreate, TransactionResponse,
    TransactionVendorApprove, TransactionVendorReject,
    TransactionInvoiceResponse,
)
from app.services.xendit import create_invoice
from typing import Optional

router = APIRouter()

TX_MAX_ATTEMPT = 3


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
    """
    Mengembalikan transaksi AKTIF (pending_vendor_approval / payment_pending / settled)
    untuk booking tertentu. Transaksi yang sudah rejected tidak dikembalikan.
    """
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

    # Tagihan ke vendor = Komisi Guide + Fee Platform
    # (vendor sudah menerima 100% gross dari tamu di lapangan,
    #  yang harus dibayarkan ke platform hanya bagian non-vendor)
    tagihan = tx.guide_commission + tx.platform_fee

    if payload.payment_method == "deposit":
        if vendor.deposit_balance < tagihan:
            raise HTTPException(
                400,
                f"Saldo deposit tidak cukup. "
                f"Saldo: {vendor.deposit_balance}, "
                f"Tagihan (Komisi Guide + Fee Platform): {tagihan}"
            )
        vendor.deposit_balance -= tagihan
        tx.status = "settled"
        tx.payment_method = "deposit"
        tx.paid_at = datetime.now(timezone.utc)
        tx.settled_at = datetime.now(timezone.utc)
        tx.vendor_reviewed_at = datetime.now(timezone.utc)
        guide = db.query(Guide).filter(Guide.id == tx.guide_id).first()
        if guide:
            guide.wallet_balance += tx.guide_commission
            guide.total_earnings += tx.guide_commission
        booking = db.query(Booking).filter(Booking.id == tx.booking_id).first()
        if booking:
            booking.status = "completed"
            booking.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(tx)
        return TransactionInvoiceResponse(
            transaction=tx,
            payment_method="deposit",
            invoice_url=None,
            xendit_invoice_id=None,
            message="Pembayaran via deposit berhasil. Transaksi settled.",
        )

    elif payload.payment_method == "pay_as_you_go":
        vendor_user = db.query(User).filter(User.id == vendor.user_id).first()
        external_id = f"CUSTHERDS-TX-{tx.transaction_code}"
        description = (
            f"Tagihan Custherds - Komisi Guide + Fee Platform | "
            f"Transaksi {tx.transaction_code} | Vendor: {vendor.vendor_business_name}"
        )
        try:
            xendit_response = await create_invoice(
                external_id=external_id,
                amount=float(tagihan),   # ✅ hanya komisi guide + fee platform
                payer_email=vendor_user.user_email if vendor_user else "vendor@custherds.com",
                description=description,
            )
        except Exception as e:
            raise HTTPException(502, f"Gagal membuat invoice Xendit: {str(e)}")
        tx.status = "payment_pending"
        tx.payment_method = "pay_as_you_go"
        tx.xendit_invoice_id = xendit_response.get("id")
        tx.xendit_invoice_url = xendit_response.get("invoice_url")
        tx.vendor_reviewed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(tx)
        return TransactionInvoiceResponse(
            transaction=tx,
            payment_method="pay_as_you_go",
            invoice_url=xendit_response.get("invoice_url"),
            xendit_invoice_id=xendit_response.get("id"),
            message="Invoice pembayaran berhasil dibuat. Silakan selesaikan pembayaran melalui link berikut.",
        )
    else:
        raise HTTPException(400, "payment_method harus 'deposit' atau 'pay_as_you_go'")


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


@router.get("/{tx_id}/invoice-url", response_model=TransactionInvoiceResponse, summary="Ambil ulang link pembayaran Xendit")
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
        raise HTTPException(400, f"Tidak ada invoice aktif untuk transaksi ini. Status: {tx.status}")
    return TransactionInvoiceResponse(
        transaction=tx,
        payment_method=tx.payment_method,
        invoice_url=tx.xendit_invoice_url,
        xendit_invoice_id=tx.xendit_invoice_id,
        message="Link pembayaran aktif.",
    )
