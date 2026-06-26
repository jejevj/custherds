import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.booking import Booking
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.schemas.bookings import BookingCreate, BookingResponse, BookingVendorAction
from datetime import datetime, timezone

router = APIRouter()


def _generate_booking_code(db: Session) -> str:
    import random, string
    while True:
        code = "BK" + "".join(random.choices(string.digits, k=8))
        if not db.query(Booking).filter(Booking.booking_code == code).first():
            return code


@router.post("", response_model=BookingResponse, status_code=201, summary="Buat booking baru (Guide)")
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")
    vendor = db.query(Vendor).filter(Vendor.id == payload.vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor tidak ditemukan")
    booking = Booking(
        booking_code=_generate_booking_code(db),
        guide_id=guide.id,
        vendor_id=vendor.id,
        product_id=payload.product_id,
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


@router.get("", response_model=List[BookingResponse], summary="List booking saya")
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.user_type == 1:
        guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
        return db.query(Booking).filter(Booking.guide_id == guide.id).order_by(Booking.created_at.desc()).all() if guide else []
    elif current_user.user_type == 2:
        vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
        return db.query(Booking).filter(Booking.vendor_id == vendor.id).order_by(Booking.created_at.desc()).all() if vendor else []
    return db.query(Booking).order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingResponse, summary="Detail booking")
def get_booking(booking_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan")
    return booking


@router.post("/{booking_id}/approve", response_model=BookingResponse, summary="Vendor approve/reject booking")
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
