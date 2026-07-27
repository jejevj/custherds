from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VendorCategoryBase(BaseModel):
    name:       str         = Field(..., max_length=100, description="Nama kategori, unik")
    group_name: str         = Field(..., max_length=100, description="Nama grup kategori")
    sort_order: int         = Field(0,   ge=0,           description="Urutan tampil (ascending)")
    is_active:  bool        = Field(True,                description="Aktif / tidak")


class VendorCategoryCreate(VendorCategoryBase):
    pass


class VendorCategoryUpdate(BaseModel):
    name:       Optional[str]  = Field(None, max_length=100)
    group_name: Optional[str]  = Field(None, max_length=100)
    sort_order: Optional[int]  = Field(None, ge=0)
    is_active:  Optional[bool] = None


class VendorCategoryOut(VendorCategoryBase):
    id:         int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
