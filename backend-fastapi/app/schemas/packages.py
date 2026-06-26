from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, UUID4, field_validator


class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_pax: Decimal
    min_pax: int = 1
    max_pax: Optional[int] = None
    duration_minutes: Optional[int] = None
    available_days: Optional[List[str]] = None    # ["Mon","Tue"]
    available_slots: Optional[List[str]] = None   # ["09:00","14:00"]
    quota_per_slot: int = 1
    terms: Optional[str] = None
    notes: Optional[str] = None
    photo_urls: Optional[List[str]] = None

    @field_validator('price_per_pax')
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('price_per_pax harus lebih dari 0')
        return v

    @field_validator('min_pax')
    @classmethod
    def min_pax_positive(cls, v):
        if v < 1:
            raise ValueError('min_pax minimal 1')
        return v

    @field_validator('quota_per_slot')
    @classmethod
    def quota_positive(cls, v):
        if v < 1:
            raise ValueError('quota_per_slot minimal 1')
        return v


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_pax: Optional[Decimal] = None
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
    id: UUID4
    vendor_id: UUID4
    name: str
    description: Optional[str]
    price_per_pax: Decimal
    min_pax: int
    max_pax: Optional[int]
    duration_minutes: Optional[int]
    available_days: Optional[List[str]]
    available_slots: Optional[List[str]]
    quota_per_slot: int
    terms: Optional[str]
    notes: Optional[str]
    photo_urls: Optional[List[str]]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
