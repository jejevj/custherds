import uuid
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class AdminUserList(BaseModel):
    id: uuid.UUID
    user_name: str
    user_email: str
    user_type: int
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminTransactionList(BaseModel):
    id: uuid.UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminWithdrawalProcess(BaseModel):
    status: str  # processing | completed | failed
    notes: Optional[str] = None
    xendit_disbursement_id: Optional[str] = None


class AdminSplitConfigCreate(BaseModel):
    vendor_percent: float
    guide_percent: float
    platform_percent: float
    notes: Optional[str] = None


class AdminSplitConfigResponse(BaseModel):
    id: uuid.UUID
    vendor_percent: float
    guide_percent: float
    platform_percent: float
    is_active: bool
    notes: Optional[str]
    effective_from: datetime
    created_at: datetime

    class Config:
        from_attributes = True
