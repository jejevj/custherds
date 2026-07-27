from sqlalchemy import (
    Boolean, Column, DateTime, Enum,
    ForeignKey, Integer, String, Text, ARRAY,
)
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class EmailFolder(str, enum.Enum):
    inbox  = "inbox"
    sent   = "sent"
    draft  = "draft"
    trash  = "trash"
    spam   = "spam"


class EmailMessage(Base):
    """
    Satu pesan email — baik yang diterima maupun yang dikirim.
    to_addresses, cc_addresses, bcc_addresses disimpan sebagai
    array string PostgreSQL (mis. ["a@x.com", "b@x.com"]).
    """

    __tablename__ = "email_messages"

    id             = Column(Integer, primary_key=True, index=True)
    config_id      = Column(Integer, ForeignKey("email_configs.id", ondelete="SET NULL"), nullable=True, index=True)

    # RFC5322 identifier
    message_id     = Column(String(500), nullable=True, unique=True, index=True)

    # Alamat
    from_address   = Column(String(255), nullable=False)
    from_name      = Column(String(255), nullable=True)
    to_addresses   = Column(PG_ARRAY(String), nullable=False, default=list)
    cc_addresses   = Column(PG_ARRAY(String), nullable=False, default=list)
    bcc_addresses  = Column(PG_ARRAY(String), nullable=False, default=list)

    # Konten
    subject        = Column(String(998), nullable=False, default="")
    body_text      = Column(Text, nullable=True)
    body_html      = Column(Text, nullable=True)

    # Status
    folder         = Column(Enum(EmailFolder), nullable=False, default=EmailFolder.inbox, index=True)
    is_read        = Column(Boolean, default=False, nullable=False, index=True)
    is_starred     = Column(Boolean, default=False, nullable=False)

    # Reply thread
    reply_to_id    = Column(Integer, ForeignKey("email_messages.id", ondelete="SET NULL"), nullable=True)

    received_at    = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    config         = relationship("EmailConfig", back_populates="messages")
    attachments    = relationship("EmailAttachment", back_populates="message", cascade="all, delete-orphan")
    replies        = relationship("EmailMessage", foreign_keys=[reply_to_id])
