import uuid
from sqlalchemy import Column, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class RevenueSplitConfig(Base):
    """
    Konfigurasi persentase bagi hasil yang dikelola Superadmin.
    Constraint: vendor_percent + guide_percent + platform_percent == 100.0
    Hanya satu record yang boleh is_active=True pada satu waktu.
    Histori disimpan — transaksi lama tidak terpengaruh perubahan.
    """
    __tablename__ = "revenue_split_configs"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_percent      = Column(Float, nullable=False)    # e.g. 85.0
    guide_percent       = Column(Float, nullable=False)    # e.g. 10.0
    platform_percent    = Column(Float, nullable=False)    # e.g.  5.0
    is_active           = Column(Boolean, default=False, nullable=False, index=True)
    notes               = Column(Text, nullable=True)      # alasan perubahan
    set_by              = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    effective_from      = Column(DateTime(timezone=True), nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    set_by_user         = relationship("User", foreign_keys=[set_by], back_populates="split_configs")
    transactions        = relationship("Transaction", back_populates="split_config")
