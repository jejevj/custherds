from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
import uuid


class VendorProfile(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    vendor_business_name: str
    vendor_category: int
    vendor_area: int
    vendor_location: Optional[str]
    vendor_contact_person: Optional[str]
    vendor_website: Optional[str]
    vendor_short_description: Optional[str]
    vendor_opening_hours: Optional[str]
    vendor_min_spend: Optional[Decimal]
    vendor_cashback_percent: float
    vendor_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VendorDepositInfo(BaseModel):
    id: uuid.UUID
    deposit_balance: Decimal
    deposit_minimum: Optional[Decimal]

    class Config:
        from_attributes = True


class VendorUpdateRequest(BaseModel):
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_website: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None
