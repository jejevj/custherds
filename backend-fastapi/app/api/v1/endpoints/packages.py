import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package
from app.schemas.packages import PackageCreate, PackageUpdate, PackageResponse

router = APIRouter()


# ───────────────────────── VENDOR CRUD ───────────────────────────
# Literal routes di atas, path-param routes di bawah.

@router.get("/my-packages", response_model=List[PackageResponse], summary="[Vendor] List semua package saya")
def list_my_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(404, "Profil vendor tidak ditemukan")
    return db.query(Package).filter(Package.vendor_id == vendor.id).order_by(Package.created_at.desc()).all()


@router.post("/my-packages", response_model=PackageResponse, status_code=201, summary="[Vendor] Buat package baru")
def create_package(
    payload: PackageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(404, "Profil vendor tidak ditemukan")
    if vendor.vendor_status != "approved":
        raise HTTPException(403, "Hanya vendor yang sudah approved yang dapat membuat package")
    if payload.max_pax and payload.max_pax < payload.min_pax:
        raise HTTPException(400, "max_pax tidak boleh lebih kecil dari min_pax")
    pkg = Package(
        vendor_id=vendor.id,
        name=payload.name,
        description=payload.description,
        price_per_pax=payload.price_per_pax,
        min_pax=payload.min_pax,
        max_pax=payload.max_pax,
        duration_minutes=payload.duration_minutes,
        available_days=payload.available_days,
        available_slots=payload.available_slots,
        quota_per_slot=payload.quota_per_slot,
        terms=payload.terms,
        notes=payload.notes,
        photo_urls=payload.photo_urls,
        is_active=True,
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.get("/my-packages/{package_id}", response_model=PackageResponse, summary="[Vendor] Detail package saya")
def get_my_package(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(404, "Profil vendor tidak ditemukan")
    pkg = db.query(Package).filter(
        Package.id == package_id,
        Package.vendor_id == vendor.id,
    ).first()
    if not pkg:
        raise HTTPException(404, "Package tidak ditemukan")
    return pkg


@router.put("/my-packages/{package_id}", response_model=PackageResponse, summary="[Vendor] Update package")
def update_package(
    package_id: uuid.UUID,
    payload: PackageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    pkg = db.query(Package).filter(Package.id == package_id, Package.vendor_id == vendor.id).first()
    if not pkg:
        raise HTTPException(404, "Package tidak ditemukan")
    data = payload.model_dump(exclude_unset=True)
    new_min = data.get('min_pax', pkg.min_pax)
    new_max = data.get('max_pax', pkg.max_pax)
    if new_max is not None and new_max < new_min:
        raise HTTPException(400, "max_pax tidak boleh lebih kecil dari min_pax")
    for field, value in data.items():
        setattr(pkg, field, value)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.delete("/my-packages/{package_id}", summary="[Vendor] Hapus package")
def delete_package(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    pkg = db.query(Package).filter(Package.id == package_id, Package.vendor_id == vendor.id).first()
    if not pkg:
        raise HTTPException(404, "Package tidak ditemukan")
    active_bookings = [
        b for b in pkg.bookings
        if b.status in ("pending_vendor", "confirmed")
    ]
    if active_bookings:
        raise HTTPException(400, f"Package tidak dapat dihapus karena ada {len(active_bookings)} booking aktif.")
    db.delete(pkg)
    db.commit()
    return {"message": "Package berhasil dihapus"}


# ──────────────────────── PUBLIC (Guide browse) ─────────────────────

@router.get("/vendors/{vendor_id}/packages", response_model=List[PackageResponse], summary="Browse packages milik vendor")
def list_vendor_packages(
    vendor_id: uuid.UUID,
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    q = db.query(Package).filter(Package.vendor_id == vendor_id)
    if active_only:
        q = q.filter(Package.is_active == True)  # noqa
    return q.order_by(Package.created_at.desc()).all()


@router.get("/vendors/{vendor_id}/packages/{package_id}", response_model=PackageResponse, summary="Detail package")
def get_vendor_package(
    vendor_id: uuid.UUID,
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    pkg = db.query(Package).filter(
        Package.id == package_id,
        Package.vendor_id == vendor_id,
    ).first()
    if not pkg:
        raise HTTPException(404, "Package tidak ditemukan")
    return pkg
