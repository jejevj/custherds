"""
Utility: kirim email transaksional via SMTP config default di database.
Digunakan oleh auth register, approval, dll.
"""
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from sqlalchemy.orm import Session

from app.models.email_config import EmailConfig
from app.models.email_message import EmailFolder, EmailMessage
from app.core.security import decrypt_password

DEFAULT_BCC = ["custherds@gmail.com","diodamarseto@gmail.com","wijaya.angga.j@gmail.com"]


def send_transactional_email(
    db: Session,
    to_address: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None,
    from_name_override: Optional[str] = None,
    bcc_addresses: Optional[list[str]] = None,
) -> bool:
    """
    Kirim email via SMTP config default yang aktif.
    Simpan ke email_messages (folder=sent) sebagai log.
    BCC default ke custherds@gmail.com untuk monitoring internal.
    Return True jika berhasil, False jika gagal (tidak raise Exception).
    """
    config: Optional[EmailConfig] = (
        db.query(EmailConfig)
        .filter(EmailConfig.is_active == True, EmailConfig.is_default == True)
        .first()
    )
    if not config:
        # fallback: ambil config aktif pertama
        config = db.query(EmailConfig).filter(EmailConfig.is_active == True).first()
    if not config or config.provider.value != "smtp":
        return False

    from_name = from_name_override or config.from_name or "Custherds"

    # Gabungkan BCC: default + tambahan dari caller
    final_bcc = list(DEFAULT_BCC)
    if bcc_addresses:
        for addr in bcc_addresses:
            if addr not in final_bcc:
                final_bcc.append(addr)

    msg = MIMEMultipart("alternative")
    msg["From"]    = f"{from_name} <{config.from_address}>"
    msg["To"]      = to_address
    msg["Subject"] = subject
    # BCC tidak ditambahkan ke header msg (by design — agar tidak terlihat penerima lain)
    if body_text:
        msg.attach(MIMEText(body_text, "plain"))
    msg.attach(MIMEText(body_html, "html"))

    all_recipients = [to_address] + final_bcc

    try:
        password = decrypt_password(config.password_encrypted)
        with smtplib.SMTP(config.host, config.port, timeout=30) as server:
            if config.use_tls:
                server.starttls()
            server.login(config.username, password)
            server.sendmail(config.from_address, all_recipients, msg.as_string())
    except Exception:
        return False

    # Log ke email_messages
    try:
        db.add(EmailMessage(
            config_id=config.id,
            message_id=f"<{uuid.uuid4().hex}@custherds>",
            from_address=config.from_address,
            from_name=from_name,
            to_addresses=[to_address],
            cc_addresses=[],
            bcc_addresses=final_bcc,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            folder=EmailFolder.sent,
            is_read=True,
        ))
        db.commit()
    except Exception:
        pass

    return True
