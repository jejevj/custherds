"""
Settlement Bank Account endpoints — proxy ke DOKU Bulk Registration Bank API.

Route:
  GET    /settlement-bank-account          → list (stored/cached, bukan dari DOKU langsung)
  POST   /settlement-bank-account          → create via DOKU
  GET    /settlement-bank-account/{id}     → get by ID via DOKU
  PUT    /settlement-bank-account/{id}     → update via DOKU (hanya verified)
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.settlement_bank_account import (
    SettlementBankAccountCreate,
    SettlementBankAccountUpdate,
)
from app.services import settlement_bank_account_service as sba_service

router = APIRouter()


@router.get("/")
async def list_settlement_bank_accounts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List semua settlement bank account.
    Karena DOKU tidak menyediakan endpoint list, data dikembalikan dari DB lokal
    (yang di-sync saat create/get). Untuk sementara query langsung ke DOKU GET by ID
    tidak applicable untuk list — ini placeholder yang mengembalikan struktur kosong
    sampai ada mekanisme sync.

    TODO: Implementasi local DB model untuk cache data SBA dari DOKU.
    """
    # Placeholder response — akan diisi setelah model DB dibuat
    return {
        "items": [],
        "total": 0,
        "page": page,
        "size": size,
        "info": "List endpoint membutuhkan local DB sync. Gunakan GET /{id} untuk data spesifik."
    }


@router.post("/", status_code=201)
async def create_settlement_bank_account(
    payload: SettlementBankAccountCreate,
    db: Session = Depends(get_db),
):
    """Daftarkan settlement bank account baru ke DOKU."""
    body = payload.model_dump(exclude_none=True)
    return await sba_service.create_settlement_bank_account(db, body)


@router.get("/{sba_id}")
async def get_settlement_bank_account(
    sba_id: str,
    db: Session = Depends(get_db),
):
    """Get detail settlement bank account dari DOKU berdasarkan ID."""
    return await sba_service.get_settlement_bank_account(db, sba_id)


@router.put("/{sba_id}")
async def update_settlement_bank_account(
    sba_id: str,
    payload: SettlementBankAccountUpdate,
    db: Session = Depends(get_db),
):
    """Update settlement bank account di DOKU. Hanya bisa untuk status verified."""
    body = payload.model_dump(exclude_none=True)
    if not body:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Tidak ada field yang diupdate.")
    return await sba_service.update_settlement_bank_account(db, sba_id, body)
