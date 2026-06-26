from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, UUID4


class TransactionCreate(BaseModel):
    """
    Guide submit nota transaksi setelah kunjungan selesai.

    Untuk package booking:
      - gross_amount = subtotal_package + extra_amount
      - extra_amount + extra_notes diisi jika ada tambahan di luar package

    Untuk direct booking:
      - gross_amount = total yang disepakati
      - extra_amount = None
    """
    booking_id: UUID4
    gross_amount: Decimal
    extra_amount: Optional[Decimal] = None
    extra_notes: Optional[str] = None
    receipt_image: Optional[str] = None
    receipt_notes: Optional[str] = None


class TransactionVendorApprove(BaseModel):
    payment_method: str    # "deposit" | "pay_as_you_go"


class TransactionVendorReject(BaseModel):
    reason: Optional[str] = None


class TransactionResponse(BaseModel):
    id: UUID4
    transaction_code: str
    booking_id: UUID4
    vendor_id: UUID4
    guide_id: UUID4
    gross_amount: Decimal
    extra_amount: Optional[Decimal]
    extra_notes: Optional[str]
    receipt_image: Optional[str]
    receipt_notes: Optional[str]
    vendor_percent_snapshot: Decimal
    guide_percent_snapshot: Decimal
    platform_percent_snapshot: Decimal
    vendor_amount: Decimal
    guide_commission: Decimal
    platform_fee: Decimal
    payment_method: Optional[str]
    xendit_invoice_id: Optional[str]
    xendit_invoice_url: Optional[str]
    vendor_rejection_reason: Optional[str]
    status: str
    vendor_reviewed_at: Optional[datetime]
    paid_at: Optional[datetime]
    settled_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionInvoiceResponse(BaseModel):
    transaction: TransactionResponse
    payment_method: str
    invoice_url: Optional[str]
    xendit_invoice_id: Optional[str]
    message: str
