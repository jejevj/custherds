import uuid
from sqlalchemy import Column, String, Float, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Transaction(Base):
    """
    Model Invoice-Clearing / Reimbursement:

    [1] Guide foto nota + input nominal  -> status: pending_vendor_approval
    [2] Vendor verifikasi nota:
        - Tolak            -> status: rejected
        - Approve Metode A -> status: payment_pending (Xendit QRIS/VA)
                          -> setelah bayar: paid -> settled
        - Approve Metode B -> status: settled (potong deposit instan)
    [3] Saat settled:
        guide_commission  -> guides.wallet_balance (+)
        platform_fee      -> akun master platform
    [4] Guide tarik dana kapan saja -> GuideWithdrawal
    """
    __tablename__ = "transactions"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    transaction_code            = Column(String(30), unique=True, nullable=False, index=True)
    booking_id                  = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True, nullable=False)
    vendor_id                   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    guide_id                    = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)
    gross_amount                = Column(Numeric(15, 2), nullable=False)
    currency                    = Column(String(10), default="IDR", nullable=False)
    receipt_image               = Column(String(500), nullable=False)
    receipt_notes               = Column(Text, nullable=True)
    split_config_id             = Column(UUID(as_uuid=True), ForeignKey("revenue_split_configs.id", ondelete="RESTRICT"), nullable=False)
    vendor_percent_snapshot     = Column(Float, nullable=False)
    guide_percent_snapshot      = Column(Float, nullable=False)
    platform_percent_snapshot   = Column(Float, nullable=False)
    vendor_amount               = Column(Numeric(15, 2), nullable=True)
    guide_commission            = Column(Numeric(15, 2), nullable=True)
    platform_fee                = Column(Numeric(15, 2), nullable=True)
    status                      = Column(String(30), default="pending_vendor_approval", nullable=False, index=True)
    payment_method              = Column(String(30), nullable=True)  # deposit | pay_as_you_go
    xendit_invoice_id           = Column(String(255), nullable=True)
    xendit_payment_id           = Column(String(255), nullable=True)
    paid_at                     = Column(DateTime(timezone=True), nullable=True)
    submitted_at                = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    vendor_reviewed_at          = Column(DateTime(timezone=True), nullable=True)
    vendor_rejection_reason     = Column(Text, nullable=True)
    settled_at                  = Column(DateTime(timezone=True), nullable=True)
    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    booking                     = relationship("Booking", back_populates="transaction")
    vendor                      = relationship("Vendor", back_populates="transactions")
    guide                       = relationship("Guide", back_populates="transactions")
    split_config                = relationship("RevenueSplitConfig", back_populates="transactions")
    disbursement_items          = relationship("CommissionDisbursementItem", back_populates="transaction")
