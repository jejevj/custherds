import uuid
from sqlalchemy import Column, String, Integer, Float, Numeric, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Vendor(Base):
    """
    Profil bisnis untuk user_type=2.

    vendor_status lifecycle:
      incomplete  -> user baru register, belum melengkapi dokumen wajib
      pending     -> dokumen lengkap, menunggu review admin
      approved    -> admin approve, is_verified=True di User
      rejected    -> admin tolak, user harus perbaiki

    deposit_balance: saldo wallet deposit untuk Metode B (Deposit Wallet).

    allow_direct_booking:
      True  -> Guide boleh booking langsung tanpa memilih package (booking_type="direct")
      False -> Guide WAJIB memilih package; direct booking ditolak oleh API

    gallery_urls:
      Array URL foto tempat/galeri vendor. Ditampilkan ke guide saat browse detail.
    """
    __tablename__ = "vendors"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id                     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # --- Status onboarding & verifikasi ---
    vendor_status               = Column(String(20), default="incomplete", nullable=False)
    approval_notes              = Column(Text, nullable=True)

    # --- Data bisnis wajib ---
    vendor_business_name        = Column(String(255), nullable=False)
    vendor_category             = Column(Integer, nullable=False)
    vendor_area                 = Column(Integer, nullable=False)

    # --- Dokumen legalitas ---
    vendor_npwp                 = Column(String(30), nullable=True)
    vendor_nib                  = Column(String(30), nullable=True)
    vendor_owner_id_card_url    = Column(String(500), nullable=True)

    # --- Info bisnis tambahan ---
    vendor_location             = Column(Text, nullable=True)
    vendor_contact_person       = Column(String(255), nullable=True)
    vendor_website              = Column(String(255), nullable=True)
    vendor_short_description    = Column(Text, nullable=True)
    vendor_opening_hours        = Column(String(255), nullable=True)
    vendor_min_spend            = Column(Numeric(15, 2), nullable=True)
    vendor_cashback_percent     = Column(Float, nullable=False)
    vendor_know_from            = Column(Text, nullable=True)

    # --- Galeri foto tempat ---
    gallery_urls                = Column(JSONB, nullable=True, default=list)

    # --- Keuangan ---
    deposit_balance             = Column(Numeric(15, 2), default=0, nullable=False)
    deposit_minimum             = Column(Numeric(15, 2), nullable=True)

    # --- Pengaturan booking ---
    allow_direct_booking        = Column(Boolean, default=True, nullable=False)

    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user                        = relationship("User", back_populates="vendor")
    packages                    = relationship("Package", back_populates="vendor")
    bookings                    = relationship("Booking", back_populates="vendor")
    transactions                = relationship("Transaction", back_populates="vendor")
    destinations                = relationship("Destination", back_populates="vendor")
    deposit_topups              = relationship("VendorDepositTopup", back_populates="vendor")
