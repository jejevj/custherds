import uuid
from typing import Optional
from datetime import datetime, date, time
from pydantic import BaseModel


class BookingCreate(BaseModel):
    vendor_id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    booking_date: date
    booking_time: Optional[time] = None
    pax_count: int = 1
    tourist_names: Optional[str] = None
    tourist_nationality: Optional[str] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: uuid.UUID
    booking_code: str
    guide_id: uuid.UUID
    vendor_id: uuid.UUID
    product_id: Optional[uuid.UUID]
    booking_date: date
    booking_time: Optional[time]
    pax_count: int
    tourist_names: Optional[str]
    tourist_nationality: Optional[str]
    notes: Optional[str]
    status: str
    vendor_approval_at: Optional[datetime]
    vendor_rejection_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BookingVendorAction(BaseModel):
    action: str  # "approve" | "reject"
    rejection_reason: Optional[str] = None
