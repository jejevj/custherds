from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_active_user, require_role
from app.models.vendor import Vendor
from app.models.user import User
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse

router = APIRouter()


@router.get("/", response_model=List[VendorResponse])
def list_vendors(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Vendor).filter(Vendor.is_approved == True).offset(skip).limit(limit).all()


@router.post("/", response_model=VendorResponse, status_code=201)
def create_vendor(
    payload: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor")),
):
    if db.query(Vendor).filter(Vendor.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Vendor profile already exists")
    vendor = Vendor(**payload.model_dump(), user_id=current_user.id)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: int,
    payload: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor", "admin")),
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor
