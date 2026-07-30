"""
Cloudflare R2 Storage Service

Menggunakan boto3 dengan S3-compatible API dari Cloudflare R2.
R2 tidak mengenakan biaya egress — cocok untuk serving file gambar.
"""
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


def get_r2_client():
    """
    Buat boto3 S3 client yang terhubung ke Cloudflare R2.
    Endpoint: https://<account_id>.r2.cloudflarestorage.com
    """
    from app.core.config import settings
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_to_r2(content: bytes, filename: str, content_type: str) -> str:
    """
    Upload bytes ke Cloudflare R2.

    Args:
        content      : raw bytes dari file
        filename     : nama file dengan ekstensi (UUID-based, sudah di-generate caller)
        content_type : MIME type (e.g. 'image/jpeg')

    Returns:
        str: URL publik file di R2 (via custom domain atau r2.dev)

    Raises:
        HTTPException 502 jika upload gagal
    """
    from app.core.config import settings
    try:
        client = get_r2_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=filename,
            Body=content,
            ContentType=content_type,
        )
        public_url = f"{settings.R2_PUBLIC_URL.rstrip('/')}/{filename}"
        logger.info(f"[R2] Upload sukses: {filename} ({len(content)} bytes) → {public_url}")
        return public_url
    except (BotoCoreError, ClientError) as e:
        logger.error(f"[R2] Upload gagal: {filename} | error={str(e)}")
        raise HTTPException(502, f"Gagal mengupload file ke storage: {str(e)}")


def delete_from_r2(filename: str) -> None:
    """
    Hapus file dari R2 bucket.
    Tidak raise error jika file tidak ditemukan (idempotent).

    Args:
        filename : nama file/key di R2 bucket
    """
    from app.core.config import settings
    try:
        client = get_r2_client()
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
        logger.info(f"[R2] Delete sukses: {filename}")
    except (BotoCoreError, ClientError) as e:
        logger.warning(f"[R2] Delete gagal (diabaikan): {filename} | error={str(e)}")
