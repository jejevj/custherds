import uuid
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class VendorDepositTopup(Base):
    """
    Riwayat top-up saldo deposit vendor (Metode B: Deposit Wallet).
    Vendor top-up via Xendit (QRIS / VA / transfer).
    Status: pending -> paid / failed
    """
    __tablename__ = "vendor_deposit_topups"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_id           = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True)
    amount              = Column(Numeric(15, 2), nullable=False)
    currency            = Column(String(10), default="IDR", nullable=False)
    payment_method      = Column(String(50), nullable=True)
    xendit_invoice_id   = Column(String(255), nullable=True)
    xendit_payment_id   = Column(String(255), nullable=True)
    status              = Column(String(20), default="pending", nullable=False, index=True)
    paid_at             = Column(DateTime(timezone=True), nullable=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    vendor              = relationship("Vendor", back_populates="deposit_topups")
