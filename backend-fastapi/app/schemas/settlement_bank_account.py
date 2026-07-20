from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class SettlementBankAccountCreate(BaseModel):
    bank_code: str
    account_number: str
    account_name: str
    merchant_reference: Optional[str] = None


class SettlementBankAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    merchant_reference: Optional[str] = None


class SettlementBankAccountResponse(BaseModel):
    id: str
    bank_code: str
    bank_name: Optional[str] = None
    account_number: str
    account_name: str
    merchant_reference: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettlementBankAccountListResponse(BaseModel):
    items: List[SettlementBankAccountResponse]
    total: int
    page: int
    size: int
