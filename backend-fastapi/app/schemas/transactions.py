import uuid
from typing import Optional, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    booking_id: uuid.UUID
    gross_amount: float
    receipt_image: str
    receipt_notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: uuid.UUID
    transaction_code: str
    booking_id: uuid.UUID
    vendor_id: uuid.UUID
    guide_id: uuid.UUID
    gross_amount: Decimal
    currency: str
    receipt_image: str
    receipt_notes: Optional[str]
    vendor_percent_snapshot: float
    guide_percent_snapshot: float
    platform_percent_snapshot: float
    vendor_amount: Optional[Decimal]
    guide_commission: Optional[Decimal]
    platform_fee: Optional[Decimal]
    status: str
    payment_method: Optional[str]
    xendit_invoice_id: Optional[str]
    xendit_invoice_url: Optional[str]
    paid_at: Optional[datetime]
    submitted_at: datetime
    vendor_reviewed_at: Optional[datetime]
    vendor_rejection_reason: Optional[str]
    settled_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionVendorApprove(BaseModel):
    payment_method: str
    """
    Metode pembayaran:
    - **deposit**: Potong saldo deposit vendor (instan)
    - **pay_as_you_go**: Buat Xendit Invoice, bayar via link
    """


class TransactionVendorReject(BaseModel):
    reason: str


class TransactionInvoiceResponse(BaseModel):
    transaction: TransactionResponse
    payment_method: str
    invoice_url: Optional[str] = None
    xendit_invoice_id: Optional[str] = None
    message: str

    class Config:
        from_attributes = True
