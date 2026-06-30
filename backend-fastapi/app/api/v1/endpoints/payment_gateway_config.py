from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.payment_gateway_config import PaymentGatewayConfig
from app.schemas.payment_gateway_config import (
    PaymentGatewayConfigCreate,
    PaymentGatewayConfigUpdate,
    PaymentGatewayConfigResponse,
    PaymentGatewayConfigSafeResponse,
    PaymentGatewayActivateRequest,
)

router = APIRouter()

SUPPORTED_PROVIDERS = ["doku", "xendit"]


@router.get("/", response_model=List[PaymentGatewayConfigSafeResponse])
def list_gateways(db: Session = Depends(get_db)):
    """Daftar semua gateway yang terdaftar (tanpa credentials)."""
    return db.query(PaymentGatewayConfig).all()


@router.get("/active", response_model=PaymentGatewayConfigSafeResponse)
def get_active_gateway(db: Session = Depends(get_db)):
    """Cek gateway mana yang sedang aktif."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.is_active == True).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belum ada gateway yang aktif.")
    return config


@router.get("/{provider}", response_model=PaymentGatewayConfigResponse)
def get_gateway_detail(provider: str, db: Session = Depends(get_db)):
    """Detail konfigurasi termasuk credentials — hanya untuk admin."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    return config


@router.post("/", response_model=PaymentGatewayConfigResponse, status_code=status.HTTP_201_CREATED)
def create_gateway(payload: PaymentGatewayConfigCreate, db: Session = Depends(get_db)):
    """Daftarkan gateway baru. Provider harus unik."""
    if payload.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider tidak didukung. Pilih dari: {SUPPORTED_PROVIDERS}",
        )
    existing = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == payload.provider).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Provider '{payload.provider}' sudah terdaftar. Gunakan PUT untuk update.",
        )
    config = PaymentGatewayConfig(**payload.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.put("/{provider}", response_model=PaymentGatewayConfigResponse)
def update_gateway(provider: str, payload: PaymentGatewayConfigUpdate, db: Session = Depends(get_db)):
    """Update credentials atau konfigurasi gateway (label, is_production, notes)."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config


@router.put("/activate", response_model=PaymentGatewayConfigSafeResponse)
def activate_gateway(payload: PaymentGatewayActivateRequest, db: Session = Depends(get_db)):
    """
    Aktifkan satu gateway dan non-aktifkan semua yang lain.
    Hanya satu gateway yang boleh aktif dalam satu waktu.
    """
    target = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == payload.provider).first()
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gateway '{payload.provider}' tidak ditemukan. Daftarkan dulu via POST /.",
        )
    db.query(PaymentGatewayConfig).update({"is_active": False})
    target.is_active = True
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gateway(provider: str, db: Session = Depends(get_db)):
    """Hapus konfigurasi gateway. Gateway aktif tidak boleh dihapus."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    if config.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gateway aktif tidak dapat dihapus. Non-aktifkan dulu dengan mengaktifkan gateway lain.",
        )
    db.delete(config)
    db.commit()
