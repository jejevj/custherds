from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GuideBase(BaseModel):
    bio: Optional[str] = None
    languages: Optional[str] = None
    expertise: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None


class GuideCreate(GuideBase):
    pass


class GuideUpdate(GuideBase):
    is_available: Optional[bool] = None


class GuideResponse(GuideBase):
    id: int
    user_id: int
    rating: float
    is_approved: bool
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True
