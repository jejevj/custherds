import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
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


# ─────────────────────────── USERS ───────────────────────────

@router.get("/users", response_model=List[AdminUserList], summary="[Admin] List all users")
def admin_list_users(
    user_type: Optional[int] = Query(None, description="Filter: 1=Guide, 2=Vendor, 99=Admin"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(User)
    if user_type is not None:
        q = q.filter(User.user_type == user_type)
    return q.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/activate", summary="[Admin] Activate / deactivate user")
def admin_toggle_user(
    user_id: uuid.UUID,
    is_active: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = is_active
    db.commit()
    return {"message": f"User {'activated' if is_active else 'deactivated'}"}


# ─────────────────────────── GUIDES ───────────────────────────

@router.get("/guides", summary="[Admin] List all guides")
def admin_list_guides(
    guide_status: Optional[str] = Query(None, description="Filter: incomplete, pending, approved, rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = (
        db.query(Guide)
        .options(joinedload(Guide.user))
        .join(User, Guide.user_id == User.id)
    )
    if guide_status:
        q = q.filter(Guide.guide_status == guide_status)
    guides = q.order_by(Guide.created_at.desc()).all()
    return [{
        "guide_id": str(g.id),
        "user_id": str(g.user_id),
        "user_name": g.user.user_name,
        "user_email": g.user.user_email,
        "user_phone": g.user.user_phone,
        "is_active": g.user.is_active,
        "guide_nationality": g.guide_nationality,
        "guide_phone": g.guide_phone,
        "guide_id_card_url": g.guide_id_card_url,
        "guide_certificate": g.guide_certificate,
        "guide_certificate_status": g.guide_certificate_status,
        "guide_status": g.guide_status,
        "rejection_notes": g.rejection_notes,
        "bio": g.bio,
        "languages": g.languages,
        "wallet_balance": str(g.wallet_balance),
        "created_at": g.created_at.isoformat(),
    } for g in guides]


@router.put("/guides/{guide_id}/approve", summary="[Admin] Approve or reject a guide")
def admin_approve_guide(
    guide_id: uuid.UUID,
    action: str = Query(..., regex="^(approve|reject)$"),
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(404, "Guide not found")

    if action == "approve":
        guide.guide_status = "approved"
        guide.guide_certificate_status = "approved"
        guide.rejection_notes = None
        user = db.query(User).filter(User.id == guide.user_id).first()
        if user:
            user.is_verified = True
    else:
        guide.guide_status = "rejected"
        guide.guide_certificate_status = "rejected"
        guide.rejection_notes = notes

    db.commit()
    return {
        "message": f"Guide {guide.guide_status}",
        "guide_id": str(guide.id),
        "guide_status": guide.guide_status,
        "guide_certificate_status": guide.guide_certificate_status,
        "notes": notes,
    }


# ─────────────────────────── VENDORS ───────────────────────────

@router.get("/vendors", summary="[Admin] List all vendors")
def admin_list_vendors(
    vendor_status: Optional[str] = Query(None, description="Filter: incomplete, pending, approved, rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = (
        db.query(Vendor)
        .options(joinedload(Vendor.user))
        .join(User, Vendor.user_id == User.id)
    )
    if vendor_status:
        q = q.filter(Vendor.vendor_status == vendor_status)
    vendors = q.order_by(Vendor.created_at.desc()).all()
    return [{
        "vendor_id": str(v.id),
        "user_id": str(v.user_id),
        "user_name": v.user.user_name,
        "user_email": v.user.user_email,
        "user_phone": v.user.user_phone,
        "is_active": v.user.is_active,
        "vendor_business_name": v.vendor_business_name,
        "vendor_category": v.vendor_category,
        "vendor_area": v.vendor_area,
        "vendor_location": v.vendor_location,
        "vendor_short_description": v.vendor_short_description,
        "vendor_status": v.vendor_status,
        "approval_notes": v.approval_notes,
        "deposit_balance": str(v.deposit_balance),
        "created_at": v.created_at.isoformat(),
    } for v in vendors]


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
        raise HTTPException(404, "Vendor not found")

    if action == "approve":
        vendor.vendor_status = "approved"
        vendor.approval_notes = None
        user = db.query(User).filter(User.id == vendor.user_id).first()
        if user:
            user.is_verified = True
    else:
        vendor.vendor_status = "rejected"
        vendor.approval_notes = notes

    db.commit()
    return {
        "message": f"Vendor {vendor.vendor_status}",
        "vendor_id": str(vendor.id),
        "vendor_status": vendor.vendor_status,
        "notes": notes,
    }


# ─────────────────────────── TRANSACTIONS ───────────────────────────

@router.get("/transactions", response_model=List[AdminTransactionList], summary="[Admin] List all transactions")
def admin_list_transactions(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(Transaction)
    if status:
        q = q.filter(Transaction.status == status)
    return q.order_by(Transaction.created_at.desc()).all()


# ─────────────────────────── WITHDRAWALS ───────────────────────────

@router.get("/withdrawals", response_model=List[AdminWithdrawalResponse], summary="[Admin] List all guide withdrawals")
def admin_list_withdrawals(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = db.query(GuideWithdrawal)
    if status:
        q = q.filter(GuideWithdrawal.status == status)
    return q.order_by(GuideWithdrawal.created_at.desc()).all()


@router.post("/withdrawals/{withdrawal_id}/disburse", summary="[Admin] Send guide funds via Xendit Disbursement")
async def admin_disburse_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    w = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id).first()
    if not w:
        raise HTTPException(404, "Withdrawal not found")
    if w.status != "pending":
        raise HTTPException(400, f"Only 'pending' withdrawals can be processed. Current: {w.status}")
    external_id = f"CUSTHERDS-WD-{w.id}"
    try:
        xendit_response = await create_disbursement(
            external_id=external_id,
            bank_code=w.bank_name,
            account_holder_name=w.bank_account_name,
            account_number=w.bank_account_number,
            description=f"Guide commission - Withdrawal {w.id}",
            amount=float(w.amount),
        )
    except Exception as e:
        raise HTTPException(502, f"Xendit error: {str(e)}")
    w.status = "processing"
    w.xendit_disbursement_id = xendit_response.get("id")
    w.processed_by = current_user.id
    w.processed_at = datetime.now(timezone.utc)
    w.notes = (w.notes or "") + f" | Xendit: {w.xendit_disbursement_id}"
    db.commit()
    return {"message": "Disbursement sent.", "xendit_disbursement_id": w.xendit_disbursement_id, "status": w.status}


@router.put("/withdrawals/{withdrawal_id}/process", summary="[Admin] Manually update withdrawal status")
def admin_process_withdrawal(
    withdrawal_id: uuid.UUID,
    payload: AdminWithdrawalProcess,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    w = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id).first()
    if not w:
        raise HTTPException(404, "Withdrawal not found")
    if w.status not in ("pending", "processing"):
        raise HTTPException(400, f"Cannot process withdrawal: {w.status}")
    w.status = payload.status
    w.processed_by = current_user.id
    w.processed_at = datetime.now(timezone.utc)
    w.notes = payload.notes
    if payload.xendit_disbursement_id:
        w.xendit_disbursement_id = payload.xendit_disbursement_id
    db.commit()
    return {"message": f"Withdrawal updated to: {payload.status}"}


# ─────────────────────────── SPLIT CONFIG ───────────────────────────

@router.get("/split-config", response_model=List[AdminSplitConfigResponse], summary="[Admin] List revenue split configs")
def admin_list_split_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    return db.query(RevenueSplitConfig).order_by(RevenueSplitConfig.effective_from.desc()).all()


@router.post("/split-config", response_model=AdminSplitConfigResponse, status_code=201, summary="[Admin] Create new revenue split config")
def admin_create_split_config(
    payload: AdminSplitConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    if abs(payload.vendor_percent + payload.guide_percent + payload.platform_percent - 100.0) > 0.01:
        raise HTTPException(400, "Total percentage must be 100%")
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
