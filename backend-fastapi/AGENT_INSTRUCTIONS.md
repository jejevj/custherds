# Agent Instructions — Custherds Backend FastAPI

> Dokumen ini adalah panduan wajib bagi AI agent yang akan menambahkan **model baru** dan **endpoint baru** ke project ini.
> Baca seluruh dokumen sebelum melakukan perubahan apapun.

---

## 📁 Struktur Project

```
backend-fastapi/
├── app/
│   ├── main.py                        # App entrypoint, middleware, exception handler
│   ├── core/
│   │   ├── config.py                  # Settings dari .env (pydantic-settings)
│   │   ├── security.py                # JWT & bcrypt
│   │   ├── deps.py                    # Dependency injection (get_db, auth)
│   │   ├── response.py                # ⭐ Standardized response helpers
│   │   └── exceptions.py             # Global exception handlers
│   ├── db/
│   │   ├── base_class.py              # Base declarative class ONLY
│   │   ├── base.py                    # Import semua models (untuk Alembic)
│   │   └── session.py                # Engine & SessionLocal
│   ├── middleware/
│   │   └── logging.py                # Auto-log 4xx/5xx ke DB
│   ├── models/                        # SQLAlchemy ORM models
│   │   └── api_log.py                # Contoh model
│   ├── schemas/                       # Pydantic request/response schemas
│   └── api/v1/
│       ├── router.py                  # Daftar semua endpoint routers
│       └── endpoints/
│           ├── _template.py           # ⭐ Template endpoint — SELALU jadikan referensi
│           └── health.py             # Contoh endpoint aktif
├── alembic/
│   ├── env.py
│   └── versions/                      # Migration files
├── alembic.ini
├── requirements.txt
├── .env.example
├── PROGRESS.md
└── AGENT_INSTRUCTIONS.md              # (file ini)
```

---

## ⚠️ Aturan Wajib (Jangan Dilanggar)

1. **JANGAN** import `Base` dari `app.db.base` di dalam model — selalu dari `app.db.base_class`
2. **JANGAN** import model langsung di `core/deps.py` level top — gunakan lazy import (di dalam fungsi)
3. **SELALU** gunakan response helper dari `app.core.response` — jangan return `dict` mentah
4. **SELALU** daftarkan model baru di `app/db/base.py` agar Alembic bisa detect
5. **SELALU** buat migration file manual di `alembic/versions/` dengan format nama: `YYYYMMDD_XXXX_nama_singkat.py`
6. **JANGAN** jalankan `alembic revision --autogenerate` tanpa konfirmasi user — buatkan file migration manual saja
7. **SELALU** update `PROGRESS.md` setelah setiap perubahan

---

## 🧱 Cara Menambahkan Model Baru

### Langkah 1 — Buat file model di `app/models/<nama>.py`

```python
# app/models/example.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base   # ← WAJIB dari base_class, BUKAN base


class Example(Base):
    __tablename__ = "examples"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Tipe kolom yang tersedia:**
```python
Column(Integer)                        # angka bulat
Column(String(255))                    # teks pendek, selalu beri panjang max
Column(Text)                           # teks panjang
Column(Float)                          # desimal
Column(Boolean, default=True)
Column(DateTime(timezone=True))
Column(ForeignKey("table.id"))         # relasi ke tabel lain
Column(Enum(MyEnum))                   # pilihan tetap, buat enum class dulu
```

### Langkah 2 — Daftarkan di `app/db/base.py`

```python
# app/db/base.py
from app.db.base_class import Base        # noqa: F401
from app.models.api_log import ApiLog     # noqa: F401
from app.models.example import Example   # noqa: F401  ← tambahkan di sini
```

### Langkah 3 — Buat Pydantic Schema di `app/schemas/<nama>.py`

```python
# app/schemas/example.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExampleBase(BaseModel):
    name: str


class ExampleCreate(ExampleBase):
    pass  # field tambahan khusus create


class ExampleUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class ExampleResponse(ExampleBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True   # wajib untuk SQLAlchemy → Pydantic
```

### Langkah 4 — Buat Migration File

Buat file baru di `alembic/versions/` dengan format:
`YYYYMMDD_XXXX_nama_tabel.py`

Contoh: `alembic/versions/20260621_0002_create_examples_table.py`

```python
"""create examples table

Revision ID: 0002_examples
Revises: 0001_api_logs       # ← revision ID file migration sebelumnya
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = '0002_examples'
down_revision = '0001_api_logs'   # ← WAJIB diisi dengan revision sebelumnya
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'examples',
        sa.Column('id',         sa.Integer(),                  nullable=False),
        sa.Column('name',       sa.String(length=255),         nullable=False),
        sa.Column('is_active',  sa.Boolean(),                  nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),    server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True),    nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_examples_id',   'examples', ['id'],   unique=False)
    op.create_index('ix_examples_name', 'examples', ['name'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_examples_name', table_name='examples')
    op.drop_index('ix_examples_id',   table_name='examples')
    op.drop_table('examples')
```

> **Cek `down_revision`** — selalu cocokkan dengan `revision` dari file migration terakhir di folder `versions/`.
> Migration pertama: `down_revision = None`

---

## 🌐 Cara Menambahkan Endpoint Baru

### Langkah 1 — Copy template

Salin `app/api/v1/endpoints/_template.py` ke file baru:
`app/api/v1/endpoints/<resource>.py`

Ganti semua `Item` / `item` dengan nama resource yang sesuai.

### Langkah 2 — Gunakan response helper (WAJIB)

Selalu import dari `app.core.response`:

```python
from app.core.response import (
    resp_ok,           # 200
    resp_created,      # 201
    resp_no_content,   # 204
    resp_bad_request,  # 400
    resp_unauthorized, # 401
    resp_forbidden,    # 403
    resp_not_found,    # 404
    resp_conflict,     # 409
    resp_unprocessable,# 422
    resp_server_error, # 500
)
```

**Contoh endpoint lengkap:**

```python
@router.get("/")
def list_examples(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    items = db.query(Example).filter(Example.is_active == True).offset(skip).limit(limit).all()
    total = db.query(Example).filter(Example.is_active == True).count()
    return resp_ok(
        data=[ExampleResponse.model_validate(i) for i in items],
        message="Examples retrieved successfully",
        meta={"skip": skip, "limit": limit, "total": total},
    )


@router.post("/", status_code=201)
def create_example(payload: ExampleCreate, db: Session = Depends(get_db)):
    existing = db.query(Example).filter(Example.name == payload.name).first()
    if existing:
        return resp_conflict("Example with this name already exists")
    item = Example(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return resp_created(
        data=ExampleResponse.model_validate(item),
        message="Example created successfully",
    )


@router.get("/{item_id}")
def get_example(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Example).filter(Example.id == item_id).first()
    if not item:
        return resp_not_found(f"Example {item_id} not found")
    return resp_ok(data=ExampleResponse.model_validate(item))
```

### Langkah 3 — Daftarkan router di `app/api/v1/router.py`

```python
# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1.endpoints import health, example   # ← tambahkan import

api_router = APIRouter()

api_router.include_router(health.router,   prefix="/health",   tags=["Health"])
api_router.include_router(example.router,  prefix="/examples", tags=["Examples"])  # ← tambahkan
```

---

## 📋 Checklist Setiap Menambahkan Fitur Baru

```
[ ] Buat app/models/<nama>.py — import Base dari base_class
[ ] Daftarkan model di app/db/base.py
[ ] Buat app/schemas/<nama>.py — BaseModel, Create, Update, Response
[ ] Buat alembic/versions/YYYYMMDD_XXXX_<nama>.py — isi down_revision dengan benar
[ ] Copy _template.py → app/api/v1/endpoints/<nama>.py
[ ] Gunakan resp_* helper dari core/response.py di semua endpoint
[ ] Daftarkan router di app/api/v1/router.py
[ ] Update PROGRESS.md — pindahkan item dari To-Do ke Selesai
[ ] Push ke GitHub dengan commit message yang deskriptif
[ ] Instruksikan user untuk menjalankan: alembic upgrade head && systemctl restart custherds-api
```

---

## 🔑 Migration Chain (Penting!)

Setiap migration file harus membentuk rantai:

```
None ← 0001_api_logs ← 0002_xxx ← 0003_xxx ← ...
```

Cek revision terakhir dengan:
```bash
alembic heads
```

Gunakan output tersebut sebagai `down_revision` pada migration baru.

---

## 🖥️ Perintah VM Setelah Push

```bash
cd /var/up/custherds/custherds/backend-fastapi
git pull origin main
source venv/bin/activate

# Jalankan migration baru
alembic upgrade head

# Restart service
systemctl restart custherds-api
journalctl -u custherds-api -f
```
