import uuid
from typing import Any, List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.models.package import Package
from app.schemas.bookings import BookingCreate, BookingResponse, BookingVendorAction, BookingCancelRequest
from datetime import datetime, timezone

router = APIRouter()


def _generate_booking_code(db: Session) -> str:
    import random, string
    while True:
        code = "BK" + "".join(random.choices(string.digits, k=8))
        if not db.query(Booking).filter(Booking.booking_code == code).first():
            return code


def _check_quota(db: Session, package_id: uuid.UUID, booking_date, booking_time, quota_per_slot: int, exclude_booking_id: Optional[uuid.UUID] = None) -> None:
    """
    Cek apakah slot (package + tanggal + jam) masih ada quota.
    Quota dihitung dari jumlah booking berstatus pending_vendor atau confirmed.
    """
    q = db.query(Booking).filter(
        Booking.package_id == package_id,
        Booking.booking_date == booking_date,
        Booking.booking_time == booking_time,
        Booking.status.in_(["pending_vendor", "confirmed"]),
    )
    if exclude_booking_id:
        q = q.filter(Booking.id != exclude_booking_id)
    active_count = q.count()
    if active_count >= quota_per_slot:
        raise HTTPException(
            400,
            f"Slot ini sudah penuh. Quota {quota_per_slot} booking untuk jadwal ini sudah terpenuhi."
        )


# ─────────────────────────── CREATE BOOKING ──────────────────────────────────

@router.post("", response_model=BookingResponse, status_code=201, summary="Guide buat booking (direct atau package)")
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")
    if guide.guide_status != "approved":
        raise HTTPException(403, "Hanya guide yang sudah approved yang dapat membuat booking")

    vendor = db.query(Vendor).filter(Vendor.id == payload.vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor tidak ditemukan")
    if vendor.vendor_status != "approved":
        raise HTTPException(400, "Vendor belum aktif")

    if payload.booking_type not in ("direct", "package"):
        raise HTTPException(400, "booking_type harus 'direct' atau 'package'")

    package_price_snapshot = None
    subtotal_package = None

    if payload.booking_type == "package":
        if not payload.package_id:
            raise HTTPException(400, "package_id wajib diisi untuk booking package")
        pkg = db.query(Package).filter(
            Package.id == payload.package_id,
            Package.vendor_id == payload.vendor_id,
        ).first()
        if not pkg:
            raise HTTPException(404, "Package tidak ditemukan")
        if not pkg.is_active:
            raise HTTPException(400, "Package sudah tidak aktif")

        # Validasi pax
        if payload.pax_count < pkg.min_pax:
            raise HTTPException(400, f"Minimum pax untuk package ini adalah {pkg.min_pax}")
        if pkg.max_pax and payload.pax_count > pkg.max_pax:
            raise HTTPException(400, f"Maksimum pax untuk package ini adalah {pkg.max_pax}")

        # Validasi quota slot
        _check_quota(db, pkg.id, payload.booking_date, payload.booking_time, pkg.quota_per_slot)

        # Hitung subtotal
        package_price_snapshot = pkg.price_per_pax
        subtotal_package = (pkg.price_per_pax * Decimal(str(payload.pax_count))).quantize(Decimal("0.01"))

    booking = Booking(
        booking_code=_generate_booking_code(db),
        guide_id=guide.id,
        vendor_id=vendor.id,
        booking_type=payload.booking_type,
        package_id=payload.package_id if payload.booking_type == "package" else None,
        package_price_snapshot=package_price_snapshot,
        subtotal_package=subtotal_package,
        booking_date=payload.booking_date,
        booking_time=payload.booking_time,
        pax_count=payload.pax_count,
        tourist_names=payload.tourist_names,
        tourist_nationality=payload.tourist_nationality,
        notes=payload.notes,
        status="pending_vendor",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


# ─────────────────────────── LIST & DETAIL ───────────────────────────────────

@router.get("", response_model=List[BookingResponse], summary="List booking saya")
def list_bookings(
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.user_type == 1:
        guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
        q = db.query(Booking).filter(Booking.guide_id == guide.id) if guide else db.query(Booking).filter(False)
    elif current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        q = db.query(Booking).filter(Booking.vendor_id == vendor.id) if vendor else db.query(Booking).filter(False)
    else:
        q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingResponse, summary="Detail booking")
def get_booking(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan")
    return booking


# ─────────────────────────── VENDOR APPROVE / REJECT ─────────────────────────

@router.post("/{booking_id}/approve", response_model=BookingResponse, summary="Vendor approve / reject booking")
def vendor_action_booking(
    booking_id: uuid.UUID,
    payload: BookingVendorAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(2)),
) -> Any:
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.vendor_id == vendor.id).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan")
    if booking.status != "pending_vendor":
        raise HTTPException(400, f"Booking tidak bisa diproses, status saat ini: {booking.status}")

    if payload.action == "approve":
        # Re-check quota saat approve (bisa saja ada race condition)
        if booking.booking_type == "package" and booking.package_id:
            pkg = db.query(Package).filter(Package.id == booking.package_id).first()
            if pkg:
                _check_quota(db, pkg.id, booking.booking_date, booking.booking_time, pkg.quota_per_slot, exclude_booking_id=booking.id)
        booking.status = "confirmed"
        booking.vendor_approval_at = datetime.now(timezone.utc)
    elif payload.action == "reject":
        booking.status = "rejected"
        booking.vendor_rejection_reason = payload.rejection_reason
    else:
        raise HTTPException(400, "Action harus 'approve' atau 'reject'")

    db.commit()
    db.refresh(booking)
    return booking


# ─────────────────────────── CANCEL ──────────────────────────────────────────

@router.post("/{booking_id}/cancel", response_model=BookingResponse, summary="Guide atau Vendor cancel booking")
def cancel_booking(
    booking_id: uuid.UUID,
    payload: BookingCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan")
    if booking.status not in ("pending_vendor", "confirmed"):
        raise HTTPException(400, f"Booking tidak dapat dibatalkan, status saat ini: {booking.status}")

    # Tentukan siapa yang cancel
    if current_user.user_type == 1:
        guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
        if not guide or booking.guide_id != guide.id:
            raise HTTPException(403, "Bukan booking Anda")
        cancelled_by = "guide"
    elif current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        if not vendor or booking.vendor_id != vendor.id:
            raise HTTPException(403, "Bukan booking vendor Anda")
        cancelled_by = "vendor"
    else:
        cancelled_by = "admin"

    booking.status = "cancelled"
    booking.cancelled_by = cancelled_by
    booking.cancelled_reason = payload.reason
    booking.cancelled_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)
    return booking
