from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
import uuid


class VendorProfile(BaseModel):
    id: uuid.UUID
    vendor_status: str
    approval_notes: Optional[str] = None
    vendor_business_name: str
    vendor_category: int
    vendor_area: int
    vendor_npwp: Optional[str] = None
    vendor_nib: Optional[str] = None
    vendor_owner_id_card_url: Optional[str] = None
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_website: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None
    vendor_cashback_percent: float
    deposit_balance: Decimal
    gallery_urls: Optional[List[str]] = []
    allow_direct_booking: bool = True

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
    vendor_npwp: Optional[str] = None
    vendor_nib: Optional[str] = None
    vendor_owner_id_card_url: Optional[str] = None
    allow_direct_booking: Optional[bool] = None
    gallery_urls: Optional[List[str]] = None


class VendorSubmitRequest(BaseModel):
    vendor_business_name: str
    vendor_location: str
    vendor_contact_person: str
    vendor_npwp: str
    vendor_nib: str
    vendor_owner_id_card_url: str
    vendor_short_description: str


class VendorDepositInfo(BaseModel):
    id: uuid.UUID
    vendor_business_name: str
    deposit_balance: Decimal
    deposit_minimum: Optional[Decimal] = None

    class Config:
        from_attributes = True


class VendorPublic(BaseModel):
    """Public vendor info visible to guides — list view."""
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
    allow_direct_booking: bool = True
    package_count: int = 0
    max_commission_per_pax: Optional[float] = None
    cover_photo: Optional[str] = None

    class Config:
        from_attributes = True


class PackagePublic(BaseModel):
    """Package info shown inside vendor detail page."""
    id: uuid.UUID
    package_name: str
    package_description: Optional[str] = None
    price_per_pax: Decimal
    min_pax: Optional[int] = None
    max_pax: Optional[int] = None
    duration_hours: Optional[float] = None
    photo_urls: Optional[List[str]] = None
    is_active: bool
    guide_commission_per_pax: Optional[float] = None

    class Config:
        from_attributes = True


class VendorDetail(BaseModel):
    """Full vendor detail for guide — includes gallery + packages."""
    id: uuid.UUID
    vendor_business_name: str
    vendor_category: int
    vendor_area: int
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_min_spend: Optional[Decimal] = None
    vendor_cashback_percent: float
    vendor_website: Optional[str] = None
    allow_direct_booking: bool = True
    cover_photo: Optional[str] = None
    gallery_urls: List[str] = []
    packages: List[PackagePublic] = []

    class Config:
        from_attributes = True
