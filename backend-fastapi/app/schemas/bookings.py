from typing import Optional
from decimal import Decimal
from datetime import date, time, datetime
from pydantic import BaseModel, UUID4, computed_field

TX_MAX_ATTEMPT = 3


class BookingCreate(BaseModel):
    """
    booking_type = "direct"  : isi vendor_id + jadwal.
                               Opsional: direct_price (harga per-pax yang disepakati).
                               Jika tidak diisi, fallback ke vendor_min_spend.
    booking_type = "package" : isi vendor_id + package_id + jadwal.
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
    # Harga per-pax yang disepakati untuk direct booking.
    # Jika None, akan di-fallback ke vendor_min_spend (jika ada).
    direct_price: Optional[Decimal] = None


class BookingVendorAction(BaseModel):
    action: str                            # "approve" | "reject"
    rejection_reason: Optional[str] = None


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None


class BookingCheckinRequest(BaseModel):
    """Vendor checkin guide yang datang. confirmed -> pending_receipt."""
    booking_code: str


class BookingResponse(BaseModel):
    id: UUID4
    booking_code: str
    guide_id: UUID4
    vendor_id: UUID4
    booking_type: str
    package_id: Optional[UUID4]
    package_price_snapshot: Optional[Decimal]
    subtotal_package: Optional[Decimal]

    # Direct booking pricing
    direct_price_snapshot: Optional[Decimal]
    subtotal_direct: Optional[Decimal]

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
    receipt_url: Optional[str]
    receipt_uploaded_at: Optional[datetime]
    completed_at: Optional[datetime]

    # Revisi transaksi
    tx_attempt: int = 0
    tx_attempt_max: int = TX_MAX_ATTEMPT

    created_at: datetime
    updated_at: datetime

    # Estimasi komisi guide: total_price x guide_percent / 100
    estimated_commission: Optional[Decimal] = None

    @computed_field
    @property
    def total_price(self) -> Optional[Decimal]:
        """Harga total booking. Untuk package: subtotal_package. Untuk direct: subtotal_direct."""
        if self.subtotal_package is not None:
            return self.subtotal_package
        if self.subtotal_direct is not None:
            return self.subtotal_direct
        return None

    class Config:
        from_attributes = True
