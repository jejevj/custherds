"""
File upload & serve endpoint.

POST /api/v1/uploads            — upload file, return URL
GET  /api/v1/uploads/{filename} — serve file (login required)

File disimpan di: backend-fastapi/storage/uploads/
"""
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

STORAGE_DIR = Path(__file__).resolve().parents[4] / "storage" / "uploads"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("", summary="Upload file (gambar / PDF)", tags=["Uploads"])
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Tipe file tidak diizinkan. Gunakan: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File terlalu besar. Maksimal 5MB.")

    ext = Path(file.filename or "file").suffix.lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(STORAGE_DIR / filename, "wb") as f:
        f.write(content)

    return {"url": f"/api/v1/uploads/{filename}", "filename": filename}


@router.get("/{filename}", summary="Serve uploaded file (login required)", tags=["Uploads"])
def serve_file(
    filename: str,
    current_user: User = Depends(get_current_user),
) -> FileResponse:
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
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }.get(Path(filename).suffix.lower(), "application/octet-stream")
