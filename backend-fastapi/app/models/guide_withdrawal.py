import uuid
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class GuideWithdrawal(Base):
    """
    Permintaan penarikan dana guide dari wallet platform ke rekening bank asli.
    Guide klik Withdraw -> sistem kirim via Xendit Disbursement.
    Status: pending -> processing -> completed / failed
    """
    __tablename__ = "guide_withdrawals"

    id                      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    guide_id                = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount                  = Column(Numeric(15, 2), nullable=False)
    bank_name               = Column(String(100), nullable=False)
    bank_account_number     = Column(String(50), nullable=False)
    bank_account_name       = Column(String(255), nullable=False)
    xendit_disbursement_id  = Column(String(255), nullable=True)
    status                  = Column(String(20), default="pending", nullable=False, index=True)
    processed_by            = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processed_at            = Column(DateTime(timezone=True), nullable=True)
    notes                   = Column(Text, nullable=True)
    created_at              = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at              = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    guide                   = relationship("Guide", back_populates="withdrawals")
    processor               = relationship("User", foreign_keys=[processed_by])
