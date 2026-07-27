#!/usr/bin/env python3
"""
migrate_old_to_new.py
=====================
Script migrasi data dari database lama (MySQL/PHP custherds)
ke database baru (PostgreSQL/FastAPI custherds).

Aturan migrasi:
- Dari tabel `users` lama  : hanya user yang ada di `users_vendors` lama
                             yang dimigrasi sebagai Vendor (user_type=2).
- Dari tabel `users_vendors` lama : semua data dimigrasi ke tabel `vendors` baru.
- Password hash PHP $2y$ dikonversi ke $2b$ agar kompatibel dengan passlib Python.
- user_type lama 0 (admin) → TIDAK dimigrasi (bukan vendor).
- Dibuat mapping old_user_id (INT) → new_user_id (UUID) dan disimpan ke file JSON.

Prasyarat:
    pip install sqlalchemy psycopg2-binary pymysql python-dotenv passlib[bcrypt]

Cara pakai:
    1. Edit bagian KONFIGURASI di bawah sesuai env Anda.
    2. (Opsional) Set DRY_RUN = True dulu untuk cek tanpa insert.
    3. Jalankan: python migrate_old_to_new.py
    4. Cek file migration_id_map.json untuk mapping ID lama → baru.
"""

import uuid
import json
import logging
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ─── KONFIGURASI ─────────────────────────────────────────────────────────────

# Database LAMA (MySQL)
OLD_DB_URL = "mysql+pymysql://USER:PASSWORD@HOST:3306/u642134805_custherds"

# Database BARU (PostgreSQL FastAPI)
# Bisa juga pakai nilai dari .env:
#   from dotenv import load_dotenv; import os; load_dotenv()
#   NEW_DB_URL = os.getenv("DATABASE_URL")
NEW_DB_URL = "postgresql://USER:PASSWORD@HOST:5432/custherds_new"

# File output mapping ID lama (INT) → ID baru (UUID)
ID_MAP_FILE = "migration_id_map.json"

# Dry-run: True = hanya print/log, tidak insert ke database baru
DRY_RUN = False

# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("migration")


def fix_bcrypt_hash(php_hash: str) -> str:
    """
    PHP menggunakan prefix $2y$ untuk bcrypt.
    Python passlib menggunakan $2b$.
    Keduanya identik secara algoritma — aman untuk diganti prefixnya saja.
    """
    if php_hash and php_hash.startswith("$2y$"):
        return "$2b$" + php_hash[4:]
    return php_hash or ""


