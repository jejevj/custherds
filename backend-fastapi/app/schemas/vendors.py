from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
import uuid


class VendorProfile(BaseModel):
    id: uuid.UUID
    vendor_business_name: str
    vendor_category: int
    vendor_area: int
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_website: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None
    vendor_cashback_percent: float
    vendor_status: str
    deposit_balance: Decimal

    class Config:
        from_attributes = True


class VendorUpdateRequest(BaseModel):
    vendor_business_name: Optional[str] = None
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_website: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None


class VendorDepositInfo(BaseModel):
    id: uuid.UUID
    vendor_business_name: str
    deposit_balance: Decimal
    deposit_minimum: Optional[Decimal] = None

    class Config:
        from_attributes = True


class VendorPublic(BaseModel):
    """Public vendor info visible to guides — no deposit/financial data."""
    id: uuid.UUID
    vendor_business_name: str
    vendor_category: int
    vendor_area: int
    vendor_location: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None
    vendor_cashback_percent: float
    vendor_website: Optional[str] = None

    class Config:
        from_attributes = True
