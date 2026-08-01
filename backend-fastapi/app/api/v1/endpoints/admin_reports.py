"""Admin-facing endpoints for booking reports.

Mounted at: /api/v1/admin/reports

GET    /admin/reports              — list all (filter by ?status=)
GET    /admin/reports/{report_id}  — detail
PATCH  /admin/reports/{report_id}  — update status + resolution_notes
"""
import uuid
from typing import Any, List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.booking_report import BookingReport
from app.schemas.booking_reports import (
    BookingReportAdminUpdate,
    BookingReportResponse,
)

router = APIRouter()

ALLOWED_ADMIN_STATUSES = {"in_review", "resolved", "dismissed"}


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


# ────────────────────────────────────────────────────────────────────────────────
class AdminReportFilter:
    def __init__(
        self,
        status: Optional[str] = Query(
            None,
            description="Filter by status: open | in_review | resolved | dismissed",
        ),
    ):
        self.status = status


@router.get(
    "",
    response_model=List[BookingReportResponse],
    summary="Admin — list semua laporan masuk",
)
def admin_list_reports(
    f: AdminReportFilter = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    q = (
        db.query(BookingReport)
        .options(
            joinedload(BookingReport.booking),
            joinedload(BookingReport.transaction),
        )
    )
    if f.status:
        q = q.filter(BookingReport.status == f.status)
    return q.order_by(BookingReport.created_at.desc()).all()


@router.get(
    "/{report_id}",
    response_model=BookingReportResponse,
    summary="Admin — detail laporan",
)
def admin_get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    return _load_report(db, report_id)


@router.patch(
    "/{report_id}",
    response_model=BookingReportResponse,
    summary="Admin — update status + catatan resolusi",
)
def admin_update_report(
    report_id: uuid.UUID,
    payload: BookingReportAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(99)),
) -> Any:
    if payload.status not in ALLOWED_ADMIN_STATUSES:
        raise HTTPException(
            400,
            f"Status tidak valid. Pilihan: {', '.join(sorted(ALLOWED_ADMIN_STATUSES))}",
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
