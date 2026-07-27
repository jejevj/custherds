from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class EmailProvider(str, enum.Enum):
    smtp      = "smtp"
    sendgrid  = "sendgrid"
    mailgun   = "mailgun"
    ses       = "ses"
    resend    = "resend"


class EmailConfig(Base):
    """
    Konfigurasi koneksi email / SMTP yang dipakai untuk mengirim email.
    Bisa ada banyak config, tapi hanya satu yang is_default=True.
    Password disimpan terenkripsi di kolom password_encrypted.
    """

    __tablename__ = "email_configs"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String(100), nullable=False)          # label tampilan
    provider          = Column(
        Enum(EmailProvider),
        nullable=False,
        default=EmailProvider.smtp,
    )

    # SMTP
    host              = Column(String(255), nullable=True)
    port              = Column(Integer, nullable=True, default=587)
    use_tls           = Column(Boolean, default=True, nullable=False)

    # Auth
    username          = Column(String(255), nullable=False)
    password_encrypted = Column(Text, nullable=False)               # Fernet / AES encrypted

    # Pengirim
    from_address      = Column(String(255), nullable=False)
    from_name         = Column(String(100), nullable=True)

    # Status
    is_default        = Column(Boolean, default=False, nullable=False, index=True)
    is_active         = Column(Boolean, default=True,  nullable=False)

    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    messages          = relationship("EmailMessage", back_populates="config", lazy="dynamic")
