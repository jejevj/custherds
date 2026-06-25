import uuid
from sqlalchemy import Column, String, Float, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Transaction(Base):
    """
    Dibuat oleh Vendor setelah layanan selesai.
    Vendor wajib upload foto kuitansi dan nominal.
    Superadmin melakukan validasi sebelum bagi hasil dihitung.

    Status flow:
        pending_review -> approved -> settled
                       -> rejected  -> (vendor resubmit) -> pending_review
    """
    __tablename__ = "transactions"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_code            = Column(String(30), unique=True, nullable=False, index=True)  # TRX-YYYYMMDD-XXXX
    booking_id                  = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True, nullable=False)
    vendor_id                   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    guide_id                    = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Nominal dari vendor
    gross_amount                = Column(Numeric(15, 2), nullable=False)  # total bayar turis ke vendor
    currency                    = Column(String(10), default="IDR", nullable=False)

    # Bukti transaksi
    receipt_image               = Column(String(500), nullable=False)   # URL object storage
    receipt_notes               = Column(Text, nullable=True)

    # Bagi hasil — config snapshot saat submit
    split_config_id             = Column(UUID(as_uuid=True), ForeignKey("revenue_split_configs.id", ondelete="RESTRICT"), nullable=False)
    vendor_percent_snapshot     = Column(Float, nullable=False)
    guide_percent_snapshot      = Column(Float, nullable=False)
    platform_percent_snapshot   = Column(Float, nullable=False)

    # Nominal hasil kalkulasi (diisi saat approved)
    vendor_amount               = Column(Numeric(15, 2), nullable=True)
    guide_commission            = Column(Numeric(15, 2), nullable=True)
    platform_fee                = Column(Numeric(15, 2), nullable=True)

    # Status & review
    status                      = Column(String(30), default="pending_review", nullable=False, index=True)
    # pending_review | approved | settled | rejected
    submitted_at                = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_by                 = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at                 = Column(DateTime(timezone=True), nullable=True)
    review_notes                = Column(Text, nullable=True)
    rejection_reason            = Column(Text, nullable=True)
    settled_at                  = Column(DateTime(timezone=True), nullable=True)
    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    booking                     = relationship("Booking", back_populates="transaction")
    vendor                      = relationship("Vendor", back_populates="transactions")
    guide                       = relationship("Guide", back_populates="transactions")
    split_config                = relationship("RevenueSplitConfig", back_populates="transactions")
    reviewer                    = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_transactions")
    disbursement_items          = relationship("CommissionDisbursementItem", back_populates="transaction")
