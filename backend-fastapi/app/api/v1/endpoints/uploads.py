"""
File upload & serve endpoint.

POST /api/v1/uploads            — upload single file   (auth required)
POST /api/v1/uploads/batch      — upload multiple      (auth required)
GET  /api/v1/uploads/{filename} — serve file           (PUBLIC — filename is UUID-random)

GET sengaja tidak butuh auth agar <img src> / Next.js <Image> bisa
load langsung dari browser tanpa Authorization header.
Keamanan cukup dari UUID filename yang tidak bisa ditebak.
"""
import uuid
from pathlib import Path
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

STORAGE_DIR = Path(__file__).resolve().parents[4] / "storage" / "uploads"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
MAX_SIZE_BYTES = 5 * 1024 * 1024
MAX_FILES      = 10


def _save_upload(content: bytes, original_filename: str) -> str:
    ext = Path(original_filename or "file").suffix.lower() or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    (STORAGE_DIR / filename).write_bytes(content)
    return filename


@router.post("", summary="Upload single file (auth required)")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, f"Tipe file tidak diizinkan: {file.content_type}")
    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(413, "File terlalu besar. Maksimal 5 MB.")
    filename = _save_upload(content, file.filename or "file")
    return {"url": f"/api/v1/uploads/{filename}", "filename": filename}


@router.post("/batch", summary="Upload multiple files sekaligus (auth required)")
async def upload_batch(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Maksimal {MAX_FILES} file per request.")
    results = []
    for f in files:
        if f.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(415, f"File '{f.filename}' bertipe '{f.content_type}' tidak diizinkan.")
        content = await f.read()
        if len(content) > MAX_SIZE_BYTES:
            raise HTTPException(413, f"File '{f.filename}' terlalu besar. Maksimal 5 MB.")
        filename = _save_upload(content, f.filename or "file")
        results.append({"url": f"/api/v1/uploads/{filename}", "filename": filename})
    return {"uploaded": results, "count": len(results)}


@router.get("/{filename}", summary="Serve uploaded file (public)")
def serve_file(filename: str) -> FileResponse:
    """Public endpoint — no auth needed, filename is UUID-random."""
    if "/" in filename or ".." in filename:
        raise HTTPException(400, "Nama file tidak valid.")
    filepath = STORAGE_DIR / filename
    if not filepath.exists():
        raise HTTPException(404, "File tidak ditemukan.")
    return FileResponse(str(filepath), filename=filename, media_type=_guess_media_type(filename))


def _guess_media_type(filename: str) -> str:
    return {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png",  ".webp": "image/webp",
        ".pdf": "application/pdf",
    }.get(Path(filename).suffix.lower(), "application/octet-stream")
