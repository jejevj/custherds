from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, require_role
from app.models.guide import Guide
from app.models.user import User
from app.schemas.guide import GuideCreate, GuideUpdate, GuideResponse

router = APIRouter()


@router.get("/", response_model=List[GuideResponse])
def list_guides(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(Guide).filter(Guide.is_approved == True, Guide.is_available == True).offset(skip).limit(limit).all()


@router.post("/", response_model=GuideResponse, status_code=201)
def create_guide(
    payload: GuideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("guide")),
):
    if db.query(Guide).filter(Guide.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Guide profile already exists")
    guide = Guide(**payload.model_dump(), user_id=current_user.id)
    db.add(guide)
    db.commit()
    db.refresh(guide)
    return guide


@router.get("/{guide_id}", response_model=GuideResponse)
def get_guide(guide_id: int, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide


@router.put("/{guide_id}", response_model=GuideResponse)
def update_guide(
    guide_id: int,
    payload: GuideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("guide", "admin")),
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(guide, field, value)
    db.commit()
    db.refresh(guide)
    return guide
