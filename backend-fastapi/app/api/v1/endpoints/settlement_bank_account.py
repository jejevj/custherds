"""
Settlement Bank Account endpoints — proxy ke DOKU Bulk Registration Bank API.

Route:
  GET    /settlement-bank-account/           → list dari DB lokal
  POST   /settlement-bank-account/           → create via DOKU + simpan ke DB lokal
  GET    /settlement-bank-account/{id}       → get dari DB lokal, sync dari DOKU jika perlu
  PUT    /settlement-bank-account/{id}       → update via DOKU
  POST   /settlement-bank-account/{id}/sync  → force sync status dari DOKU ke DB lokal
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
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
    """List semua settlement bank account dari DB lokal."""
    return sba_service.list_settlement_bank_accounts(db, page=page, size=size, status=status)


@router.post("/", status_code=201)
async def create_settlement_bank_account(
    payload: SettlementBankAccountCreate,
    db: Session = Depends(get_db),
):
    """Daftarkan settlement bank account baru ke DOKU dan simpan ke DB lokal."""
    # Transform ke camelCase sesuai spesifikasi DOKU SNAP API
    doku_body = {
        "bankCode":          payload.bank_code,
        "accountNo":         payload.account_number,
        "accountName":       payload.account_name,
    }
    if payload.merchant_reference:
        doku_body["merchantReference"] = payload.merchant_reference

    return await sba_service.create_settlement_bank_account(db, doku_body)


@router.get("/{sba_id}")
async def get_settlement_bank_account(
    sba_id: str,
    db: Session = Depends(get_db),
):
    """Get dari DB lokal + auto-sync status jika masih pending."""
    return await sba_service.get_and_sync_settlement_bank_account(db, sba_id)


@router.put("/{sba_id}")
async def update_settlement_bank_account(
    sba_id: str,
    payload: SettlementBankAccountUpdate,
    db: Session = Depends(get_db),
):
    """Update settlement bank account di DOKU. Hanya bisa untuk status verified."""
    doku_body: dict = {}
    if payload.account_name:
        doku_body["accountName"] = payload.account_name
    if payload.merchant_reference:
        doku_body["merchantReference"] = payload.merchant_reference

    if not doku_body:
        raise HTTPException(status_code=400, detail="Tidak ada field yang diupdate.")

    return await sba_service.update_settlement_bank_account(db, sba_id, doku_body)


@router.post("/{sba_id}/sync")
async def sync_settlement_bank_account(
    sba_id: str,
    db: Session = Depends(get_db),
):
    """Force sync status settlement bank account dari DOKU ke DB lokal."""
    return await sba_service.sync_from_doku(db, sba_id)
