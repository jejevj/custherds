from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.vendor import Vendor
from app.schemas.vendors import VendorProfile, VendorUpdateRequest, VendorSubmitRequest
from app.utils.email_sender import send_transactional_email
from app.utils.notification_emails import build_document_submitted_email

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
