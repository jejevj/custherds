from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: int


class RegisterRequest(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str
    user_type: int
    user_phone: Optional[str] = None
    tnc_accepted: bool = False
    # vendor fields (wajib jika user_type=2)
    vendor_business_name: Optional[str] = None
    vendor_category: Optional[int] = None
    vendor_area: Optional[int] = None
    vendor_cashback_percent: Optional[float] = None
    vendor_location: Optional[str] = None
    vendor_contact_person: Optional[str] = None
    vendor_website: Optional[str] = None
    vendor_short_description: Optional[str] = None
    vendor_opening_hours: Optional[str] = None
    vendor_know_from: Optional[str] = None


class RegisterResponse(BaseModel):
    id: str
    user_email: str
    user_type: int
    message: str
