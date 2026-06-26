import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_code = Column(String(20), unique=True, nullable=False, index=True)

    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False)
    vendor_id  = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)
    guide_id   = Column(UUID(as_uuid=True), ForeignKey("guides.id"),  nullable=False)

    gross_amount = Column(Numeric(14, 2), nullable=False)
    currency     = Column(String(3), default="IDR", nullable=False)

    # Receipt dari guide
    receipt_image = Column(Text, nullable=False)
    receipt_notes = Column(Text)

    # Snapshot split config
    split_config_id              = Column(UUID(as_uuid=True), ForeignKey("revenue_split_configs.id"))
    vendor_percent_snapshot      = Column(Numeric(5, 2), nullable=False)
    guide_percent_snapshot       = Column(Numeric(5, 2), nullable=False)
    platform_percent_snapshot    = Column(Numeric(5, 2), nullable=False)

    # Hasil kalkulasi
    vendor_amount    = Column(Numeric(14, 2))
    guide_commission = Column(Numeric(14, 2))
    platform_fee     = Column(Numeric(14, 2))

    # Status & pembayaran
    status         = Column(String(30), nullable=False, default="pending_vendor_approval", index=True)
    payment_method = Column(String(20))  # deposit | pay_as_you_go

    # Xendit Invoice (untuk pay_as_you_go)
    xendit_invoice_id  = Column(String(100), index=True)
    xendit_invoice_url = Column(Text)

    # Timestamps
    submitted_at          = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    vendor_reviewed_at    = Column(DateTime(timezone=True))
    vendor_rejection_reason = Column(Text)
    paid_at               = Column(DateTime(timezone=True))
    settled_at            = Column(DateTime(timezone=True))
    created_at            = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at            = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    booking      = relationship("Booking",             back_populates="transaction",  foreign_keys=[booking_id])
    vendor       = relationship("Vendor",              back_populates="transactions", foreign_keys=[vendor_id])
    guide        = relationship("Guide",               back_populates="transactions", foreign_keys=[guide_id])
    split_config = relationship("RevenueSplitConfig",  back_populates="transactions", foreign_keys=[split_config_id])
