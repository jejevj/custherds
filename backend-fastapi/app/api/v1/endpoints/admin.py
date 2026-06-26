import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.models.transaction import Transaction
from app.models.guide_withdrawal import GuideWithdrawal
from app.models.revenue_split_config import RevenueSplitConfig
from app.schemas.admin import (
    AdminUserList, AdminTransactionList, AdminWithdrawalProcess,
    AdminSplitConfigCreate, AdminSplitConfigResponse,
    AdminWithdrawalResponse,
)
from app.services.xendit_disbursement import create_disbursement
from datetime import datetime, timezone

router = APIRouter()


@router.get("/users", response_model=List[AdminUserList], summary="[Admin] List semua user")
def admin_list_users(
    user_type: Optional[int] = Query(None, description="Filter: 1=Guide, 2=Vendor, 99=Admin"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(User)
    if user_type is not None:
        q = q.filter(User.user_type == user_type)
    return q.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/activate", summary="[Admin] Aktifkan / nonaktifkan user")
def admin_toggle_user(
    user_id: uuid.UUID,
    is_active: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.is_active = is_active
    db.commit()
    return {"message": f"User {'diaktifkan' if is_active else 'dinonaktifkan'}"}


@router.put("/vendors/{vendor_id}/approve", summary="[Admin] Approve / reject vendor")
def admin_approve_vendor(
    vendor_id: uuid.UUID,
    action: str = Query(..., regex="^(approve|reject)$"),
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor tidak ditemukan")
    vendor.vendor_status = "approved" if action == "approve" else "rejected"
    vendor.approval_notes = notes
    db.commit()
    return {"message": f"Vendor {vendor.vendor_status}"}


@router.get("/transactions", response_model=List[AdminTransactionList], summary="[Admin] List semua transaksi")
def admin_list_transactions(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(Transaction)
    if status:
        q = q.filter(Transaction.status == status)
    return q.order_by(Transaction.created_at.desc()).all()


@router.get("/withdrawals", response_model=List[AdminWithdrawalResponse], summary="[Admin] List semua withdrawal guide")
def admin_list_withdrawals(
    status: Optional[str] = Query(None, description="Filter: pending, processing, completed, failed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(GuideWithdrawal)
    if status:
        q = q.filter(GuideWithdrawal.status == status)
    return q.order_by(GuideWithdrawal.created_at.desc()).all()


@router.post(
    "/withdrawals/{withdrawal_id}/disburse",
    summary="[Admin] Kirim dana guide via Xendit Disbursement",
    description="""
Admin memproses withdrawal guide dengan mengirim dana ke rekening bank via Xendit.

**Flow:**
1. Admin klik disburse
2. Sistem panggil Xendit Disbursement API
3. Status withdrawal berubah ke `processing`
4. Xendit kirim callback ke `/payments/webhook/disbursement`
5. Callback auto-update status ke `completed` atau `failed`

**external_id format:** `CUSTHERDS-WD-{withdrawal_id}`
    """,
)
async def admin_disburse_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    w = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id).first()
    if not w:
        raise HTTPException(404, "Withdrawal tidak ditemukan")
    if w.status != "pending":
        raise HTTPException(400, f"Hanya withdrawal berstatus 'pending' yang bisa diproses. Status saat ini: {w.status}")

    external_id = f"CUSTHERDS-WD-{w.id}"
    description = f"Komisi guide Custherds - Withdrawal {w.id}"

    try:
        xendit_response = await create_disbursement(
            external_id=external_id,
            bank_code=w.bank_name,
            account_holder_name=w.bank_account_name,
            account_number=w.bank_account_number,
            description=description,
            amount=float(w.amount),
        )
    except Exception as e:
        raise HTTPException(502, f"Gagal mengirim disbursement ke Xendit: {str(e)}")

    w.status = "processing"
    w.xendit_disbursement_id = xendit_response.get("id")
    w.processed_by = current_user.id
    w.processed_at = datetime.now(timezone.utc)
    w.notes = (w.notes or "") + f" | Xendit disbursement_id: {w.xendit_disbursement_id}"
    db.commit()

    return {
        "message": "Disbursement berhasil dikirim ke Xendit. Menunggu konfirmasi transfer.",
        "withdrawal_id": str(w.id),
        "xendit_disbursement_id": w.xendit_disbursement_id,
        "status": w.status,
        "amount": str(w.amount),
        "bank_code": w.bank_name,
        "account_number": w.bank_account_number,
    }


@router.put("/withdrawals/{withdrawal_id}/process", summary="[Admin] Update status withdrawal secara manual")
def admin_process_withdrawal(
    withdrawal_id: uuid.UUID,
    payload: AdminWithdrawalProcess,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    w = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id).first()
    if not w:
        raise HTTPException(404, "Withdrawal tidak ditemukan")
    if w.status not in ("pending", "processing"):
        raise HTTPException(400, f"Status tidak bisa diproses: {w.status}")
    w.status = payload.status
    w.processed_by = current_user.id
    w.processed_at = datetime.now(timezone.utc)
    w.notes = payload.notes
    if payload.xendit_disbursement_id:
        w.xendit_disbursement_id = payload.xendit_disbursement_id
    db.commit()
    return {"message": f"Withdrawal diupdate ke status: {payload.status}"}


@router.get("/split-config", response_model=List[AdminSplitConfigResponse], summary="[Admin] List konfigurasi split revenue")
def admin_list_split_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    return db.query(RevenueSplitConfig).order_by(RevenueSplitConfig.effective_from.desc()).all()


@router.post("/split-config", response_model=AdminSplitConfigResponse, status_code=201, summary="[Admin] Buat konfigurasi split revenue baru")
def admin_create_split_config(
    payload: AdminSplitConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    if abs(payload.vendor_percent + payload.guide_percent + payload.platform_percent - 100.0) > 0.01:
        raise HTTPException(400, "Total persentase harus 100%")
    db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).update({"is_active": False})  # noqa
    config = RevenueSplitConfig(
        vendor_percent=payload.vendor_percent,
        guide_percent=payload.guide_percent,
        platform_percent=payload.platform_percent,
        is_active=True,
        notes=payload.notes,
        set_by=current_user.id,
        effective_from=datetime.now(timezone.utc),
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config
