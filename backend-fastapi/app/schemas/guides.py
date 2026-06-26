from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
import uuid


class GuideProfile(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    guide_status: str
    rejection_notes: Optional[str] = None
    guide_nationality: Optional[str] = None
    guide_phone: Optional[str] = None
    guide_id_card_url: Optional[str] = None
    guide_certificate: Optional[str] = None
    guide_certificate_status: str
    bio: Optional[str] = None
    languages: Optional[str] = None
    rating: Optional[float] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None
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
    guide_phone: Optional[str] = None
    guide_id_card_url: Optional[str] = None
    guide_certificate: Optional[str] = None
    bio: Optional[str] = None
    languages: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None


class GuideSubmitRequest(BaseModel):
    """Called when guide clicks 'Submit for Review' after filling all required fields.
    All required fields must be non-empty for submission to succeed.
    """
    guide_nationality: str
    guide_phone: str
    guide_id_card_url: str        # URL KTP/Paspor sudah diupload
    guide_certificate: str        # URL sertifikat guide sudah diupload
    bio: str
    languages: str
    bank_name: str
    bank_account_number: str
    bank_account_name: str
