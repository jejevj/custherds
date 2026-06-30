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


@router.put("/activate", response_model=PaymentGatewayConfigSafeResponse)
def activate_gateway(payload: PaymentGatewayActivateRequest, db: Session = Depends(get_db)):
    """Aktifkan satu gateway dan non-aktifkan semua yang lain."""
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


# ⚠️ POST /{provider}/test HARUS sebelum GET/PUT/DELETE /{provider}
@router.post("/{provider}/test")
async def test_gateway_connection(provider: str, db: Session = Depends(get_db)):
    """
    Test koneksi ke payment gateway menggunakan endpoint autentikasi resmi.

    DOKU SNAP :
      POST /authorization/v1/access-token/b2b
      Header: X-CLIENT-KEY, X-TIMESTAMP, X-SIGNATURE (SHA256withRSA private_key)
      Body  : { "grantType": "client_credentials" }
      Ref   : https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/get-token-api/b2b

    Xendit :
      GET /balance  (Basic Auth api_key)
      Ref: https://developers.xendit.co
    """
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gateway '{provider}' tidak ditemukan.",
        )

    creds: dict = config.credentials or {}

    try:
        # ── DOKU SNAP ─────────────────────────────────────────────────────────
        if provider == "doku":
            import base64
            import hashlib
            from datetime import datetime, timezone, timedelta
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import padding

            client_id   = creds.get("client_id", "")
            private_key_pem = creds.get("private_key", "")

            if not client_id or not private_key_pem:
                return {
                    "ok": False, "provider": provider,
                    "message": "Kredensial tidak lengkap: client_id dan private_key wajib diisi.",
                    "http_status": 0, "raw": {},
                }

            # Timestamp ISO8601 UTC+7
            now_wib = datetime.now(timezone(timedelta(hours=7)))
            timestamp = now_wib.strftime("%Y-%m-%dT%H:%M:%S+07:00")

            # Asymmetric Signature: SHA256withRSA(private_key, client_id + "|" + timestamp)
            # Ref: https://developers.doku.com/get-started-with-doku-api/signature-component/snap
            string_to_sign = f"{client_id}|{timestamp}"
            try:
                private_key_bytes = private_key_pem.encode()
                if not private_key_pem.strip().startswith("-----"):
                    # raw base64 fallback
                    private_key_bytes = base64.b64decode(private_key_pem)
                    private_key = serialization.load_der_private_key(private_key_bytes, password=None)
                else:
                    private_key = serialization.load_pem_private_key(private_key_bytes, password=None)

                signature_bytes = private_key.sign(
                    string_to_sign.encode(),
                    padding.PKCS1v15(),
                    hashes.SHA256(),
                )
                x_signature = base64.b64encode(signature_bytes).decode()
            except Exception as key_err:
                return {
                    "ok": False, "provider": provider,
                    "message": f"Private key tidak valid: {str(key_err)}",
                    "http_status": 0, "raw": {},
                }

            base_url = "https://api.doku.com" if config.is_production else "https://api-sandbox.doku.com"
            endpoint = "/authorization/v1/access-token/b2b"

            headers = {
                "Content-Type": "application/json",
                "X-CLIENT-KEY": client_id,
                "X-TIMESTAMP": timestamp,
                "X-SIGNATURE": x_signature,
            }
            body = {"grantType": "client_credentials"}

            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(f"{base_url}{endpoint}", json=body, headers=headers)

            raw = resp.json()
            response_code = raw.get("responseCode", "")
            response_msg  = raw.get("responseMessage", "")

            if resp.status_code == 200 and response_code.startswith("200"):
                token_preview = raw.get("accessToken", "")[:20] + "..." if raw.get("accessToken") else "-"
                ok = True
                message = f"Koneksi berhasil. Access token diterima ({token_preview})"
            else:
                ok = False
                message = f"{response_msg or f'HTTP {resp.status_code}'} (responseCode: {response_code})"

            return {"ok": ok, "provider": provider, "message": message, "http_status": resp.status_code, "raw": raw}

        # ── Xendit ────────────────────────────────────────────────────────────
        elif provider == "xendit":
            import base64
            api_key = creds.get("api_key", "")
            if not api_key:
                return {
                    "ok": False, "provider": provider,
                    "message": "Kredensial tidak lengkap: api_key wajib diisi.",
                    "http_status": 0, "raw": {},
                }
            encoded = base64.b64encode(f"{api_key}:".encode()).decode()
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://api.xendit.co/balance",
                    headers={"Authorization": f"Basic {encoded}", "Content-Type": "application/json"},
                )
            raw = resp.json()
            ok = resp.status_code == 200
            if ok:
                message = f"Koneksi berhasil. Balance: {raw.get('balance', '-')} IDR"
            else:
                message = raw.get("message") or raw.get("detail") or f"HTTP {resp.status_code}"
            return {"ok": ok, "provider": provider, "message": message, "http_status": resp.status_code, "raw": raw}

        else:
            raise HTTPException(status_code=400, detail=f"Test tidak tersedia untuk provider '{provider}'.")

    except httpx.TimeoutException:
        return {"ok": False, "provider": provider, "message": "Timeout — server gateway tidak merespon.", "http_status": 0, "raw": {}}
    except httpx.RequestError as e:
        return {"ok": False, "provider": provider, "message": f"Network error: {str(e)}", "http_status": 0, "raw": {}}


@router.get("/{provider}", response_model=PaymentGatewayConfigResponse)
def get_gateway_detail(provider: str, db: Session = Depends(get_db)):
    """Detail konfigurasi termasuk credentials — hanya untuk admin."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    return config


@router.put("/{provider}", response_model=PaymentGatewayConfigResponse)
def update_gateway(provider: str, payload: PaymentGatewayConfigUpdate, db: Session = Depends(get_db)):
    """Update credentials atau konfigurasi gateway."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config


@router.delete("/{provider}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gateway(provider: str, db: Session = Depends(get_db)):
    """Hapus konfigurasi gateway. Gateway aktif tidak boleh dihapus."""
    config = db.query(PaymentGatewayConfig).filter(PaymentGatewayConfig.provider == provider).first()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gateway '{provider}' tidak ditemukan.")
    if config.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gateway aktif tidak dapat dihapus. Non-aktifkan dulu.",
        )
    db.delete(config)
    db.commit()
