import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package
from app.models.revenue_split_config import RevenueSplitConfig
from app.schemas.packages import PackageCreate, PackageUpdate, PackageResponse, PackageBrowse

router = APIRouter()


# ─────────────────────── VENDOR CRUD ──────────────────────

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
    pkg = db.query(Package).filter(Package.id == package_id, Package.vendor_id == vendor.id).first()
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
    active_bookings = [b for b in pkg.bookings if b.status in ("pending_vendor", "confirmed")]
    if active_bookings:
        raise HTTPException(400, f"Package tidak dapat dihapus karena ada {len(active_bookings)} booking aktif.")
    db.delete(pkg)
    db.commit()
    return {"message": "Package berhasil dihapus"}


# ─────────────────────── PUBLIC BROWSE (Guide) ─────────────────

@router.get("/browse", response_model=List[PackageBrowse], summary="[Guide] Browse semua package aktif")
def browse_packages(
    search: Optional[str] = Query(None, description="Cari nama package atau nama vendor"),
    vendor_id: Optional[uuid.UUID] = Query(None, description="Filter by vendor"),
    available_day: Optional[str] = Query(None, description="Filter hari: Mon/Tue/Wed/Thu/Fri/Sat/Sun"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_duration: Optional[int] = Query(None, ge=1, description="Menit minimum"),
    max_duration: Optional[int] = Query(None, ge=1, description="Menit maksimum"),
    sort: Optional[str] = Query("newest", description="newest | commission_desc | price_asc | price_desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    split = db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).first()  # noqa
    guide_pct = float(split.guide_percent) if split else 0.0

    q = (
        db.query(Package)
        .join(Vendor, Package.vendor_id == Vendor.id)
        .filter(Package.is_active == True, Vendor.vendor_status == "approved")  # noqa
    )

    if vendor_id:
        q = q.filter(Package.vendor_id == vendor_id)
    if min_price is not None:
        q = q.filter(Package.price_per_pax >= min_price)
    if max_price is not None:
        q = q.filter(Package.price_per_pax <= max_price)
    if min_duration is not None:
        q = q.filter(Package.duration_minutes >= min_duration)
    if max_duration is not None:
        q = q.filter(Package.duration_minutes <= max_duration)
    if search:
        q = q.filter(
            Package.name.ilike(f"%{search}%") |
            Vendor.vendor_business_name.ilike(f"%{search}%")
        )

    packages = q.all()

    if available_day:
        packages = [p for p in packages if p.available_days and available_day in p.available_days]

    result = []
    for p in packages:
        commission_per_pax = round(float(p.price_per_pax) * guide_pct / 100, 2)
        result.append(PackageBrowse(
            id=p.id,
            vendor_id=p.vendor_id,
            vendor_name=p.vendor.vendor_business_name,
            vendor_location=p.vendor.vendor_location,
            vendor_allow_direct_booking=p.vendor.allow_direct_booking,
            name=p.name,
            description=p.description,
            price_per_pax=float(p.price_per_pax),
            commission_per_pax=commission_per_pax,
            guide_percent=guide_pct,
            min_pax=p.min_pax,
            max_pax=p.max_pax,
            duration_minutes=p.duration_minutes,
            available_days=p.available_days or [],
            available_slots=p.available_slots or [],
            quota_per_slot=p.quota_per_slot,
            terms=p.terms,
            photo_urls=p.photo_urls or [],
            is_active=p.is_active,
            created_at=str(p.created_at),
        ))

    if sort == "commission_desc":
        result.sort(key=lambda x: x.commission_per_pax, reverse=True)
    elif sort == "price_asc":
        result.sort(key=lambda x: x.price_per_pax)
    elif sort == "price_desc":
        result.sort(key=lambda x: x.price_per_pax, reverse=True)
    else:
        result.sort(key=lambda x: x.created_at, reverse=True)

    return result[skip:skip + limit]


@router.get("/browse/{package_id}", response_model=PackageBrowse, summary="[Guide] Detail satu package by ID")
def browse_package_detail(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    split = db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).first()  # noqa
    guide_pct = float(split.guide_percent) if split else 0.0

    p = (
        db.query(Package)
        .join(Vendor, Package.vendor_id == Vendor.id)
        .filter(
            Package.id == package_id,
            Package.is_active == True,  # noqa
            Vendor.vendor_status == "approved",
        )
        .first()
    )
    if not p:
        raise HTTPException(404, "Package tidak ditemukan")

    commission_per_pax = round(float(p.price_per_pax) * guide_pct / 100, 2)
    return PackageBrowse(
        id=p.id,
        vendor_id=p.vendor_id,
        vendor_name=p.vendor.vendor_business_name,
        vendor_location=p.vendor.vendor_location,
        vendor_allow_direct_booking=p.vendor.allow_direct_booking,
        name=p.name,
        description=p.description,
        price_per_pax=float(p.price_per_pax),
        commission_per_pax=commission_per_pax,
        guide_percent=guide_pct,
        min_pax=p.min_pax,
        max_pax=p.max_pax,
        duration_minutes=p.duration_minutes,
        available_days=p.available_days or [],
        available_slots=p.available_slots or [],
        quota_per_slot=p.quota_per_slot,
        terms=p.terms,
        photo_urls=p.photo_urls or [],
        is_active=p.is_active,
        created_at=str(p.created_at),
    )


# ─────────────────────── PUBLIC (Vendor packages by vendor) ─────────

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
    pkg = db.query(Package).filter(Package.id == package_id, Package.vendor_id == vendor_id).first()
    if not pkg:
        raise HTTPException(404, "Package tidak ditemukan")
    return pkg
