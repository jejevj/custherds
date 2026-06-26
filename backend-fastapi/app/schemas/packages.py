from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_pax: float
    min_pax: int = 1
    max_pax: Optional[int] = None
    duration_minutes: Optional[int] = None
    available_days: List[str] = []
    available_slots: List[str] = []
    quota_per_slot: int = 1
    terms: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: List[str] = []


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_pax: Optional[float] = None
    min_pax: Optional[int] = None
    max_pax: Optional[int] = None
    duration_minutes: Optional[int] = None
    available_days: Optional[List[str]] = None
    available_slots: Optional[List[str]] = None
    quota_per_slot: Optional[int] = None
    terms: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    is_active: Optional[bool] = None


class PackageResponse(BaseModel):
    id: uuid.UUID
    vendor_id: uuid.UUID
    name: str
    description: Optional[str] = None
    price_per_pax: float
    min_pax: int
    max_pax: Optional[int] = None
    duration_minutes: Optional[int] = None
    available_days: Optional[List[str]] = None
    available_slots: Optional[List[str]] = None
    quota_per_slot: int
    terms: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PackageBrowse(BaseModel):
    """Package data enriched with commission info for guide browse."""
    id: uuid.UUID
    vendor_id: uuid.UUID
    vendor_name: str
    vendor_location: Optional[str] = None
    vendor_allow_direct_booking: bool = True
    name: str
    description: Optional[str] = None
    price_per_pax: float
    commission_per_pax: float
    guide_percent: float
    min_pax: int
    max_pax: Optional[int] = None
    duration_minutes: Optional[int] = None
    available_days: List[str] = []
    available_slots: List[str] = []
    quota_per_slot: int
    terms: Optional[str] = None
    photo_urls: List[str] = []
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
