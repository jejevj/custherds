import uuid
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Transaction(Base):
    """
    Nota transaksi disubmit Guide setelah kunjungan selesai.

    Untuk package booking:
      gross_amount = subtotal_package + extra_amount
      extra_amount  = tambahan order di luar package (nullable)

    Untuk direct booking:
      gross_amount = nominal total yang guide input
      extra_amount = None

    Split revenue:
      vendor_amount    = gross_amount × vendor_percent / 100
      guide_commission = gross_amount × guide_percent  / 100
      platform_fee     = gross_amount × platform_percent / 100

    Status lifecycle:
      pending_vendor_approval
        → approved (vendor approve, pilih metode bayar)
          → payment_pending  (pay_as_you_go, tunggu xendit webhook)
          → settled          (deposit langsung atau xendit PAID)
        → rejected (vendor reject)
    """
    __tablename__ = "transactions"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_code            = Column(String(20), unique=True, nullable=False, index=True)
    booking_id                  = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True, nullable=False)
    vendor_id                   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    guide_id                    = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Nominal
    gross_amount                = Column(Numeric(15, 2), nullable=False)   # total akhir
    extra_amount                = Column(Numeric(15, 2), nullable=True)    # tambahan di luar package
    extra_notes                 = Column(Text, nullable=True)              # keterangan extra

    # Bukti
    receipt_image               = Column(String(500), nullable=True)
    receipt_notes               = Column(Text, nullable=True)

    # Split config snapshot
    split_config_id             = Column(UUID(as_uuid=True), ForeignKey("revenue_split_configs.id", ondelete="SET NULL"), nullable=True)
    vendor_percent_snapshot     = Column(Numeric(5, 2), nullable=False)
    guide_percent_snapshot      = Column(Numeric(5, 2), nullable=False)
    platform_percent_snapshot   = Column(Numeric(5, 2), nullable=False)

    # Hasil split
    vendor_amount               = Column(Numeric(15, 2), nullable=False)
    guide_commission            = Column(Numeric(15, 2), nullable=False)
    platform_fee                = Column(Numeric(15, 2), nullable=False)

    # Payment
    payment_method              = Column(String(20), nullable=True)        # "deposit" | "pay_as_you_go"
    xendit_invoice_id           = Column(String(255), nullable=True)
    xendit_invoice_url          = Column(String(500), nullable=True)
    vendor_rejection_reason     = Column(Text, nullable=True)

    # Status
    status                      = Column(String(30), default="pending_vendor_approval", nullable=False, index=True)
    vendor_reviewed_at          = Column(DateTime(timezone=True), nullable=True)
    paid_at                     = Column(DateTime(timezone=True), nullable=True)
    settled_at                  = Column(DateTime(timezone=True), nullable=True)

    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    booking                     = relationship("Booking", back_populates="transaction")
    vendor                      = relationship("Vendor", back_populates="transactions")
    guide                       = relationship("Guide", back_populates="transactions")
    split_config                = relationship("RevenueSplitConfig", back_populates="transactions")
