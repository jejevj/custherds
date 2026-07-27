from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class EmailAttachment(Base):
    """
    File lampiran yang terasosiasi dengan satu EmailMessage.
    File fisik disimpan di storage (disk / S3), kolom url menyimpan path-nya.
    """

    __tablename__ = "email_attachments"

    id          = Column(Integer, primary_key=True, index=True)
    message_id  = Column(Integer, ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False, index=True)

    filename    = Column(String(255), nullable=False)
    mime_type   = Column(String(127), nullable=False, default="application/octet-stream")
    size        = Column(BigInteger, nullable=False, default=0)  # bytes
    url         = Column(String(1000), nullable=False)           # path relatif atau URL S3

    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    message     = relationship("EmailMessage", back_populates="attachments")
