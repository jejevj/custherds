from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas.auth import Token, RegisterRequest, RegisterResponse

router = APIRouter()


@router.post("/login", response_model=Token, summary="Login — get JWT token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.user_email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.user_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(days=7),
    )

    return {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "token_type":    "bearer",
        "user_id":       str(user.id),
        "user_name":     user.user_name,
        "user_email":    user.user_email,
        "user_type":     user.user_type,
    }


@router.post("/register", response_model=RegisterResponse, status_code=201, summary="Register new user (Guide or Vendor)")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    """Register a new Guide (user_type=1) or Vendor (user_type=2).

    - Guide: creates User + Guide record. Status starts as pending (guide_certificate_status).
    - Vendor: creates User + Vendor record. vendor_status is always 'pending' until admin approves.
    - Both can login immediately after registration.
    """
    if db.query(User).filter(User.user_email == payload.user_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.user_type not in (1, 2):
        raise HTTPException(status_code=400, detail="user_type must be 1 (Guide) or 2 (Vendor)")

    user = User(
        user_name=payload.user_name,
        user_email=payload.user_email,
        user_password=get_password_hash(payload.password),
        user_type=payload.user_type,
        user_phone=payload.user_phone,
        is_active=True,
        is_verified=False,
        tnc_accepted=payload.tnc_accepted,
    )
    db.add(user)
    db.flush()

    if payload.user_type == 1:  # Guide
        db.add(Guide(
            user_id=user.id,
            guide_certificate_status="pending",  # always pending until admin approves
        ))

    elif payload.user_type == 2:  # Vendor
        if not payload.vendor_business_name or payload.vendor_category is None \
                or payload.vendor_area is None or payload.vendor_cashback_percent is None:
            raise HTTPException(status_code=400, detail="Incomplete vendor data: vendor_business_name, vendor_category, vendor_area, and vendor_cashback_percent are required")
        db.add(Vendor(
            user_id=user.id,
            vendor_business_name=payload.vendor_business_name,
            vendor_category=payload.vendor_category,
            vendor_area=payload.vendor_area,
            vendor_cashback_percent=payload.vendor_cashback_percent,
            vendor_location=payload.vendor_location,
            vendor_contact_person=payload.vendor_contact_person,
            vendor_website=payload.vendor_website,
            vendor_short_description=payload.vendor_short_description,
            vendor_opening_hours=payload.vendor_opening_hours,
            vendor_min_spend=payload.vendor_min_spend,
            vendor_know_from=payload.vendor_know_from,
            vendor_status="pending",  # always pending — admin must approve
        ))

    db.commit()
    db.refresh(user)
    return {
        "id": str(user.id),
        "user_email": user.user_email,
        "user_type": user.user_type,
        "message": "Registration successful. Your account is pending admin approval.",
    }
