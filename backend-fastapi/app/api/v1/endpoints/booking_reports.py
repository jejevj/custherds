import uuid
import random
import string
from typing import Any, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.models.booking import Booking
from app.models.transaction import Transaction
from app.models.booking_report import BookingReport
from app.schemas.booking_reports import (
    BookingReportCreate,
    BookingReportAdminUpdate,
    BookingReportResponse,
)

router = APIRouter()

ALLOWED_BOOKING_STATUSES = {"completed", "rejected"}
ALLOWED_ADMIN_STATUSES   = {"in_review", "resolved", "dismissed"}


def _generate_report_code(db: Session) -> str:
    while True:
        code = "RPT" + "".join(random.choices(string.digits, k=9))
        if not db.query(BookingReport).filter(BookingReport.report_code == code).first():
            return code


def _load_report(db: Session, report_id: uuid.UUID) -> BookingReport:
    report = (
        db.query(BookingReport)
        .options(
            joinedload(BookingReport.booking),
            joinedload(BookingReport.transaction),
        )
        .filter(BookingReport.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(404, "Laporan tidak ditemukan")
    return report


# ──────────────────────────────────────────────────────────────────────────────
# GUIDE: Buat laporan
# POST /reports
# ──────────────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=BookingReportResponse,
    status_code=201,
    summary="Guide buat laporan booking (completed/rejected)",
)
def create_report(
    payload: BookingReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),  # hanya Guide
) -> Any:
    # Pastikan guide ada
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")

    # Booking harus milik guide yang sedang login
    booking = db.query(Booking).filter(
        Booking.id == payload.booking_id,
        Booking.guide_id == guide.id,      # <-- OWNERSHIP: hanya booking milik sendiri
    ).first()
    if not booking:
        raise HTTPException(404, "Booking tidak ditemukan atau bukan milik Anda")

    # Hanya booking completed/rejected yang boleh dilaporkan
    if booking.status not in ALLOWED_BOOKING_STATUSES:
        raise HTTPException(
            400,
            f"Laporan hanya dapat dibuat untuk booking dengan status 'completed' atau 'rejected'. "
            f"Status booking saat ini: {booking.status}"
        )

    # Cek apakah booking ini sudah pernah dilaporkan (UNIQUE booking_id)
    existing = db.query(BookingReport).filter(
        BookingReport.booking_id == booking.id
    ).first()
    if existing:
        raise HTTPException(409, "Booking ini sudah memiliki laporan sebelumnya.")

    # Tentukan report_type & transaction_id otomatis
    if booking.status == "completed":
        report_type = "transaction_dispute"
        tx = db.query(Transaction).filter(
            Transaction.booking_id == booking.id
        ).first()
        transaction_id = tx.id if tx else None
    else:  # rejected
        report_type    = "unfair_rejection"
        transaction_id = None

    report = BookingReport(
        report_code=_generate_report_code(db),
        booking_id=booking.id,
        guide_id=guide.id,
        transaction_id=transaction_id,
        report_type=report_type,
        description=payload.description,
        status="open",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return _load_report(db, report.id)


# ──────────────────────────────────────────────────────────────────────────────
# GUIDE: List laporan milik sendiri
# GET /reports
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[BookingReportResponse],
    summary="Guide lihat daftar laporan miliknya sendiri",
)
def list_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),  # hanya Guide
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")

    reports = (
        db.query(BookingReport)
        .options(
            joinedload(BookingReport.booking),
            joinedload(BookingReport.transaction),
        )
        .filter(BookingReport.guide_id == guide.id)  # <-- OWNERSHIP FILTER
        .order_by(BookingReport.created_at.desc())
        .all()
    )
    return reports


# ──────────────────────────────────────────────────────────────────────────────
# GUIDE: Detail laporan milik sendiri
# GET /reports/{report_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/{report_id}",
    response_model=BookingReportResponse,
    summary="Guide lihat detail laporan (hanya miliknya)",
)
def get_my_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Admin (user_type 99) boleh lihat semua
    if current_user.user_type == 99:
        return _load_report(db, report_id)

    # Guide hanya boleh lihat miliknya
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(403, "Akses ditolak")

    report = _load_report(db, report_id)
    if report.guide_id != guide.id:  # <-- OWNERSHIP CHECK
        raise HTTPException(403, "Anda tidak memiliki akses ke laporan ini")

    return report


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN: List semua laporan
# GET /reports/admin/all
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/admin/all",
    response_model=List[BookingReportResponse],
    summary="Admin lihat semua laporan masuk",
)
def admin_list_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),  # hanya Superadmin
) -> Any:
    reports = (
        db.query(BookingReport)
        .options(
            joinedload(BookingReport.booking),
            joinedload(BookingReport.transaction),
        )
        .order_by(BookingReport.created_at.desc())
        .all()
    )
    return reports


# ──────────────────────────────────────────────────────────────────────────────
# ADMIN: Update status laporan
# PATCH /reports/admin/{report_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.patch(
    "/admin/{report_id}",
    response_model=BookingReportResponse,
    summary="Admin update status laporan (in_review / resolved / dismissed)",
)
def admin_update_report(
    report_id: uuid.UUID,
    payload: BookingReportAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),  # hanya Superadmin
) -> Any:
    if payload.status not in ALLOWED_ADMIN_STATUSES:
        raise HTTPException(
            400,
            f"Status tidak valid. Pilihan: {', '.join(ALLOWED_ADMIN_STATUSES)}"
        )

    report = db.query(BookingReport).filter(BookingReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Laporan tidak ditemukan")

    if report.status in ("resolved", "dismissed"):
        raise HTTPException(400, "Laporan sudah ditutup dan tidak dapat diubah lagi.")

    report.status           = payload.status
    report.resolution_notes = payload.resolution_notes
    report.reviewed_by      = current_user.id
    report.reviewed_at      = datetime.now(timezone.utc)

    db.commit()
    db.refresh(report)
    return _load_report(db, report.id)


# ──────────────────────────────────────────────────────────────────────────────
# GUIDE: Hapus laporan (hanya jika masih 'open')
# DELETE /reports/{report_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.delete(
    "/{report_id}",
    status_code=204,
    summary="Guide hapus laporan (hanya saat status masih 'open')",
)
def delete_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),  # hanya Guide
) -> None:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")

    report = db.query(BookingReport).filter(
        BookingReport.id == report_id,
        BookingReport.guide_id == guide.id,  # <-- OWNERSHIP CHECK
    ).first()
    if not report:
        raise HTTPException(404, "Laporan tidak ditemukan atau bukan milik Anda")

    if report.status != "open":
        raise HTTPException(
            400,
            f"Laporan hanya dapat dihapus saat status 'open'. Status saat ini: {report.status}"
        )

    db.delete(report)
    db.commit()
