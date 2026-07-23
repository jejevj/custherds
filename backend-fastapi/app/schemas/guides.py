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
    bank_code: Optional[str] = None             # Kode bank, e.g. '014' = BCA
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None           # Kantor cabang pembuatan bank
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
    bank_code: Optional[str] = None             # Kode bank, e.g. '014' = BCA
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None           # Kantor cabang pembuatan bank
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None


class GuideSubmitRequest(BaseModel):
    """
    Field wajib untuk submit ke review admin.
    KTP harus sudah diupload terlebih dahulu via /uploads.
    Sertifikat guide bersifat opsional.
    """
    guide_nationality: str
    guide_phone: str
    guide_id_card_url: str          # URL KTP / Paspor
    guide_certificate: Optional[str] = None     # URL sertifikat guide (opsional)
    bio: str
    languages: Optional[str] = None
    bank_code: Optional[str] = None             # Kode bank, e.g. '014' = BCA
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None           # Kantor cabang pembuatan bank
    bank_account_number: Optional[str] = None
    bank_account_name: Optional[str] = None
