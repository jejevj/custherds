from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.models.package import Package
from app.schemas.vendors import VendorProfile, VendorUpdateRequest, VendorSubmitRequest, VendorPublic, VendorDetail, PackagePublic
from app.utils.email_sender import send_transactional_email
from app.utils.notification_emails import build_document_submitted_email
from decimal import Decimal
import uuid

router = APIRouter()


# ─────────────────────────── GUIDE: BROWSE VENDORS ───────────────────────────

@router.get(
    "/browse",
    response_model=List[VendorPublic],
    summary="[Guide] Browse daftar vendor aktif — sort & filter",
)
def browse_vendors(
    sort: Optional[str] = Query(
        "commission_desc",
        description=(
            "Urutan hasil. Opsi: "
            "commission_desc (komisi tertinggi), "
            "commission_asc (komisi terendah), "
            "min_spend_asc (min. transaksi terendah), "
            "name_asc (A-Z nama bisnis)"
        ),
    ),
    area: Optional[int] = Query(None, description="Filter berdasarkan vendor_area (ID area)"),
    category: Optional[int] = Query(None, description="Filter berdasarkan vendor_category"),
    limit: int = Query(50, ge=1, le=200, description="Jumlah vendor per halaman (maks 200)"),
    offset: int = Query(0, ge=0, description="Offset untuk pagination"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),  # guide only
) -> Any:
    """
    Endpoint untuk guide melihat daftar vendor yang aktif (approved).
    Mendukung sorting dan filter area/kategori.
    Menyertakan jumlah package aktif dan estimasi komisi tertinggi per vendor.
    """
    q = db.query(Vendor).filter(Vendor.vendor_status == "approved")

    if area is not None:
        q = q.filter(Vendor.vendor_area == area)
    if category is not None:
        q = q.filter(Vendor.vendor_category == category)

    # Sorting
    sort_map = {
        "commission_desc": Vendor.vendor_cashback_percent.desc(),
        "commission_asc":  Vendor.vendor_cashback_percent.asc(),
        "min_spend_asc":   Vendor.vendor_min_spend.asc().nullsfirst(),
        "name_asc":        Vendor.vendor_business_name.asc(),
    }
    order_clause = sort_map.get(sort, Vendor.vendor_cashback_percent.desc())
    q = q.order_by(order_clause)

    vendors = q.offset(offset).limit(limit).all()

    # Hitung package_count & max komisi per pax untuk setiap vendor
    result = []
    for v in vendors:
        active_packages = [
            p for p in v.packages if p.is_active
        ]
        package_count = len(active_packages)

        # Estimasi komisi per pax: cashback_percent * price_per_pax dari tiap package
        max_commission: Optional[float] = None
        if active_packages:
            commissions = [
                float(p.price_per_pax) * (v.vendor_cashback_percent / 100)
                for p in active_packages
            ]
            max_commission = round(max(commissions), 2)

        # Cover photo: ambil foto pertama dari gallery_urls
        cover_photo: Optional[str] = None
        if v.gallery_urls and len(v.gallery_urls) > 0:
            cover_photo = v.gallery_urls[0]

        result.append(VendorPublic(
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
            cover_photo=cover_photo,
        ))

    return result


@router.get(
    "/browse/{vendor_id}",
    response_model=VendorDetail,
    summary="[Guide] Detail vendor — termasuk gallery & packages",
)
def browse_vendor_detail(
    vendor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),  # guide only
) -> Any:
    """
    Detail lengkap satu vendor untuk guide:
    gallery foto, daftar package aktif + estimasi komisi per pax.
    """
    v = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.vendor_status == "approved",
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor tidak ditemukan atau belum aktif")

    active_packages = [p for p in v.packages if p.is_active]

    packages_out = [
        PackagePublic(
            id=p.id,
            package_name=p.name,
            package_description=p.description,
            price_per_pax=p.price_per_pax,
            min_pax=p.min_pax,
            max_pax=p.max_pax,
            duration_hours=round(p.duration_minutes / 60, 2) if p.duration_minutes else None,
            photo_urls=p.photo_urls or [],
            is_active=p.is_active,
            guide_commission_per_pax=round(
                float(p.price_per_pax) * (v.vendor_cashback_percent / 100), 2
            ),
        )
        for p in active_packages
    ]

    cover_photo: Optional[str] = None
    gallery: List[str] = v.gallery_urls or []
    if gallery:
        cover_photo = gallery[0]

    return VendorDetail(
        id=v.id,
        vendor_business_name=v.vendor_business_name,
        vendor_category=v.vendor_category,
        vendor_area=v.vendor_area,
        vendor_location=v.vendor_location,
        vendor_contact_person=v.vendor_contact_person,
        vendor_short_description=v.vendor_short_description,
        vendor_opening_hours=v.vendor_opening_hours,
        vendor_min_spend=v.vendor_min_spend,
        vendor_cashback_percent=v.vendor_cashback_percent,
        vendor_website=v.vendor_website,
        allow_direct_booking=v.allow_direct_booking,
        cover_photo=cover_photo,
        gallery_urls=gallery,
        packages=packages_out,
    )


# ─────────────────────────── VENDOR SELF-SERVICE ───────────────────────────

@router.get("/me", response_model=VendorProfile, summary="Profil vendor yang sedang login")
def get_vendor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    return vendor


@router.put("/me", response_model=VendorProfile, summary="Update profil vendor (simpan draft)")
def update_vendor_profile(
    payload: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    if vendor.vendor_status not in ("incomplete", "rejected"):
        raise HTTPException(
            status_code=400,
            detail=f"Profil tidak dapat diedit saat status '{vendor.vendor_status}'"
        )
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.post("/me/submit", response_model=VendorProfile, summary="Submit dokumen untuk direview admin")
def submit_vendor_for_review(
    payload: VendorSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    """
    Vendor mengisi semua data wajib dan submit.
    Status berubah: incomplete/rejected -> pending.
    Email tahap 2 dikirim: dokumen diterima, akun sedang diverifikasi.
    """
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profil vendor tidak ditemukan")
    if vendor.vendor_status == "approved":
        raise HTTPException(status_code=400, detail="Akun vendor sudah diapprove")
    if vendor.vendor_status == "pending":
        raise HTTPException(status_code=400, detail="Sudah dalam proses review")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(vendor, field, value)

    vendor.vendor_status = "pending"
    vendor.approval_notes = None
    db.commit()
    db.refresh(vendor)

    # ── Email tahap 2: Dokumen diterima, akun dalam proses verifikasi ──
    try:
        subject, body_html, body_text = build_document_submitted_email(
            user_name=current_user.user_name,
            user_email=current_user.user_email,
            role="vendor",
            vendor_business_name=vendor.vendor_business_name or "",
        )
        send_transactional_email(
            db=db,
            to_address=current_user.user_email,
            subject=subject,
            body_html=body_html,
            body_text=body_text,
        )
    except Exception:
        pass  # Email gagal tidak boleh gagalkan submit

    return vendor


@router.get("/list", response_model=List[VendorProfile], summary="List semua vendor aktif (publik)")
def list_vendors(
    db: Session = Depends(get_db),
) -> Any:
    return db.query(Vendor).filter(Vendor.vendor_status == "approved").all()
