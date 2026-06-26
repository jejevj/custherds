import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_user_type
from app.models.user import User
from app.models.guide import Guide
from app.models.guide_withdrawal import GuideWithdrawal
from app.schemas.withdrawals import WithdrawalCreate, WithdrawalResponse

router = APIRouter()


@router.post("", response_model=WithdrawalResponse, status_code=201, summary="Guide request penarikan dana")
def create_withdrawal(
    payload: WithdrawalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        raise HTTPException(404, "Profil guide tidak ditemukan")
    from decimal import Decimal
    amount = Decimal(str(payload.amount))
    if guide.wallet_balance < amount:
        raise HTTPException(400, f"Saldo tidak cukup. Saldo saat ini: {guide.wallet_balance}")
    guide.wallet_balance -= amount
    withdrawal = GuideWithdrawal(
        guide_id=guide.id,
        amount=amount,
        bank_name=payload.bank_name or guide.bank_name,
        bank_account_number=payload.bank_account_number or guide.bank_account_number,
        bank_account_name=payload.bank_account_name or guide.bank_account_name,
        status="pending",
        notes=payload.notes,
    )
    db.add(withdrawal)
    db.commit()
    db.refresh(withdrawal)
    return withdrawal


@router.get("", response_model=List[WithdrawalResponse], summary="List penarikan dana saya (Guide)")
def list_withdrawals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    if not guide:
        return []
    return db.query(GuideWithdrawal).filter(GuideWithdrawal.guide_id == guide.id).order_by(GuideWithdrawal.created_at.desc()).all()


@router.get("/{withdrawal_id}", response_model=WithdrawalResponse, summary="Detail penarikan dana")
def get_withdrawal(
    withdrawal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user_type(1)),
) -> Any:
    guide = db.query(Guide).filter(Guide.user_id == current_user.id).first()
    w = db.query(GuideWithdrawal).filter(GuideWithdrawal.id == withdrawal_id, GuideWithdrawal.guide_id == guide.id).first()
    if not w:
        raise HTTPException(404, "Data penarikan tidak ditemukan")
    return w
