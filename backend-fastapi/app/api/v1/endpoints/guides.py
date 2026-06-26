from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.schemas.guides import GuideProfile, GuideUpdateRequest, GuideWallet

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


@router.put("/me", response_model=GuideProfile, summary="Update profil guide")
def update_guide_profile(
    payload: GuideUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Profil guide tidak ditemukan")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(guide, field, value)
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
