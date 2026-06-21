from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_active_user
from app.models.review import Review
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[dict])
def list_reviews(
    target_type: str,
    target_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    return db.query(Review).filter(
        Review.target_type == target_type,
        Review.target_id == target_id,
    ).offset(skip).limit(limit).all()


@router.post("/", status_code=201)
def create_review(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    review = Review(**payload, user_id=current_user.id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
