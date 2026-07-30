"""
File upload endpoint — menggunakan Cloudflare R2 sebagai storage backend.

POST /api/v1/uploads            — upload single file   (auth required)
POST /api/v1/uploads/batch      — upload multiple      (auth required)

File disimpan di Cloudflare R2 (S3-compatible).
URL yang dikembalikan adalah public URL langsung dari R2 / custom domain,
sehingga frontend bisa load <img src> tanpa Authorization header.

Keamanan cukup dari UUID filename yang tidak bisa ditebak.
"""
import uuid
from pathlib import Path
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.deps import get_current_user
from app.models.user import User
from app.services.r2_storage import upload_to_r2

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_FILES      = 10


def _make_filename(original_filename: str) -> str:
    """Generate UUID-based filename dengan ekstensi asli."""
    ext = Path(original_filename or "file").suffix.lower() or ".bin"
    return f"{uuid.uuid4().hex}{ext}"


@router.post("", summary="Upload single file (auth required)")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload satu file ke Cloudflare R2.
    Mengembalikan URL publik yang bisa langsung dipakai di field `receipt_image`.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, f"Tipe file tidak diizinkan: {file.content_type}")
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(413, "File terlalu besar. Maksimal 5 MB.")

    filename = _make_filename(file.filename or "file")
    public_url = upload_to_r2(content, filename, file.content_type)

    return {"url": public_url, "filename": filename}


@router.post("/batch", summary="Upload multiple files sekaligus (auth required)")
async def upload_batch(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload banyak file sekaligus ke Cloudflare R2 (maks. 10 file).
    Mengembalikan list URL publik untuk setiap file.
    """
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Maksimal {MAX_FILES} file per request.")

    results = []
    for f in files:
        if f.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(415, f"File '{f.filename}' bertipe '{f.content_type}' tidak diizinkan.")
        content = await f.read()
        if len(content) > MAX_SIZE_BYTES:
            raise HTTPException(413, f"File '{f.filename}' terlalu besar. Maksimal 5 MB.")

        filename = _make_filename(f.filename or "file")
        public_url = upload_to_r2(content, filename, f.content_type)
        results.append({"url": public_url, "filename": filename})

    return {"uploaded": results, "count": len(results)}
