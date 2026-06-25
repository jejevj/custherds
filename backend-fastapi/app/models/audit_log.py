import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class AuditLog(Base):
    """
    Riwayat semua aksi penting untuk audit superadmin.
    """
    __tablename__ = "audit_logs"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    actor_id        = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action          = Column(String(100), nullable=False, index=True)
    target_type     = Column(String(50), nullable=False)
    target_id       = Column(UUID(as_uuid=True), nullable=False, index=True)
    before_state    = Column(Text, nullable=True)
    after_state     = Column(Text, nullable=True)
    ip_address      = Column(String(45), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor           = relationship("User", foreign_keys=[actor_id], back_populates="audit_logs")
