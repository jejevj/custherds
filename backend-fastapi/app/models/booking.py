import uuid
from sqlalchemy import Column, String, Integer, Date, Time, Text, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Booking(Base):
    """
    Reservasi dibuat Guide, diapprove Vendor.

    booking_type:
    - "direct"  : Guide booking langsung ke vendor tanpa package.
    - "package" : Guide memilih package vendor.

    Status lifecycle:
    pending_vendor
        → confirmed          (vendor approve)
        → pending_receipt    (guide checkin hari-H)
        → pending_completion (guide upload receipt/bukti kunjungan)
        → completed          (vendor konfirmasi selesai)

    Dari pending_vendor  : bisa → rejected
    Dari confirmed/pending_receipt/pending_completion : bisa → cancelled

    tx_attempt: jumlah berapa kali vendor reject transaksi guide.
    Jika tx_attempt >= 3 maka booking otomatis rejected.
    """
    __tablename__ = "bookings"

    id                      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_code            = Column(String(20), unique=True, nullable=False, index=True)
    guide_id                = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)
    vendor_id               = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Tipe booking
    booking_type            = Column(String(10), default="direct", nullable=False)  # "direct" | "package"
    package_id              = Column(UUID(as_uuid=True), ForeignKey("packages.id", ondelete="SET NULL"), nullable=True, index=True)
    package_price_snapshot  = Column(Numeric(15, 2), nullable=True)
    subtotal_package        = Column(Numeric(15, 2), nullable=True)

    # Jadwal & turis
    booking_date            = Column(Date, nullable=False)
    booking_time            = Column(Time, nullable=True)
    pax_count               = Column(Integer, default=1, nullable=False)
    tourist_names           = Column(Text, nullable=True)
    tourist_nationality     = Column(String(100), nullable=True)
    notes                   = Column(Text, nullable=True)

    # Status
    status                  = Column(String(30), default="pending_vendor", nullable=False, index=True)
    vendor_approval_at      = Column(DateTime(timezone=True), nullable=True)
    vendor_rejection_reason = Column(Text, nullable=True)
    cancelled_by            = Column(String(10), nullable=True)       # "guide" | "vendor" | "admin"
    cancelled_reason        = Column(Text, nullable=True)
    cancelled_at            = Column(DateTime(timezone=True), nullable=True)

    # Checkin & Receipt (flow baru)
    checkin_at              = Column(DateTime(timezone=True), nullable=True)   # saat guide checkin (confirmed → pending_receipt)
    receipt_url             = Column(String(500), nullable=True)               # URL bukti kunjungan yang diupload guide
    receipt_uploaded_at     = Column(DateTime(timezone=True), nullable=True)   # saat guide upload receipt (pending_receipt → pending_completion)
    completed_at            = Column(DateTime(timezone=True), nullable=True)   # saat vendor mark completed (pending_completion → completed)

    # Revisi transaksi: berapa kali vendor reject tx guide (max 3)
    tx_attempt              = Column(Integer, default=0, nullable=False)

    created_at              = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at              = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    guide                   = relationship("Guide", back_populates="bookings")
    vendor                  = relationship("Vendor", back_populates="bookings")
    package                 = relationship("Package", back_populates="bookings")
    transaction             = relationship("Transaction", back_populates="booking", uselist=False)
