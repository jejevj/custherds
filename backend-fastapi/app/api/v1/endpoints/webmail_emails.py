import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.email_config import EmailConfig
from app.models.email_message import EmailFolder, EmailMessage
from app.schemas.webmail import (
    EmailMessageOut,
    MarkReadPayload,
    MarkStarredPayload,
    MoveFolderPayload,
    PaginatedEmailMessages,
    SendEmailPayload,
    SendEmailResponse,
)

router = APIRouter()


# ── List emails (inbox, sent, dll) ───────────────────────────────────────────

@router.get("/", response_model=PaginatedEmailMessages)
def list_emails(
    folder: EmailFolder = Query(EmailFolder.inbox),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Ambil daftar email pada folder tertentu dengan pagination."""
    base_q = db.query(EmailMessage).filter(EmailMessage.folder == folder)
    total = base_q.count()
    items = (
        base_q
        .order_by(EmailMessage.received_at.desc().nulls_last(), EmailMessage.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    # Lampirkan flag has_attachments
    result = []
    for msg in items:
        d = {
            "id":            msg.id,
            "message_id":    msg.message_id,
            "from_address":  msg.from_address,
            "from_name":     msg.from_name,
            "to_addresses":  msg.to_addresses or [],
            "subject":       msg.subject,
            "folder":        msg.folder,
            "is_read":       msg.is_read,
            "is_starred":    msg.is_starred,
            "received_at":   msg.received_at,
            "created_at":    msg.created_at,
            "has_attachments": len(msg.attachments) > 0 if msg.attachments else False,
        }
        result.append(d)

    return PaginatedEmailMessages(
        items=result,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


# ── Send email ────────────────────────────────────────────────────────────────

@router.post("/send", response_model=SendEmailResponse, status_code=status.HTTP_201_CREATED)
def send_email(payload: SendEmailPayload, db: Session = Depends(get_db)):
    """
    Kirim email melalui config yang dipilih.
    Menyimpan record ke tabel email_messages (folder=sent).
    """
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from app.core.security import decrypt_password
    from app.models.email_message import EmailFolder

    config: EmailConfig = db.get(EmailConfig, payload.config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Email config tidak ditemukan.")
    if not config.is_active:
        raise HTTPException(status_code=400, detail="Email config tidak aktif.")

    if config.provider.value != "smtp":
        return SendEmailResponse(
            success=False,
            detail=f"Pengiriman via provider '{config.provider.value}' belum didukung langsung. Gunakan SDK eksternal.",
        )

    msg = MIMEMultipart("alternative")
    msg["From"] = f'{config.from_name or ""} <{config.from_address}>'
    msg["To"]   = ", ".join(str(a) for a in payload.to)
    if payload.cc:
        msg["Cc"] = ", ".join(str(a) for a in payload.cc)
    msg["Subject"] = payload.subject

    if payload.body_text:
        msg.attach(MIMEText(payload.body_text, "plain"))
    if payload.body_html:
        msg.attach(MIMEText(payload.body_html, "html"))

    try:
        password = decrypt_password(config.password_encrypted)
        all_rcpt = [str(a) for a in (payload.to + payload.cc + payload.bcc)]
        with smtplib.SMTP(config.host, config.port, timeout=30) as server:
            if config.use_tls:
                server.starttls()
            server.login(config.username, password)
            server.sendmail(config.from_address, all_rcpt, msg.as_string())
    except Exception as e:
        return SendEmailResponse(success=False, detail=str(e))

    # Simpan ke DB sebagai sent
    import uuid
    msg_id = f"<{uuid.uuid4().hex}@custherds>"
    db_msg = EmailMessage(
        config_id=config.id,
        message_id=msg_id,
        from_address=config.from_address,
        from_name=config.from_name,
        to_addresses=[str(a) for a in payload.to],
        cc_addresses=[str(a) for a in payload.cc],
        bcc_addresses=[str(a) for a in payload.bcc],
        subject=payload.subject,
        body_text=payload.body_text,
        body_html=payload.body_html,
        folder=EmailFolder.sent,
        is_read=True,
        reply_to_id=payload.reply_to_id,
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)

    return SendEmailResponse(success=True, message_id=msg_id)


# ── Detail email ──────────────────────────────────────────────────────────────

@router.get("/{email_id}", response_model=EmailMessageOut)
def get_email(email_id: int, db: Session = Depends(get_db)):
    msg: EmailMessage = db.get(EmailMessage, email_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan.")
    if not msg.is_read:
        msg.is_read = True
        db.commit()
        db.refresh(msg)
    return msg


# ── Mark read / starred / move ────────────────────────────────────────────────

@router.patch("/{email_id}/read", response_model=EmailMessageOut)
def mark_read(email_id: int, payload: MarkReadPayload, db: Session = Depends(get_db)):
    msg: EmailMessage = db.get(EmailMessage, email_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan.")
    msg.is_read = payload.is_read
    db.commit()
    db.refresh(msg)
    return msg


@router.patch("/{email_id}/star", response_model=EmailMessageOut)
def mark_starred(email_id: int, payload: MarkStarredPayload, db: Session = Depends(get_db)):
    msg: EmailMessage = db.get(EmailMessage, email_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan.")
    msg.is_starred = payload.is_starred
    db.commit()
    db.refresh(msg)
    return msg


@router.patch("/{email_id}/move", response_model=EmailMessageOut)
def move_to_folder(email_id: int, payload: MoveFolderPayload, db: Session = Depends(get_db)):
    msg: EmailMessage = db.get(EmailMessage, email_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan.")
    msg.folder = payload.folder
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email(email_id: int, db: Session = Depends(get_db)):
    """Hapus permanen. Biasanya pindahkan ke trash dulu via PATCH /move."""
    msg: EmailMessage = db.get(EmailMessage, email_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan.")
    db.delete(msg)
    db.commit()
