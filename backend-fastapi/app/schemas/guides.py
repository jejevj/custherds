from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
import uuid


class GuideProfile(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    guide_nationality: Optional[str]
    guide_certificate_status: str
    bio: Optional[str]
    languages: Optional[str]
    rating: Optional[float]
    bank_name: Optional[str]
    bank_account_number: Optional[str]
    bank_account_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GuideWallet(BaseModel):
    id: uuid.UUID
    wallet_balance: Decimal
    pending_earnings: Decimal
    total_earnings: Decimal

    class Config:
        from_attributes = True


class GuideUpdateRequest(BaseModel):
    guide_nationality: Optional[str] = None
    bio: Optional[str] = None
    languages: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None
