import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Package(Base):
    """
    Package wisata yang dibuat oleh Vendor.
    Guide bisa booking langsung ke vendor (direct) atau pilih package ini.

    Quota & availability:
    - available_days / available_slots  : panduan saja, tidak di-enforce ketat
    - quota_per_slot                    : max jumlah BOOKING (bukan pax) yang boleh
                                          berstatus pending_vendor / confirmed
                                          di tanggal + jam + package yang sama
    """
    __tablename__ = "packages"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_id           = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True)

    # Info dasar
    name                = Column(String(255), nullable=False)
    description         = Column(Text, nullable=True)
    price_per_pax       = Column(Numeric(15, 2), nullable=False)
    min_pax             = Column(Integer, default=1, nullable=False)
    max_pax             = Column(Integer, nullable=True)          # null = tidak dibatasi
    duration_minutes    = Column(Integer, nullable=True)

    # Panduan jadwal (informasi, tidak di-enforce)
    available_days      = Column(JSONB, nullable=True)            # ["Mon","Tue","Thu"]
    available_slots     = Column(JSONB, nullable=True)            # ["09:00","14:00"]

    # Quota per slot (jumlah booking, bukan pax)
    quota_per_slot      = Column(Integer, default=1, nullable=False)

    # Info tambahan
    terms               = Column(Text, nullable=True)             # syarat dari vendor
    notes               = Column(Text, nullable=True)             # catatan tambahan
    photo_urls          = Column(JSONB, nullable=True)            # ["url1","url2"]

    is_active           = Column(Boolean, default=True, nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    vendor              = relationship("Vendor", back_populates="packages")
    bookings            = relationship("Booking", back_populates="package")
