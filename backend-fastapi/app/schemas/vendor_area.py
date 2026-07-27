from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ---------------------------------------------------------------------------
# Kelurahan
# ---------------------------------------------------------------------------

class VendorAreaKelurahanBase(BaseModel):
    name:       str         = Field(..., max_length=150)
    sort_order: int         = Field(0, ge=0)
    is_active:  bool        = True


class VendorAreaKelurahanCreate(VendorAreaKelurahanBase):
    kecamatan_id: int


class VendorAreaKelurahanUpdate(BaseModel):
    name:       Optional[str]   = Field(None, max_length=150)
    sort_order: Optional[int]   = Field(None, ge=0)
    is_active:  Optional[bool]  = None


class VendorAreaKelurahanOut(VendorAreaKelurahanBase):
    id:             int
    kecamatan_id:   int
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Kecamatan
# ---------------------------------------------------------------------------

class VendorAreaKecamatanBase(BaseModel):
    name:       str         = Field(..., max_length=150)
    sort_order: int         = Field(0, ge=0)
    is_active:  bool        = True


class VendorAreaKecamatanCreate(VendorAreaKecamatanBase):
    kabupaten_id: int


class VendorAreaKecamatanUpdate(BaseModel):
    name:       Optional[str]   = Field(None, max_length=150)
    sort_order: Optional[int]   = Field(None, ge=0)
    is_active:  Optional[bool]  = None


class VendorAreaKecamatanOut(VendorAreaKecamatanBase):
    id:             int
    kabupaten_id:   int
    created_at:     datetime
    updated_at:     datetime
    kelurahans:     List[VendorAreaKelurahanOut] = []

    model_config = {"from_attributes": True}


class VendorAreaKecamatanOutFlat(VendorAreaKecamatanBase):
    """Versi tanpa nested kelurahans — untuk list kecamatan saja."""
    id:             int
    kabupaten_id:   int
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Kabupaten
# ---------------------------------------------------------------------------

class VendorAreaKabupatenBase(BaseModel):
    name:       str         = Field(..., max_length=150)
    sort_order: int         = Field(0, ge=0)
    is_active:  bool        = True


class VendorAreaKabupatenCreate(VendorAreaKabupatenBase):
    pass


class VendorAreaKabupatenUpdate(BaseModel):
    name:       Optional[str]   = Field(None, max_length=150)
    sort_order: Optional[int]   = Field(None, ge=0)
    is_active:  Optional[bool]  = None


class VendorAreaKabupatenOut(VendorAreaKabupatenBase):
    id:         int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorAreaKabupatenWithKecamatanOut(VendorAreaKabupatenOut):
    """Response lengkap: kabupaten → kecamatan → kelurahan."""
    kecamatans: List[VendorAreaKecamatanOut] = []

    model_config = {"from_attributes": True}
