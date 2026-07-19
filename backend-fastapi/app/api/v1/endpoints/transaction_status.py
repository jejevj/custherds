"""
Polling endpoint: GET /api/v1/transactions/{tx_id}/payment-status
Digunakan frontend untuk cek status pembayaran QRIS secara periodik.
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.vendor import Vendor

router = APIRouter()


@router.get("/{tx_id}/payment-status", summary="Polling status pembayaran QRIS")
def get_payment_status(
    tx_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mengembalikan status terkini transaksi.
    Frontend polling endpoint ini tiap 5 detik selama QRIS ditampilkan.
    """
    # Vendor hanya bisa cek transaksi miliknya
    if current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(404, "Vendor tidak ditemukan")
        tx = db.query(Transaction).filter(
            Transaction.id == tx_id,
            Transaction.vendor_id == vendor.id,
        ).first()
    else:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()

    if not tx:
        raise HTTPException(404, "Transaksi tidak ditemukan")

    return {
        "tx_id":      str(tx.id),
        "status":     tx.status,
        "paid_at":    tx.paid_at.isoformat() if tx.paid_at else None,
        "settled_at": tx.settled_at.isoformat() if tx.settled_at else None,
        "qris_string": tx.xendit_invoice_url if tx.status == "payment_pending" else None,
    }
