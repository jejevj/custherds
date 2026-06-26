import uuid
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class WithdrawalCreate(BaseModel):
    amount: float
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None
    notes: Optional[str] = None


class WithdrawalResponse(BaseModel):
    id: uuid.UUID
    guide_id: uuid.UUID
    amount: Decimal
    bank_name: str
    bank_account_number: str
    bank_account_name: str
    status: str
    processed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
