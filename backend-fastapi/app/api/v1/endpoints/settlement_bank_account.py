"""
Settlement Bank Account endpoints — proxy ke DOKU Bulk Registration Bank H2H API.

Route:
  GET    /settlement-bank-account/           → list dari DB lokal
  POST   /settlement-bank-account/           → create via DOKU H2H + simpan ke DB lokal
  GET    /settlement-bank-account/{id}       → get dari DB lokal, sync dari DOKU jika perlu
  PUT    /settlement-bank-account/{id}       → update via DOKU H2H
  POST   /settlement-bank-account/{id}/sync  → force sync status dari DOKU ke DB lokal

Payload ke DOKU H2H (sesuai docs resmi):
  POST /v2/settlement-bank-account
  PUT  /v2/settlement-bank-account
  {
    "bank_account": {
      "code"    : "008",            # string
      "number"  : "1081214141456",  # STRING (bukan int), min 10 max 25
      "name"    : "JOHN DOE",
      "currency": "IDR",
      "country" : "Indonesia"
    }
  }
Ref: https://developers.doku.com/accept-payments/finance-and-settlement/bulk-registration-bank
"""

import logging
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
logger = logging.getLogger(__name__)


@router.get("/")
async def list_settlement_bank_accounts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List semua settlement bank account dari DB lokal."""
    logger.info("[SBA LIST] Request: page=%d, size=%d, status_filter=%r", page, size, status)

    result = sba_service.list_settlement_bank_accounts(db, page=page, size=size, status=status)

    items = result.get("items", [])
    total = result.get("total", 0)

    # ── breakdown status untuk keperluan debug Sync Pending ──
    status_breakdown: dict = {}
    for item in items:
        s = item.get("status", "unknown")
        status_breakdown[s] = status_breakdown.get(s, 0) + 1

    pending_count = status_breakdown.get("pending_verification", 0)

    logger.info(
        "[SBA LIST] Response: total_db=%d, returned=%d, breakdown=%s",
        total, len(items), status_breakdown,
    )

    if pending_count == 0:
        logger.warning(
            "[SBA LIST] ⚠️  Tidak ada item berstatus 'pending_verification' pada page=%d. "
            "Jika tombol 'Sync Pending' diklik, frontend akan menampilkan alert tanpa mengirim request. "
            "Breakdown status: %s",
            page, status_breakdown,
        )
    else:
        logger.info(
            "[SBA LIST] ✅ Ditemukan %d item berstatus 'pending_verification' pada page=%d.",
            pending_count, page,
        )

    return result


@router.post("/", status_code=201)
async def create_settlement_bank_account(
    payload: SettlementBankAccountCreate,
    db: Session = Depends(get_db),
):
    """Daftarkan settlement bank account baru ke DOKU H2H API dan simpan ke DB lokal."""
    logger.info(
        "[SBA CREATE] bank_code=%r, account_number=%r, account_name=%r",
        payload.bank_code, payload.account_number, payload.account_name,
    )
    doku_body = {
        "bank_account": {
            "code"    : payload.bank_code,
            "number"  : str(payload.account_number),
            "name"    : payload.account_name.upper(),
            "currency": "IDR",
            "country" : "Indonesia",
        }
    }
    return await sba_service.create_settlement_bank_account(db, doku_body)


@router.get("/{sba_id}")
async def get_settlement_bank_account(
    sba_id: str,
    db: Session = Depends(get_db),
):
    """Get dari DB lokal + auto-sync status jika masih pending."""
    logger.info("[SBA GET] sba_id=%r", sba_id)
    return await sba_service.get_and_sync_settlement_bank_account(db, sba_id)


@router.put("/{sba_id}")
async def update_settlement_bank_account(
    sba_id: str,
    payload: SettlementBankAccountUpdate,
    db: Session = Depends(get_db),
):
    """Update settlement bank account di DOKU H2H. Hanya bisa untuk status verified."""
    logger.info("[SBA UPDATE] sba_id=%r, payload=%r", sba_id, payload)
    ba_update: dict = {}
    if payload.account_name:
        ba_update["name"] = payload.account_name.upper()
    if getattr(payload, "bank_code", None):
        ba_update["code"] = payload.bank_code
    if getattr(payload, "account_number", None):
        ba_update["number"] = str(payload.account_number)

    if not ba_update:
        raise HTTPException(status_code=400, detail="Tidak ada field yang diupdate.")

    doku_body = {
        "bank_account": {
            "currency": "IDR",
            "country" : "Indonesia",
            **ba_update,
        }
    }
    return await sba_service.update_settlement_bank_account(db, sba_id, doku_body)


@router.post("/{sba_id}/sync")
async def sync_settlement_bank_account(
    sba_id: str,
    db: Session = Depends(get_db),
):
    """Force sync status settlement bank account dari DOKU ke DB lokal."""
    logger.info("[SBA SYNC] sba_id=%r — force sync dimulai", sba_id)
    result = await sba_service.sync_from_doku(db, sba_id)
    logger.info("[SBA SYNC] sba_id=%r — selesai, status baru=%r", sba_id, result.get("data", {}).get("status"))
    return result
