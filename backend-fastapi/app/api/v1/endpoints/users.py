from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.users import UserProfile, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserProfile, summary="Profil user yang sedang login")
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


@router.put("/me", response_model=UserProfile, summary="Update profil sendiri")
def update_me(
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
