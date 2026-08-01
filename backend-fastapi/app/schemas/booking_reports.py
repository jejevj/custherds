import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ── Nested schemas ───────────────────────────────────────────────────────────────────────
class BookingBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    booking_code: str
    booking_date: object  # date
    status: str
    vendor_id: uuid.UUID
    vendor_rejection_reason: Optional[str] = None


class TransactionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    transaction_code: str
    gross_amount: object  # Decimal
    guide_commission: object
    status: str
    receipt_image: Optional[str] = None
    submitted_at: Optional[datetime] = None


# ── Request schemas ────────────────────────────────────────────────────────────────────
class BookingReportCreate(BaseModel):
    """Payload yang dikirim Guide saat membuat laporan."""
    booking_id: uuid.UUID
    description: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "booking_id": "550e8400-e29b-41d4-a716-446655440000",
                "description": "Nominal transaksi yang diinput vendor tidak sesuai dengan yang saya bayarkan.",
            }
        }
    )


class BookingReportAdminUpdate(BaseModel):
    """Payload superadmin untuk update status laporan."""
    status: str                            # 'in_review' | 'resolved' | 'dismissed'
    resolution_notes: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "resolved",
                "resolution_notes": "Sudah dikonfirmasi ke vendor. Nominal transaksi telah dikoreksi.",
            }
        }
    )


# ── Response schema ────────────────────────────────────────────────────────────────────
class BookingReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    report_code: str
    booking_id: uuid.UUID
    guide_id: uuid.UUID
    transaction_id: Optional[uuid.UUID] = None
    report_type: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    reviewed_by: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Embedded detail (bisa None jika relasi belum di-load)
    booking: Optional[BookingBrief] = None
    transaction: Optional[TransactionBrief] = None

    # Info guide pelapor — di-populate dari guide.user
    guide_email: Optional[str] = None
    guide_name: Optional[str] = None
