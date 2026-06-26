from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.schemas.vendors import (
    VendorProfile,
    VendorUpdateRequest,
    VendorSubmitRequest,
    VendorDepositInfo,
    VendorPublic,
)

router = APIRouter()


# ─── Vendor self-service ────────────────────────────────────────────────────

@router.get("/me", response_model=VendorProfile, tags=["Vendors"])
def get_vendor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor


@router.put("/me", response_model=VendorProfile, summary="Update vendor profile (save draft)", tags=["Vendors"])
def update_vendor_profile(
    payload: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor.vendor_status not in ("incomplete", "rejected"):
        raise HTTPException(
            status_code=400,
            detail=f"Profile cannot be edited when status is '{vendor.vendor_status}'"
        )
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.post("/me/submit", response_model=VendorProfile, summary="Submit dokumen untuk direview admin", tags=["Vendors"])
def submit_vendor_for_review(
    payload: VendorSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    """
    Vendor mengisi semua data wajib dan submit.
    Status berubah: incomplete/rejected -> pending.
    """
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor.vendor_status == "approved":
        raise HTTPException(status_code=400, detail="Vendor already approved")
    if vendor.vendor_status == "pending":
        raise HTTPException(status_code=400, detail="Already under review")

    for field, value in payload.dict().items():
        setattr(vendor, field, value)

    vendor.vendor_status = "pending"
    vendor.approval_notes = None  # Clear catatan penolakan sebelumnya
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("/me/deposit", response_model=VendorDepositInfo, tags=["Vendors"])
def get_vendor_deposit(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor


# ─── Public browse (for guides) ─────────────────────────────────────────────

@router.get(
    "/browse",
    response_model=List[VendorPublic],
    summary="Browse approved vendors (Guide access)",
    tags=["Vendors – Browse"],
)
def browse_vendors(
    area: Optional[int] = Query(None),
    category: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    q = db.query(Vendor).filter(Vendor.vendor_status == "approved")
    if area is not None:
        q = q.filter(Vendor.vendor_area == area)
    if category is not None:
        q = q.filter(Vendor.vendor_category == category)
    if search:
        q = q.filter(Vendor.vendor_business_name.ilike(f"%{search}%"))
    return q.order_by(Vendor.vendor_business_name).offset(skip).limit(limit).all()
