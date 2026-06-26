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


@router.post("/login", response_model=Token, summary="Login — dapatkan JWT token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.user_email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.user_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun belum aktif")
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.user_type}


@router.post("/register", response_model=RegisterResponse, status_code=201, summary="Register user baru")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    if db.query(User).filter(User.user_email == payload.user_email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
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
        db.add(Guide(user_id=user.id))
    elif payload.user_type == 2:  # Vendor
        if not payload.vendor_business_name or payload.vendor_category is None or payload.vendor_area is None or payload.vendor_cashback_percent is None:
            raise HTTPException(status_code=400, detail="Data vendor tidak lengkap")
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
            vendor_know_from=payload.vendor_know_from,
        ))
    db.commit()
    db.refresh(user)
    return {"id": str(user.id), "user_email": user.user_email, "user_type": user.user_type, "message": "Registrasi berhasil"}
