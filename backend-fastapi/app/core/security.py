from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── JWT ─────────────────────────────────────────────────────────────────────────

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Union[str, Any]) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ── Symmetric encryption untuk credentials sensitif (mis. SMTP password) ───────────────
#
# Menggunakan Fernet (AES-128-CBC + HMAC-SHA256) dari library `cryptography`.
# Key diambil dari SECRET_KEY di settings — di-pad/crop ke 32 bytes lalu
# di-base64url-encode agar valid sebagai Fernet key.
#
# Syarat: pip install cryptography  (sudah termasuk di requirements jika
#         paket `python-jose[cryptography]` sudah ada)

import base64
import hashlib


def _get_fernet():
    """Lazy-import Fernet dan buat instance dari SECRET_KEY."""
    from cryptography.fernet import Fernet

    # Fernet key harus tepat 32 bytes url-safe base64.
    # Kita hash SECRET_KEY dengan SHA-256 → 32 bytes → base64url-encode.
    raw = hashlib.sha256(settings.SECRET_KEY.encode()).digest()  # 32 bytes
    fernet_key = base64.urlsafe_b64encode(raw)                   # 44-char base64
    return Fernet(fernet_key)


def encrypt_password(plain: str) -> str:
    """
    Enkripsi password plain-text menggunakan Fernet (AES-128 + HMAC).
    Hasil berupa string base64url yang aman disimpan di database.
    """
    return _get_fernet().encrypt(plain.encode()).decode()


def decrypt_password(encrypted: str) -> str:
    """
    Dekripsi nilai yang dihasilkan oleh encrypt_password().
    Raise cryptography.fernet.InvalidToken jika data rusak atau key salah.
    """
    return _get_fernet().decrypt(encrypted.encode()).decode()