def map_user_status(user_status) -> tuple:
    """
    Konversi user_status lama (integer/string) ke (is_active, is_verified) baru.
    Asumsi: 0 = inactive/unverified, 1 = active & verified.
    Sesuaikan jika sistem lama menggunakan nilai berbeda.
    """
    try:
        status = int(user_status or 0)
    except (ValueError, TypeError):
        status = 0

    if status == 1:
        return True, True   # aktif dan terverifikasi
    else:
        return False, False  # belum aktif / belum terverifikasi


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def migrate():
    log.info("=" * 60)
    log.info("MULAI MIGRASI: Old PHP/MySQL → New FastAPI/PostgreSQL")
    log.info(f"Mode: {'DRY-RUN (tidak ada yang diinsert)' if DRY_RUN else 'LIVE INSERT'}")
    log.info("=" * 60)

    log.info("Menghubungkan ke database lama (MySQL)...")
    old_engine = create_engine(OLD_DB_URL, pool_pre_ping=True)
    OldSession = sessionmaker(bind=old_engine)

    log.info("Menghubungkan ke database baru (PostgreSQL)...")
    new_engine = create_engine(NEW_DB_URL, pool_pre_ping=True)
    NewSession = sessionmaker(bind=new_engine)

    old_db = OldSession()
    new_db = NewSession()

    # Mapping: old_user_id (string INT) → new_user_id (UUID string)
    id_map = {}

    try:
        # ── STEP 1: Ambil semua data users_vendors lama ──────────────────────
        log.info("\n[STEP 1] Mengambil data users_vendors lama...")
        old_vendors_result = old_db.execute(text("SELECT * FROM users_vendors"))
        old_vendors = old_vendors_result.mappings().all()
        log.info(f"  → Ditemukan {len(old_vendors)} baris di users_vendors.")

        if not old_vendors:
            log.warning("Tidak ada data di users_vendors lama. Proses selesai.")
            return

        # Set user_id yang ada di users_vendors (yang akan dimigrasi)
        vendor_user_ids = {str(v["user_id"]) for v in old_vendors}
        log.info(f"  → User ID yang akan dimigrasi: {sorted(vendor_user_ids)}")

        # ── STEP 2: Ambil user lama hanya yang ada di users_vendors ──────────
        log.info("\n[STEP 2] Mengambil data users lama (filter hanya yang ada di users_vendors)...")
        placeholders = ", ".join([f":id_{i}" for i in range(len(vendor_user_ids))])
        params = {f"id_{i}": uid for i, uid in enumerate(vendor_user_ids)}
        old_users_result = old_db.execute(
            text(f"SELECT * FROM users WHERE user_id IN ({placeholders})"),
            params,
        )
        old_users = old_users_result.mappings().all()
        log.info(f"  → Ditemukan {len(old_users)} user lama yang cocok.")

        # Buat dict user lama: {user_id_str: row}
        old_users_dict = {str(u["user_id"]): u for u in old_users}

        # Cek apakah ada vendor yang user-nya tidak ditemukan di tabel users
        missing_users = vendor_user_ids - set(old_users_dict.keys())
        if missing_users:
            log.warning(f"  ⚠ user_id berikut ada di users_vendors tapi tidak di users: {missing_users}")

        # ── STEP 3: Insert ke tabel `users` baru ─────────────────────────────
        log.info("\n[STEP 3] Insert ke tabel `users` baru...")
        user_success = 0
        user_skip = 0

        for old_uid_str, old_user in old_users_dict.items():
            new_uuid = uuid.uuid4()
            id_map[old_uid_str] = str(new_uuid)

            is_active, is_verified = map_user_status(old_user.get("user_status", "0"))
            fixed_password = fix_bcrypt_hash(old_user.get("user_password", ""))

            created_at = old_user.get("created_at") or now_utc()
            updated_at = old_user.get("updated_at") or now_utc()
            last_login_at = old_user.get("last_login_at")

            insert_user = text("""
                INSERT INTO users (
                    id, user_name, user_email, user_phone, user_password,
                    user_type, ig_link, fb_link, yt_link, tiktok_link,
                    is_active, is_verified, is_create_user,
                    tnc_accepted, tnc_accepted_at,
                    last_login_at, created_at, updated_at
                ) VALUES (
                    :id, :user_name, :user_email, :user_phone, :user_password,
                    :user_type, :ig_link, :fb_link, :yt_link, :tiktok_link,
                    :is_active, :is_verified, :is_create_user,
                    :tnc_accepted, :tnc_accepted_at,
                    :last_login_at, :created_at, :updated_at
                )
                ON CONFLICT (user_email) DO NOTHING
            """)

            user_params = {
                "id": new_uuid,
                "user_name": (old_user.get("user_name") or "").strip(),
                "user_email": (old_user.get("user_email") or "").strip(),
                "user_phone": old_user.get("user_phone") or None,
                "user_password": fixed_password,
                "user_type": 2,  # Semua dari users_vendors → user_type=2 (Vendor)
                "ig_link": old_user.get("ig_link"),
                "fb_link": old_user.get("fb_link"),
                "yt_link": old_user.get("yt_link"),
                "tiktok_link": old_user.get("tiktok_link"),
                "is_active": is_active,
                "is_verified": is_verified,
                "is_create_user": False,
                "tnc_accepted": False,
                "tnc_accepted_at": None,
                "last_login_at": last_login_at,
                "created_at": created_at,
                "updated_at": updated_at,
            }

            if DRY_RUN:
                log.info(
                    f"  [DRY-RUN] User: email={user_params['user_email']}"
                    f" | old_id={old_uid_str} → new_uuid={new_uuid}"
                )
                user_success += 1
            else:
                result = new_db.execute(insert_user, user_params)
                if result.rowcount > 0:
                    log.info(
                        f"  ✓ User: {user_params['user_email']}"
                        f" (old_id={old_uid_str} → {new_uuid})"
                    )
                    user_success += 1
                else:
                    log.warning(
                        f"  ⚠ SKIP (email sudah ada): {user_params['user_email']}"
                    )
                    user_skip += 1

        log.info(f"  → User inserted: {user_success}, skipped: {user_skip}")

        # ── STEP 4: Insert ke tabel `vendors` baru ───────────────────────────
        log.info("\n[STEP 4] Insert ke tabel `vendors` baru...")
        vendor_success = 0
        vendor_skip = 0

        for old_vendor in old_vendors:
            old_uid_str = str(old_vendor["user_id"])
            new_user_uuid_str = id_map.get(old_uid_str)

            if not new_user_uuid_str:
                log.warning(
                    f"  ⚠ vendor dengan user_id={old_uid_str} tidak punya mapping UUID. Skip."
                )
                vendor_skip += 1
                continue

            vendor_uuid = uuid.uuid4()

            # vendor_area: lama nullable, baru NOT NULL → default 0
            vendor_area = old_vendor.get("vendor_area")
            if vendor_area is None:
                vendor_area = 0
                log.warning(
                    f"  ⚠ vendor_area NULL untuk user_id={old_uid_str},"
                    f" diset ke 0. Perlu diupdate manual setelah migrasi."
                )

            # vendor_cashback_percent: pastikan float
            try:
                cashback = float(old_vendor.get("vendor_cashback_percent") or 0)
            except (ValueError, TypeError):
                cashback = 0.0

            # vendor_min_spend: Decimal
            min_spend_raw = old_vendor.get("vendor_min_spend")
            try:
                min_spend = Decimal(str(min_spend_raw)) if min_spend_raw else None
            except Exception:
                min_spend = None

            insert_vendor = text("""
                INSERT INTO vendors (
                    id, user_id,
                    vendor_status, approval_notes,
                    vendor_business_name, vendor_category, vendor_area,
                    vendor_npwp, vendor_nib, vendor_owner_id_card_url,
                    vendor_location, vendor_contact_person, vendor_website,
                    vendor_short_description, vendor_opening_hours,
                    vendor_min_spend, vendor_cashback_percent, vendor_know_from,
                    gallery_urls, deposit_balance, deposit_minimum,
                    allow_direct_booking, created_at, updated_at
                ) VALUES (
                    :id, :user_id,
                    :vendor_status, :approval_notes,
                    :vendor_business_name, :vendor_category, :vendor_area,
                    :vendor_npwp, :vendor_nib, :vendor_owner_id_card_url,
                    :vendor_location, :vendor_contact_person, :vendor_website,
                    :vendor_short_description, :vendor_opening_hours,
                    :vendor_min_spend, :vendor_cashback_percent, :vendor_know_from,
                    :gallery_urls, :deposit_balance, :deposit_minimum,
                    :allow_direct_booking, :created_at, :updated_at
                )
                ON CONFLICT (user_id) DO NOTHING
            """)

            vendor_params = {
                "id": vendor_uuid,
                "user_id": uuid.UUID(new_user_uuid_str),
                # Data lama dianggap sudah ada isinya → set ke "pending" untuk review admin
                "vendor_status": "pending",
                "approval_notes": None,
                "vendor_business_name": (old_vendor.get("vendor_business_name") or "").strip(),
                "vendor_category": int(old_vendor.get("vendor_category") or 0),
                "vendor_area": int(vendor_area),
                # Field baru yang tidak ada di data lama → kosongkan
                "vendor_npwp": None,
                "vendor_nib": None,
                "vendor_owner_id_card_url": None,
                "vendor_location": old_vendor.get("vendor_location"),
                "vendor_contact_person": old_vendor.get("vendor_contact_person"),
                "vendor_website": old_vendor.get("vendor_website"),
                "vendor_short_description": old_vendor.get("vendor_short_description"),
                "vendor_opening_hours": old_vendor.get("vendor_opening_hours"),
                "vendor_min_spend": min_spend,
                "vendor_cashback_percent": cashback,
                "vendor_know_from": old_vendor.get("vendor_know_from"),
                # Field baru: kosong default
                "gallery_urls": json.dumps([]),
                "deposit_balance": Decimal("0.00"),
                "deposit_minimum": None,
                "allow_direct_booking": True,
                "created_at": now_utc(),
                "updated_at": now_utc(),
            }

            if DRY_RUN:
                log.info(
                    f"  [DRY-RUN] Vendor: {vendor_params['vendor_business_name']}"
                    f" | old_user_id={old_uid_str} → vendor_id={vendor_uuid}"
                )
                vendor_success += 1
            else:
                result = new_db.execute(insert_vendor, vendor_params)
                if result.rowcount > 0:
                    log.info(
                        f"  ✓ Vendor: {vendor_params['vendor_business_name']}"
                        f" (old_user_id={old_uid_str} → {vendor_uuid})"
                    )
                    vendor_success += 1
                else:
                    log.warning(
                        f"  ⚠ SKIP (user_id sudah ada di vendors): user_id={new_user_uuid_str}"
                    )
                    vendor_skip += 1

        log.info(f"  → Vendor inserted: {vendor_success}, skipped: {vendor_skip}")

        # ── STEP 5: Commit & simpan ID map ───────────────────────────────────
        if not DRY_RUN:
            new_db.commit()
            log.info("\n✅ Semua data berhasil di-commit ke database baru.")
        else:
            log.info("\n[DRY-RUN] Tidak ada yang di-commit ke database baru.")

        # Simpan mapping ID lama → baru (penting untuk migrasi tabel FK lain nanti)
        with open(ID_MAP_FILE, "w") as f:
            json.dump(id_map, f, indent=2)

        log.info("=" * 60)
        log.info("RINGKASAN MIGRASI")
        log.info(f"  Total user dimigrasikan : {user_success}")
        log.info(f"  Total vendor dimigrasikan: {vendor_success}")
        log.info(f"  Mapping ID tersimpan di  : {ID_MAP_FILE}")
        log.info("=" * 60)

    except Exception as e:
        new_db.rollback()
        log.error(f"❌ Error saat migrasi, rollback dilakukan: {e}")
        raise
    finally:
        old_db.close()
        new_db.close()


if __name__ == "__main__":
    migrate()
