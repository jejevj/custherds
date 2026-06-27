from typing import Optional
from decimal import Decimal
from datetime import date, time, datetime
from pydantic import BaseModel, UUID4, computed_field


class BookingCreate(BaseModel):
    """
    booking_type = "direct"  : isi vendor_id + jadwal, package_id = None
    booking_type = "package" : isi vendor_id + package_id + jadwal
    """
    vendor_id: UUID4
    booking_type: str = "direct"          # "direct" | "package"
    package_id: Optional[UUID4] = None
    booking_date: date
    booking_time: Optional[time] = None
    pax_count: int = 1
    tourist_names: Optional[str] = None
    tourist_nationality: Optional[str] = None
    notes: Optional[str] = None


class BookingVendorAction(BaseModel):
    action: str                            # "approve" | "reject"
    rejection_reason: Optional[str] = None


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None


class BookingCheckinRequest(BaseModel):
    """Vendor checkin guide yang datang. confirmed → pending_receipt."""
    notes: Optional[str] = None


# BookingReceiptUpload dihapus — diganti submit-transaction (multipart form)


class BookingResponse(BaseModel):
    id: UUID4
    booking_code: str
    guide_id: UUID4
    vendor_id: UUID4
    booking_type: str
    package_id: Optional[UUID4]
    package_price_snapshot: Optional[Decimal]
    subtotal_package: Optional[Decimal]
    booking_date: date
    booking_time: Optional[time]
    pax_count: int
    tourist_names: Optional[str]
    tourist_nationality: Optional[str]
    notes: Optional[str]
    status: str
    vendor_approval_at: Optional[datetime]
    vendor_rejection_reason: Optional[str]
    cancelled_by: Optional[str]
    cancelled_reason: Optional[str]
    cancelled_at: Optional[datetime]

    # Checkin & Receipt fields
    checkin_at: Optional[datetime]
    receipt_url: Optional[str]          # path API: /api/v1/uploads/<filename>
    receipt_uploaded_at: Optional[datetime]
    completed_at: Optional[datetime]

    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def total_price(self) -> Optional[Decimal]:
        """
        Computed total price:
        - booking_type = "package" : subtotal_package (price_per_pax * pax_count)
        - booking_type = "direct"  : None, diisi saat guide submit transaksi
        """
        if self.subtotal_package is not None:
            return self.subtotal_package
        return None

    class Config:
        from_attributes = True
