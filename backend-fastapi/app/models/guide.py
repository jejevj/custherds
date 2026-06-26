import uuid
from sqlalchemy import Column, String, Float, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Guide(Base):
    """
    Profil tambahan untuk user_type=1.

    guide_status lifecycle:
      incomplete  -> user baru login, belum melengkapi dokumen
      pending     -> semua dokumen sudah diisi, menunggu review admin
      approved    -> admin approve, is_verified=True di User
      rejected    -> admin tolak, user harus perbaiki data

    wallet_balance: saldo dompet digital guide (komisi masuk, belum di-withdraw).
    """
    __tablename__ = "guides"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id                     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # --- Status onboarding & verifikasi ---
    guide_status                = Column(String(20), default="incomplete", nullable=False)
    rejection_notes             = Column(Text, nullable=True)

    # --- Data pribadi & dokumen ---
    guide_nationality           = Column(String(100), nullable=True)
    guide_phone                 = Column(String(30), nullable=True)
    guide_id_card_url           = Column(String(500), nullable=True)   # URL KTP / Paspor
    guide_certificate           = Column(String(500), nullable=True)   # URL sertifikat guide
    guide_certificate_status    = Column(String(20), default="incomplete", nullable=False)  # kept for backward compat

    # --- Profil publik ---
    bio                         = Column(String, nullable=True)
    languages                   = Column(String(255), nullable=True)
    rating                      = Column(Float, nullable=True)

    # --- Keuangan ---
    total_earnings              = Column(Numeric(15, 2), default=0, nullable=False)
    pending_earnings            = Column(Numeric(15, 2), default=0, nullable=False)
    wallet_balance              = Column(Numeric(15, 2), default=0, nullable=False)
    bank_name                   = Column(String(100), nullable=True)
    bank_account_number         = Column(String(50), nullable=True)
    bank_account_name           = Column(String(255), nullable=True)

    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user                        = relationship("User", back_populates="guide")
    bookings                    = relationship("Booking", back_populates="guide")
    transactions                = relationship("Transaction", back_populates="guide")
    disbursements               = relationship("CommissionDisbursement", back_populates="guide")
    withdrawals                 = relationship("GuideWithdrawal", back_populates="guide")
