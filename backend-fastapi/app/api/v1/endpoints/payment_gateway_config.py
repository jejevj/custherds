from typing import List

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.payment_gateway_config import PaymentGatewayConfig
from app.schemas.payment_gateway_config import (
    PaymentGatewayConfigCreate,
    PaymentGatewayConfigUpdate,
    PaymentGatewayConfigResponse,
    PaymentGatewayConfigSafeResponse,
    PaymentGatewayActivateRequest,
)

router = APIRouter()

SUPPORTED_PROVIDERS = ["doku", "xendit"]


@router.get("/", response_model=List[PaymentGatewayConfigSafeResponse])
def list_gateways(db: Session = Depends(get_db)):
    """Daftar semua gateway yang terdaftar (tanpa credentials)."""
    return db.query(PaymentGatewayConfig).all()


# ⚠️ Static routes harus SEBELUM dynamic /{provider}
@router.get("/active", response_model=PaymentGatewayConfigSafeResponse)
def get_active_gateway(db: Session = Depends(get_db)):
    """Cek gateway mana yang sedang aktif."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.is_active == True).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belum ada gateway yang aktif.")
    return config


@router.post("/", response_model=PaymentGatewayConfigResponse, status_code=status.HTTP_201_CREATED)
def create_gateway(payload: PaymentGatewayConfigCreate, db: Session = Depends(get_db)):
    """Daftarkan gateway baru. Provider harus unik."""
    if payload.provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider tidak didukung. Pilih dari: {SUPPORTED_PROVIDERS}",
        )
    existing = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == payload.provider).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Provider '{payload.provider}' sudah terdaftar. Gunakan PUT untuk update.",
        )
    config = PaymentGatewayConfig(**payload.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


# ⚠️ PUT /activate HARUS sebelum PUT /{provider} agar tidak di-shadow
@router.put("/activate", response_model=PaymentGatewayConfigSafeResponse)
def activate_gateway(payload: PaymentGatewayActivateRequest, db: Session = Depends(get_db)):
    """
    Aktifkan satu gateway dan non-aktifkan semua yang lain.
    Hanya satu gateway yang boleh aktif dalam satu waktu.
    """
    target = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == payload.provider).first()
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gateway '{payload.provider}' tidak ditemukan. Daftarkan dulu via POST /.",
        )
    db.query(PaymentGatewayConfig).update({"is_active": False})
    target.is_active = True
    db.commit()
    db.refresh(target)
    return target


@router.get("/{provider}", response_model=PaymentGatewayConfigResponse)
def get_gateway_detail(provider: str, db: Session = Depends(get_db)):
    """Detail konfigurasi termasuk credentials — hanya untuk admin."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    return config


@router.put("/{provider}", response_model=PaymentGatewayConfigResponse)
def update_gateway(provider: str, payload: PaymentGatewayConfigUpdate, db: Session = Depends(get_db)):
    """Update credentials atau konfigurasi gateway (label, is_production, notes)."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config


@router.post("/{provider}/test")
async def test_gateway_connection(provider: str, db: Session = Depends(get_db)):
    """
    Test koneksi ke payment gateway dengan memanggil endpoint ringan di API mereka.
    - Xendit  : GET /balance (butuh API key valid)
    - DOKU    : POST /checkout/v1/payment dengan dummy data (cek respon autentikasi)
    Mengembalikan: { ok: bool, provider, message, http_status, raw }
    """
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")

    creds: dict = config.credentials or {}

    try:
        if provider == "xendit":
            import base64
            api_key = creds.get("api_key", "")
            encoded = base64.b64encode(f"{api_key}:".encode()).decode()
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://api.xendit.co/balance",
                    headers={
                        "Authorization": f"Basic {encoded}",
                        "Content-Type": "application/json",
                    },
                )
            ok = resp.status_code == 200
            raw = resp.json()
            if ok:
                message = f"Koneksi berhasil. Balance: {raw.get('balance', '-')} IDR"
            else:
                message = raw.get("message") or raw.get("detail") or f"HTTP {resp.status_code}"
            return {"ok": ok, "provider": provider, "message": message, "http_status": resp.status_code, "raw": raw}

        elif provider == "doku":
            import hashlib, hmac as _hmac, json, time as _time
            client_id  = creds.get("client_id", "")
            secret_key = creds.get("secret_key", "")
            base_url   = "https://api.doku.com" if config.is_production else "https://api-sandbox.doku.com"
            endpoint   = "/checkout/v1/payment"

            # Dummy body — DOKU akan tolak dengan 4xx jika kredensial salah,
            # bukan 2xx — sehingga kita bisa deteksi auth error vs network error.
            dummy_body = {
                "order": {
                    "invoice_number": "TEST-CONN-000",
                    "line_items": [{"name": "Test", "price": 10000, "quantity": 1}],
                    "amount": 10000,
                    "currency": "IDR",
                    "callback_url": "https://example.com/callback",
                    "auto_redirect": True,
                },
                "payment": {"payment_due_date": 60},
                "customer": {"id": "test", "name": "Test", "email": "test@example.com", "phone": "08000000000"},
            }
            timestamp  = _time.strftime("%Y-%m-%dT%H:%M:%S+07:00")
            str_to_sign = f"{client_id}|{timestamp}"
            signature  = _hmac.new(secret_key.encode(), str_to_sign.encode(), hashlib.sha512).hexdigest()
            headers = {
                "Content-Type": "application/json",
                "Client-Id": client_id,
                "Request-Id": f"req-test-{int(_time.time())}",
                "Request-Timestamp": timestamp,
                "Signature": f"HMACSHA512={signature}",
            }
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(f"{base_url}{endpoint}", json=dummy_body, headers=headers)
            raw = resp.json()

            # DOKU 200/201 = kredensial valid & order dibuat (sandbox)
            # DOKU 400 dengan response_code tertentu = kredensial valid, payload invalid (masih OK untuk test)
            # DOKU 401/403 = kredensial salah
            if resp.status_code in (200, 201):
                ok = True
                message = "Koneksi berhasil. Kredensial DOKU valid."
            elif resp.status_code == 400:
                # 400 bisa berarti payload invalid tapi auth sukses — anggap connected
                ok = True
                message = f"Terkoneksi. Server DOKU merespon (400 — payload test ditolak, auth OK)."
            else:
                ok = False
                message = (
                    raw.get("error") or
                    raw.get("message") or
                    raw.get("response_message") or
                    f"HTTP {resp.status_code} — Kredensial kemungkinan salah."
                )
            return {"ok": ok, "provider": provider, "message": message, "http_status": resp.status_code, "raw": raw}

        else:
            raise HTTPException(status_code=400, detail=f"Test tidak tersedia untuk provider '{provider}'.")

    except httpx.TimeoutException:
        return {"ok": False, "provider": provider, "message": "Timeout — server gateway tidak merespon.", "http_status": 0, "raw": {}}
    except httpx.RequestError as e:
        return {"ok": False, "provider": provider, "message": f"Network error: {str(e)}", "http_status": 0, "raw": {}}


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gateway(provider: str, db: Session = Depends(get_db)):
    """Hapus konfigurasi gateway. Gateway aktif tidak boleh dihapus."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    if config.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gateway aktif tidak dapat dihapus. Non-aktifkan dulu dengan mengaktifkan gateway lain.",
        )
    db.delete(config)
    db.commit()
