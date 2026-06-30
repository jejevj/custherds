from typing import Any, Dict

from sqlalchemy.orm import Session

from app.models.payment_gateway_config import PaymentGatewayConfig
from .doku import DokuGateway
from .xendit import XenditGateway
from .base import PaymentGatewayBase

SUPPORTED_GATEWAYS = {
    "doku": DokuGateway,
    "xendit": XenditGateway,
}


def get_active_gateway(db: Session) -> PaymentGatewayBase:
    """
    Ambil gateway yang aktif dari database.
    Hanya satu gateway yang boleh aktif dalam satu waktu.
    Raise ValueError jika tidak ada gateway aktif atau gateway tidak dikenali.
    """
    config: PaymentGatewayConfig = (
        db.query(PaymentGatewayConfig)
        .filter(PaymentGatewayConfig.is_active == True)
        .first()
    )
    if not config:
        raise ValueError("Tidak ada payment gateway yang aktif. Aktifkan salah satu di /admin/payment-gateway-config.")

    gateway_class = SUPPORTED_GATEWAYS.get(config.provider)
    if not gateway_class:
        raise ValueError(f"Provider '{config.provider}' tidak didukung. Pilih: {list(SUPPORTED_GATEWAYS.keys())}")

    return gateway_class(config.credentials)
