import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class BookingReport(Base):
    """
    Laporan yang dibuat Guide terhadap booking miliknya sendiri.

    Hanya bisa dibuat jika status booking == 'completed' atau 'rejected'.
    Satu booking hanya bisa dilaporkan satu kali (UNIQUE booking_id).

    report_type:
    - 'transaction_dispute' : keberatan terhadap nominal / kuitansi (booking completed)
    - 'unfair_rejection'    : penolakannya dianggap tidak wajar    (booking rejected)

    Status lifecycle:
    open -> in_review -> resolved
                      -> dismissed
    """
    __tablename__ = "booking_reports"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_code       = Column(String(30), unique=True, nullable=False, index=True)

    booking_id        = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="RESTRICT"),
        unique=True,          # Satu booking hanya boleh punya satu laporan
        nullable=False,
        index=True,
    )
    guide_id          = Column(
        UUID(as_uuid=True),
        ForeignKey("guides.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    # transaction_id di-set otomatis oleh backend jika booking.transaction ada
    transaction_id    = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    report_type       = Column(String(30), nullable=False)  # 'transaction_dispute' | 'unfair_rejection'
    description       = Column(Text, nullable=False)         # Uraian masalah dari guide

    status            = Column(String(20), default="open", nullable=False, index=True)
    # 'open' | 'in_review' | 'resolved' | 'dismissed'

    resolution_notes  = Column(Text, nullable=True)          # Catatan superadmin
    reviewed_by       = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at       = Column(DateTime(timezone=True), nullable=True)

    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    booking           = relationship("Booking",     foreign_keys=[booking_id])
    guide             = relationship("Guide",        foreign_keys=[guide_id])
    transaction       = relationship("Transaction",  foreign_keys=[transaction_id])
    reviewer          = relationship("User",         foreign_keys=[reviewed_by])
