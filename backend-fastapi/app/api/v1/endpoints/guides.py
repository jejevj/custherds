from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.schemas.guides import GuideProfile, GuideUpdateRequest, GuideWallet, GuideSubmitRequest

router = APIRouter()


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
    # Hanya boleh update kalau status incomplete atau rejected
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


@router.post("/me/submit", response_model=GuideProfile, summary="Submit dokumen untuk direview admin")
def submit_guide_for_review(
    payload: GuideSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    """
    Guide mengisi semua data wajib dan submit.
    Status berubah: incomplete/rejected -> pending.
    Admin akan menerima notifikasi untuk mereview.
    """
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    if guide.guide_status == "approved":
        raise HTTPException(status_code=400, detail="Akun sudah diapprove")
    if guide.guide_status == "pending":
        raise HTTPException(status_code=400, detail="Sudah dalam proses review")

    # Terapkan semua field dari payload
    for field, value in payload.dict().items():
        setattr(guide, field, value)

    guide.guide_status = "pending"
    guide.guide_certificate_status = "pending"
    guide.rejection_notes = None  # Clear catatan penolakan sebelumnya
    db.commit()
    db.refresh(guide)
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
