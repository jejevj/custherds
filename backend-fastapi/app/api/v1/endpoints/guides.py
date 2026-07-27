from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.schemas.guides import GuideProfile, GuideUpdateRequest, GuideWallet, GuideSubmitRequest
from app.utils.email_sender import send_transactional_email
from app.utils.notification_emails import build_document_submitted_email
import uuid

router = APIRouter()


class GuideBankUpdateRequest(BaseModel):
    bank_code: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None


@router.get("/me", response_model=GuideProfile, summary="Profil guide yang sedang login")
def get_guide_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    return guide


@router.put("/me", response_model=GuideProfile, summary="Update profil guide (simpan draft)")
def update_guide_profile(
    payload: GuideUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    if guide.guide_status not in ("incomplete", "rejected"):
        raise HTTPException(
            status_code=400,
            detail=f"Profil tidak dapat diedit saat status '{guide.guide_status}'"
        )
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(guide, field, value)
    db.commit()
    db.refresh(guide)
    return guide


@router.put("/me/bank", response_model=GuideProfile, summary="Update informasi rekening bank guide (semua status)")
def update_guide_bank(
    payload: GuideBankUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    """
    Update data rekening bank guide.
    Endpoint ini dapat diakses di semua status guide (incomplete, pending, approved, rejected)
    karena informasi bank diperlukan untuk proses disbursement komisi.
    """
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(guide, field, value)
    db.commit()
    db.refresh(guide)
    return guide


@router.post("/me/submit", response_model=GuideProfile, summary="Submit dokumen untuk direview admin")
def submit_guide_for_review(
    payload: GuideSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    """
    Guide mengisi semua data wajib dan submit.
    Status berubah: incomplete/rejected -> pending.
    Email tahap 2 dikirim: dokumen diterima, akun sedang diverifikasi.
    """
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    if guide.guide_status == "approved":
        raise HTTPException(status_code=400, detail="Akun sudah diapprove")
    if guide.guide_status == "pending":
        raise HTTPException(status_code=400, detail="Sudah dalam proses review")

    for field, value in payload.dict().items():
        setattr(guide, field, value)

    guide.guide_status = "pending"
    guide.guide_certificate_status = "pending"
    guide.rejection_notes = None
    db.commit()
    db.refresh(guide)

    # ── Email tahap 2: Dokumen diterima, akun dalam proses verifikasi ──
    try:
        subject, body_html, body_text = build_document_submitted_email(
            user_name=current_user.user_name,
            user_email=current_user.user_email,
            role="guide",
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

    return guide


@router.get("/me/wallet", response_model=GuideWallet, summary="Saldo wallet guide")
def get_guide_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    return guide


# ---------------------------------------------------------------------------
# Endpoint untuk Vendor: cek apakah guide sudah memiliki bank_settlement_id
# Tidak mengekspos data sensitif — hanya return boolean flag.
# ---------------------------------------------------------------------------
class GuideSettlementStatusResponse(BaseModel):
    guide_id: str
    has_bank_settlement_id: bool


@router.get(
    "/{guide_id}/settlement-status",
    response_model=GuideSettlementStatusResponse,
    summary="[Vendor] Cek apakah guide sudah memiliki bank settlement ID",
)
def get_guide_settlement_status(
    guide_id: uuid.UUID,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_user_type(2)),  # vendor only
) -> Any:
    """
    Digunakan vendor sebelum generate QRIS.
    Hanya mengembalikan { guide_id, has_bank_settlement_id: bool }.
    Tidak mengekspos nomor rekening atau data sensitif lainnya.
    """
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide tidak ditemukan")
    return {
        "guide_id": str(guide.id),
        "has_bank_settlement_id": bool(guide.bank_settlement_id),
    }
