from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VendorBase(BaseModel):
    business_name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None


class VendorResponse(VendorBase):
    id: int
    user_id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
