from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.email_config import EmailProvider
from app.models.email_message import EmailFolder


# ─── EmailAttachment ──────────────────────────────────────────────────────────

class EmailAttachmentOut(BaseModel):
    id:         int
    filename:   str
    mime_type:  str
    size:       int
    url:        str

    model_config = {"from_attributes": True}


# ─── EmailMessage ─────────────────────────────────────────────────────────────

class EmailMessageOut(BaseModel):
    id:            int
    message_id:    Optional[str]
    from_address:  str
    from_name:     Optional[str]
    to_addresses:  List[str]
    cc_addresses:  List[str]
    bcc_addresses: List[str]
    subject:       str
    body_text:     Optional[str]
    body_html:     Optional[str]
    folder:        EmailFolder
    is_read:       bool
    is_starred:    bool
    reply_to_id:   Optional[int]
    received_at:   Optional[datetime]
    created_at:    datetime
    attachments:   List[EmailAttachmentOut] = []

    model_config = {"from_attributes": True}


class EmailMessageListItem(BaseModel):
    """Versi ringkas untuk list inbox — tanpa body."""
    id:           int
    message_id:   Optional[str]
    from_address: str
    from_name:    Optional[str]
    to_addresses: List[str]
    subject:      str
    folder:       EmailFolder
    is_read:      bool
    is_starred:   bool
    received_at:  Optional[datetime]
    created_at:   datetime
    has_attachments: bool = False

    model_config = {"from_attributes": True}


class PaginatedEmailMessages(BaseModel):
    items:    List[EmailMessageListItem]
    total:    int
    page:     int
    per_page: int
    pages:    int


class MarkReadPayload(BaseModel):
    is_read: bool


class MarkStarredPayload(BaseModel):
    is_starred: bool


class MoveFolderPayload(BaseModel):
    folder: EmailFolder


# ─── SendEmail ────────────────────────────────────────────────────────────────

class SendEmailPayload(BaseModel):
    to:          List[EmailStr]
    cc:          List[EmailStr] = []
    bcc:         List[EmailStr] = []
    subject:     str
    body_html:   Optional[str] = None
    body_text:   Optional[str] = None
    reply_to_id: Optional[int] = None
    config_id:   int

    @field_validator("to")
    @classmethod
    def to_not_empty(cls, v: List[EmailStr]) -> List[EmailStr]:
        if not v:
            raise ValueError("Minimal satu penerima (to) diperlukan")
        return v


class SendEmailResponse(BaseModel):
    success:    bool
    message_id: Optional[str] = None
    queued:     bool = False
    detail:     Optional[str] = None


# ─── EmailConfig ──────────────────────────────────────────────────────────────

class EmailConfigOut(BaseModel):
    id:           int
    name:         str
    provider:     EmailProvider
    host:         Optional[str]
    port:         Optional[int]
    use_tls:      bool
    username:     str
    from_address: str
    from_name:    Optional[str]
    is_default:   bool
    is_active:    bool
    created_at:   datetime
    updated_at:   Optional[datetime]

    model_config = {"from_attributes": True}


class EmailConfigCreate(BaseModel):
    name:         str
    provider:     EmailProvider
    host:         Optional[str]  = None
    port:         Optional[int]  = None
    use_tls:      bool           = True
    username:     str
    password:     str            # plain, akan diencrypt sebelum disimpan
    from_address: EmailStr
    from_name:    Optional[str]  = None
    is_default:   bool           = False
    is_active:    bool           = True


class EmailConfigUpdate(BaseModel):
    name:         Optional[str]          = None
    provider:     Optional[EmailProvider]= None
    host:         Optional[str]          = None
    port:         Optional[int]          = None
    use_tls:      Optional[bool]         = None
    username:     Optional[str]          = None
    password:     Optional[str]          = None  # kosong = tidak ubah password
    from_address: Optional[EmailStr]     = None
    from_name:    Optional[str]          = None
    is_default:   Optional[bool]         = None
    is_active:    Optional[bool]         = None


class TestEmailConfigPayload(BaseModel):
    config_id: int
    send_to:   EmailStr


class TestEmailConfigResponse(BaseModel):
    success:    bool
    message:    str
    latency_ms: Optional[int] = None
