from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PaymentGatewayConfigBase(BaseModel):
    provider: str = Field(..., description="Nama provider: 'doku' atau 'xendit'")
    label: str = Field(..., description="Label tampilan, contoh: 'DOKU SNAP' atau 'Xendit Invoice'")
    is_production: bool = Field(False, description="True untuk environment production")
    credentials: Dict[str, Any] = Field(default_factory=dict, description="Kredensial gateway dalam bentuk JSON")
    notes: Optional[str] = Field(None, description="Catatan tambahan")


class PaymentGatewayConfigCreate(PaymentGatewayConfigBase):
    pass


class PaymentGatewayConfigUpdate(BaseModel):
    label: Optional[str] = None
    is_production: Optional[bool] = None
    credentials: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PaymentGatewayActivateRequest(BaseModel):
    provider: str = Field(..., description="Provider yang ingin diaktifkan: 'doku' atau 'xendit'")


class PaymentGatewayConfigResponse(PaymentGatewayConfigBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentGatewayConfigSafeResponse(BaseModel):
    """Response tanpa expose credentials — untuk endpoint non-admin."""
    id: int
    provider: str
    label: str
    is_active: bool
    is_production: bool
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
