from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.schemas.vendors import VendorProfile, VendorUpdateRequest, VendorDepositInfo

router = APIRouter()


@router.get("/me", response_model=VendorProfile, summary="Profil vendor yang sedang login")
def get_vendor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    return vendor


@router.put("/me", response_model=VendorProfile, summary="Update profil vendor")
def update_vendor_profile(
    payload: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("/me/deposit", response_model=VendorDepositInfo, summary="Info saldo deposit vendor")
def get_vendor_deposit(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    return vendor
