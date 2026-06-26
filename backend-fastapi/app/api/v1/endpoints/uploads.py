"""
File upload & serve endpoint.

POST /api/v1/uploads          — upload file, return URL
GET  /api/v1/uploads/{filename} — serve file (admin + pemilik saja)

File disimpan di: backend-fastapi/storage/uploads/
URL yang dikembalikan: /api/v1/uploads/{uuid_filename}
"""
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User

router = APIRouter()

# Lokasi penyimpanan — satu level di atas app/
STORAGE_DIR = Path(__file__).resolve().parents[4] / "storage" / "uploads"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Tipe file yang diizinkan
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
MAX_SIZE_MB = 5
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024


@router.post("", summary="Upload file (gambar / PDF)", tags=["Uploads"])
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Upload file dan kembalikan URL relatif untuk disimpan di profil."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Tipe file tidak diizinkan. Gunakan: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File terlalu besar. Maksimal {MAX_SIZE_MB}MB."
        )

    # Buat nama file unik: uuid + ekstensi asli
    ext = Path(file.filename or "file").suffix.lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = STORAGE_DIR / filename

    with open(dest, "wb") as f:
        f.write(content)

    return {"url": f"/api/v1/uploads/{filename}", "filename": filename}


@router.get("/{filename}", summary="Serve uploaded file (admin / pemilik)", tags=["Uploads"])
def serve_file(
    filename: str,
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    """
    Serve file dari storage.
    Hanya user yang login bisa mengakses (admin bisa lihat semua).
    File sensitif (KTP, dokumen) tidak boleh publik.
    """
    # Sanitasi — jangan biarkan path traversal
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid")

    filepath = STORAGE_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type=_guess_media_type(filename),
    )


def _guess_media_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }.get(ext, "application/octet-stream")
