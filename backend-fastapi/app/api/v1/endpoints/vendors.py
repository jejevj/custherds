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
    VendorDepositInfo,
    VendorPublic,
)

router = APIRouter()


# ─── Vendor self-service ────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=VendorProfile,
    summary="Get logged-in vendor profile",
    tags=["Vendors"],
)
def get_vendor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor


@router.put(
    "/me",
    response_model=VendorProfile,
    summary="Update vendor profile",
    tags=["Vendors"],
)
def update_vendor_profile(
    payload: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get(
    "/me/deposit",
    response_model=VendorDepositInfo,
    summary="Get vendor deposit balance",
    tags=["Vendors"],
)
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
    description=(
        "Returns all **approved** vendors visible to guides. "
        "Optionally filter by `area` (integer area code) and/or `category`. "
        "Requires a valid JWT token — accessible by any authenticated user."
    ),
    tags=["Vendors – Browse"],
)
def browse_vendors(
    area: Optional[int] = Query(None, description="Filter by vendor area code"),
    category: Optional[int] = Query(None, description="Filter by vendor category code"),
    search: Optional[str] = Query(None, description="Search by business name (case-insensitive)"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit (max 100)"),
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
    vendors = q.order_by(Vendor.vendor_business_name).offset(skip).limit(limit).all()
    return vendors
