from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package
from app.models.revenue_split_config import RevenueSplitConfig
from app.schemas.vendors import (
    VendorProfile,
    VendorUpdateRequest,
    VendorSubmitRequest,
    VendorDepositInfo,
    VendorPublic,
    VendorDetail,
    PackagePublic,
)
import uuid

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


@router.put("/me", response_model=VendorProfile, summary="Update vendor profile", tags=["Vendors"])
def update_vendor_profile(
    payload: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor.vendor_status not in ("incomplete", "rejected"):
        raise HTTPException(status_code=400, detail=f"Profile cannot be edited when status is '{vendor.vendor_status}'")
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
    vendor.approval_notes = None
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
    summary="Browse approved vendors (Guide)",
    tags=["Vendors – Browse"],
)
def browse_vendors(
    area: Optional[int] = Query(None, description="Filter by area code"),
    category: Optional[int] = Query(None, description="Filter by category code"),
    search: Optional[str] = Query(None, description="Search by business name"),
    allow_direct: Optional[bool] = Query(None, description="Filter hanya vendor yg allow direct booking"),
    sort: Optional[str] = Query("name", description="name | commission_desc | packages_desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    split = db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).first()  # noqa
    guide_pct = float(split.guide_percent) if split else 0.0

    q = db.query(Vendor).filter(Vendor.vendor_status == "approved")
    if area is not None:
        q = q.filter(Vendor.vendor_area == area)
    if category is not None:
        q = q.filter(Vendor.vendor_category == category)
    if search:
        q = q.filter(Vendor.vendor_business_name.ilike(f"%{search}%"))
    if allow_direct is not None:
        q = q.filter(Vendor.allow_direct_booking == allow_direct)

    vendors = q.all()

    result = []
    for v in vendors:
        active_pkgs = [p for p in v.packages if p.is_active]
        package_count = len(active_pkgs)
        max_commission: Optional[float] = None
        if active_pkgs:
            max_price = max(float(p.price_per_pax) for p in active_pkgs)
            max_commission = round(max_price * guide_pct / 100, 2)
        cover = None
        for p in active_pkgs:
            if p.photo_urls:
                cover = p.photo_urls[0]
                break

        item = VendorPublic(
            id=v.id,
            vendor_business_name=v.vendor_business_name,
            vendor_category=v.vendor_category,
            vendor_area=v.vendor_area,
            vendor_location=v.vendor_location,
            vendor_short_description=v.vendor_short_description,
            vendor_opening_hours=v.vendor_opening_hours,
            vendor_min_spend=v.vendor_min_spend,
            vendor_cashback_percent=v.vendor_cashback_percent,
            vendor_website=v.vendor_website,
            allow_direct_booking=v.allow_direct_booking,
            package_count=package_count,
            max_commission_per_pax=max_commission,
            cover_photo=cover,
        )
        result.append(item)

    if sort == "commission_desc":
        result.sort(key=lambda x: x.max_commission_per_pax or 0, reverse=True)
    elif sort == "packages_desc":
        result.sort(key=lambda x: x.package_count, reverse=True)
    else:
        result.sort(key=lambda x: x.vendor_business_name)

    return result[skip:skip + limit]


@router.get(
    "/browse/{vendor_id}",
    response_model=VendorDetail,
    summary="Detail vendor + daftar paket (Guide)",
    tags=["Vendors – Browse"],
)
def get_vendor_detail(
    vendor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mengembalikan detail lengkap vendor berikut semua paket aktifnya.
    Tersedia untuk semua user yang sudah login (guide, vendor, admin).
    Komisi per pax dihitung dari split config aktif.
    """
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.vendor_status == "approved",
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor tidak ditemukan atau belum disetujui")

    split = db.query(RevenueSplitConfig).filter(RevenueSplitConfig.is_active == True).first()  # noqa
    guide_pct = float(split.guide_percent) if split else 0.0

    active_pkgs = [p for p in vendor.packages if p.is_active]

    cover = None
    for p in active_pkgs:
        if p.photo_urls:
            cover = p.photo_urls[0]
            break

    packages_out = []
    for p in active_pkgs:
        commission = round(float(p.price_per_pax) * guide_pct / 100, 2)
        packages_out.append(PackagePublic(
            id=p.id,
            package_name=p.package_name,
            package_description=p.package_description,
            price_per_pax=p.price_per_pax,
            min_pax=p.min_pax,
            max_pax=p.max_pax,
            duration_hours=p.duration_hours,
            photo_urls=p.photo_urls,
            is_active=p.is_active,
            guide_commission_per_pax=commission,
        ))

    return VendorDetail(
        id=vendor.id,
        vendor_business_name=vendor.vendor_business_name,
        vendor_category=vendor.vendor_category,
        vendor_area=vendor.vendor_area,
        vendor_location=vendor.vendor_location,
        vendor_contact_person=vendor.vendor_contact_person,
        vendor_short_description=vendor.vendor_short_description,
        vendor_opening_hours=vendor.vendor_opening_hours,
        vendor_min_spend=vendor.vendor_min_spend,
        vendor_cashback_percent=vendor.vendor_cashback_percent,
        vendor_website=vendor.vendor_website,
        allow_direct_booking=vendor.allow_direct_booking,
        cover_photo=cover,
        packages=packages_out,
    )
