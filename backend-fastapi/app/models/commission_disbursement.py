import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class CommissionDisbursement(Base):
    """
    Batch pembayaran komisi ke guide, periodik mingguan/bulanan.
    Status: pending → processing → completed / failed
    """
    __tablename__ = "commission_disbursements"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    guide_id                    = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)
    period_start                = Column(DateTime(timezone=True), nullable=False)
    period_end                  = Column(DateTime(timezone=True), nullable=False)
    total_amount                = Column(Numeric(15, 2), nullable=False)
    transaction_count           = Column(Integer, nullable=False, default=0)
    bank_name                   = Column(String(100), nullable=False)
    bank_account_number         = Column(String(50), nullable=False)
    bank_account_name           = Column(String(255), nullable=False)
    xendit_disbursement_id      = Column(String(255), nullable=True)
    status                      = Column(String(20), default="pending", nullable=False, index=True)
    processed_by                = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processed_at                = Column(DateTime(timezone=True), nullable=True)
    notes                       = Column(Text, nullable=True)
    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    guide                       = relationship("Guide", back_populates="disbursements")
    processor                   = relationship("User", foreign_keys=[processed_by])
    items                       = relationship("CommissionDisbursementItem", back_populates="disbursement", cascade="all, delete-orphan")


class CommissionDisbursementItem(Base):
    __tablename__ = "commission_disbursement_items"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disbursement_id     = Column(UUID(as_uuid=True), ForeignKey("commission_disbursements.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id      = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="RESTRICT"), nullable=False, index=True)
    guide_commission    = Column(Numeric(15, 2), nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    disbursement        = relationship("CommissionDisbursement", back_populates="items")
    # back_populates dihapus — Transaction tidak punya disbursement_items relationship
    transaction         = relationship("Transaction", foreign_keys=[transaction_id])
