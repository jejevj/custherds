from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
import uuid


class UserProfile(BaseModel):
    id: uuid.UUID
    user_name: str
    user_email: str
    user_phone: Optional[str]
    user_type: int
    ig_link: Optional[str]
    fb_link: Optional[str]
    yt_link: Optional[str]
    tiktok_link: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    ig_link: Optional[str] = None
    fb_link: Optional[str] = None
    yt_link: Optional[str] = None
    tiktok_link: Optional[str] = None
