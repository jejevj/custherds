from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.email_config import EmailConfig
from app.schemas.webmail import (
    EmailConfigCreate,
    EmailConfigOut,
    EmailConfigUpdate,
    TestEmailConfigPayload,
    TestEmailConfigResponse,
)

router = APIRouter()


# ── List & Create ─────────────────────────────────────────────────────────────

@router.get("/", response_model=List[EmailConfigOut])
def list_email_configs(db: Session = Depends(get_db)):
    """Daftar semua konfigurasi email."""
    return db.query(EmailConfig).order_by(EmailConfig.id).all()


@router.post("/", response_model=EmailConfigOut, status_code=status.HTTP_201_CREATED)
def create_email_config(payload: EmailConfigCreate, db: Session = Depends(get_db)):
    """
    Buat konfigurasi email baru.
    Password akan dienkripsi sebelum disimpan.
    Jika is_default=True, config lain akan di-unset.
    """
    from app.core.security import encrypt_password  # lazy import agar tidak circular

    if payload.is_default:
        db.query(EmailConfig).update({"is_default": False})

    config = EmailConfig(
        name=payload.name,
        provider=payload.provider,
        host=payload.host,
        port=payload.port,
        use_tls=payload.use_tls,
        username=payload.username,
        password_encrypted=encrypt_password(payload.password),
        from_address=str(payload.from_address),
        from_name=payload.from_name,
        is_default=payload.is_default,
        is_active=payload.is_active,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


# ── Test ──────────────────────────────────────────────────────────────────────

@router.post("/test", response_model=TestEmailConfigResponse)
def test_email_config(payload: TestEmailConfigPayload, db: Session = Depends(get_db)):
    """
    Kirim email test ke `send_to` menggunakan config yang dipilih.
    Berguna untuk memverifikasi bahwa SMTP / provider dapat dihubungi.
    """
    import smtplib
    import time
    from email.message import EmailMessage as StdEmail
    from app.core.security import decrypt_password

    config: EmailConfig = db.get(EmailConfig, payload.config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Email config tidak ditemukan.")
    if not config.is_active:
        raise HTTPException(status_code=400, detail="Email config tidak aktif.")

    if config.provider.value != "smtp":
        return TestEmailConfigResponse(
            success=False,
            message=f"Test otomatis untuk provider '{config.provider.value}' belum didukung. Silakan uji manual.",
        )

    msg = StdEmail()
    msg["From"] = f'{config.from_name or ""} <{config.from_address}>'
    msg["To"] = str(payload.send_to)
    msg["Subject"] = "[CustHerds] Test Email Config"
    msg.set_content(
        f"Email ini dikirim oleh sistem CustHerds untuk memverifikasi konfigurasi '{config.name}'.\n"
        "Jika Anda menerima email ini, konfigurasi sudah benar."
    )

    try:
        password = decrypt_password(config.password_encrypted)
        start = time.monotonic()
        with smtplib.SMTP(config.host, config.port, timeout=15) as server:
            if config.use_tls:
                server.starttls()
            server.login(config.username, password)
            server.send_message(msg)
        latency_ms = int((time.monotonic() - start) * 1000)
        return TestEmailConfigResponse(
            success=True,
            message=f"Email test berhasil dikirim ke {payload.send_to}.",
            latency_ms=latency_ms,
        )
    except smtplib.SMTPAuthenticationError:
        return TestEmailConfigResponse(success=False, message="Autentikasi SMTP gagal. Periksa username/password.")
    except (smtplib.SMTPConnectError, OSError) as e:
        return TestEmailConfigResponse(success=False, message=f"Gagal konek ke SMTP: {e}")
    except Exception as e:
        return TestEmailConfigResponse(success=False, message=f"Error: {e}")


# ── Get / Update / Delete ─────────────────────────────────────────────────────

@router.get("/{config_id}", response_model=EmailConfigOut)
def get_email_config(config_id: int, db: Session = Depends(get_db)):
    config = db.get(EmailConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Email config tidak ditemukan.")
    return config


@router.put("/{config_id}", response_model=EmailConfigOut)
def update_email_config(config_id: int, payload: EmailConfigUpdate, db: Session = Depends(get_db)):
    """Update konfigurasi. Jika password diisi, akan diencrypt ulang."""
    from app.core.security import encrypt_password

    config: EmailConfig = db.get(EmailConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Email config tidak ditemukan.")

    data = payload.model_dump(exclude_unset=True)

    if "password" in data and data["password"]:
        config.password_encrypted = encrypt_password(data.pop("password"))
    else:
        data.pop("password", None)

    if data.get("is_default"):
        db.query(EmailConfig).filter(EmailConfig.id != config_id).update({"is_default": False})

    for field, value in data.items():
        if value is not None:
            setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email_config(config_id: int, db: Session = Depends(get_db)):
    config: EmailConfig = db.get(EmailConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Email config tidak ditemukan.")
    if config.is_default:
        raise HTTPException(status_code=400, detail="Config default tidak bisa dihapus. Set config lain sebagai default dulu.")
    db.delete(config)
    db.commit()
