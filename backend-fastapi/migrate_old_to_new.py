#!/usr/bin/env python3
"""
migrate_old_to_new.py
=====================
Script migrasi data dari file JSON ekspor PHPMyAdmin
(users.json + users_vendors.json) ke database baru PostgreSQL/FastAPI.

Aturan migrasi:
- Dari users.json    : hanya user yang user_id-nya ada di users_vendors.json yang dimigrasi.
                       user dengan user_type='0' (admin) tetap dimigrasi jika ada di users_vendors.
- Dari users_vendors.json : semua baris dimigrasi ke tabel 'vendors' baru.
- Password hash PHP $2y$ dikonversi ke $2b$ agar kompatibel dengan passlib Python.
- Field yang tidak ada di data lama diisi default/null.

Mapping user_status lama:
  '0' = belum aktif/belum diverifikasi -> is_active=False, is_verified=False
  '1' = aktif dan sudah diverifikasi   -> is_active=True,  is_verified=True
  '2' = aktif, belum diverifikasi      -> is_active=True,  is_verified=False

Field lama yang TIDAK ada di model baru (diabaikan):
  users: user_username, last_login_ip, login_attempts, locked_until,
         remember_token, remember_expired, password_reset_token,
         password_reset_expires, updated_by, deleted_by, deleted_at
  users_vendors: vendor_access_level, vendor_google_map,
                 vendor_languages_spoken, vendor_tags

Prasyarat:
    pip install sqlalchemy psycopg2-binary python-dotenv

Cara pakai:
    1. Edit bagian KONFIGURASI di bawah (NEW_DB_URL).
    2. Pastikan users.json dan users_vendors.json berada di folder yang sama
       dengan script ini (atau sesuaikan path USERS_JSON / VENDORS_JSON).
    3. Set DRY_RUN = True dulu untuk cek log tanpa insert.
    4. Jalankan: python migrate_old_to_new.py
    5. Cek file migration_id_map.json untuk mapping old_user_id -> new UUID.
"""

import json
import uuid
import logging
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ─── KONFIGURASI ────────────────────────────────────────────────────────────────

# Database BARU (PostgreSQL FastAPI).
# Bisa juga load dari .env:
#   from dotenv import load_dotenv; import os; load_dotenv()
#   NEW_DB_URL = os.getenv("DATABASE_URL")
NEW_DB_URL = "postgresql://USER:PASSWORD@HOST:5432/custherds_new"

# Path file JSON (relative ke direktori script ini)
BASE_DIR     = Path(__file__).parent
USERS_JSON   = BASE_DIR / "users.json"
VENDORS_JSON = BASE_DIR / "users_vendors.json"

# File output mapping ID lama (INT string) → ID baru (UUID string)
ID_MAP_FILE = BASE_DIR / "migration_id_map.json"

# Dry-run: True = hanya log, tidak ada yang diinsert ke database
DRY_RUN = False

# ────────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("migration")


def load_json_table(filepath: Path, table_name: str) -> list[dict]:
    """Parse format export PHPMyAdmin: ambil list 'data' dari entry type='table'."""
    raw = json.loads(filepath.read_text(encoding="utf-8"))
    for entry in raw:
        if isinstance(entry, dict) and entry.get("type") == "table" and entry.get("name") == table_name:
            return entry.get("data", [])
    raise ValueError(f"Tabel '{table_name}' tidak ditemukan di {filepath}")


def fix_bcrypt_hash(php_hash: str | None) -> str:
    """
    PHP memakai prefix $2y$ untuk bcrypt; Python passlib pakai $2b$.
    Algoritmanya identik, aman untuk ganti prefix.
    """
    h = (php_hash or "").strip()
    if h.startswith("$2y$"):
        return "$2b$" + h[4:]
    return h


def parse_user_status(status_val) -> tuple[bool, bool]:
    """
    Konversi user_status lama ke (is_active, is_verified).
      '0' → (False, False) – belum aktif
      '1' → (True,  True)  – aktif & terverifikasi
      '2' → (True,  False) – aktif, belum terverifikasi
    """
    try:
        s = int(status_val or 0)
    except (ValueError, TypeError):
        s = 0
    if s == 1:
        return True, True
    if s == 2:
        return True, False
    return False, False


def parse_datetime(val) -> datetime | None:
    if not val:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(str(val), fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def clean_str(val) -> str | None:
    """Kosongkan string kosong menjadi None, strip whitespace."""
    if val is None:
        return None
    s = str(val).strip()
    return s if s else None


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def migrate():
    log.info("=" * 65)
    log.info("MIGRASI: users.json + users_vendors.json → PostgreSQL baru")
    log.info(f"Mode   : {'DRY-RUN (tidak ada insert)' if DRY_RUN else 'LIVE INSERT'}")
    log.info("=" * 65)

    # ── Load file JSON ──────────────────────────────────────────────────────
    log.info(f"\nMemuat {USERS_JSON.name} ...")
    old_users_list = load_json_table(USERS_JSON, "users")
    log.info(f"  → {len(old_users_list)} baris users ditemukan.")

    log.info(f"Memuat {VENDORS_JSON.name} ...")
    old_vendors_list = load_json_table(VENDORS_JSON, "users_vendors")
    log.info(f"  → {len(old_vendors_list)} baris users_vendors ditemukan.")

    # ── Tentukan user_id mana yang ada di users_vendors ─────────────────────
    vendor_user_ids: set[str] = {str(v["user_id"]) for v in old_vendors_list}
    log.info(f"\nUser ID yang akan dimigrasi (ada di users_vendors): {sorted(vendor_user_ids, key=int)}")

    # ── Filter users: hanya yang ada di users_vendors ───────────────────────
    old_users_to_migrate = {
        str(u["user_id"]): u
        for u in old_users_list
        if str(u["user_id"]) in vendor_user_ids
    }

    missing = vendor_user_ids - set(old_users_to_migrate.keys())
    if missing:
        log.warning(f"  ⚠ user_id {sorted(missing)} ada di users_vendors tapi tidak di users.json!")

    log.info(f"  → {len(old_users_to_migrate)} user yang akan dimigrasi.")

    # ── Cek user yang ADA di users.json tapi TIDAK di users_vendors ─────────
    skipped_users = [
        f"id={u['user_id']} ({u['user_name']}, type={u['user_type']})"
        for u in old_users_list
        if str(u["user_id"]) not in vendor_user_ids
    ]
    log.info(f"\nUser yang TIDAK dimigrasi ({len(skipped_users)} user):")
    for s in skipped_users:
        log.info(f"    SKIP → {s}")

    # ── Koneksi database baru ───────────────────────────────────────────────
    log.info("\nMenghubungkan ke database baru (PostgreSQL)...")
    engine = create_engine(NEW_DB_URL, pool_pre_ping=True)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Mapping: old_user_id_str → new UUID str
    id_map: dict[str, str] = {}

    try:
        # ── STEP 1: Insert ke tabel `users` baru ────────────────────────────
        log.info("\n" + "─" * 50)
        log.info("[STEP 1] Insert ke tabel `users` baru...")
        log.info("─" * 50)

        user_ok = user_skip = 0

        for old_uid, old_user in old_users_to_migrate.items():
            new_uuid = uuid.uuid4()
            id_map[old_uid] = str(new_uuid)

            is_active, is_verified = parse_user_status(old_user.get("user_status"))

            params = {
                "id"             : new_uuid,
                "user_name"      : clean_str(old_user.get("user_name")) or "(no name)",
                "user_email"     : (old_user.get("user_email") or "").strip(),
                "user_phone"     : clean_str(old_user.get("user_phone")),
                "user_password"  : fix_bcrypt_hash(old_user.get("user_password")),
                "user_type"      : 2,  # semua dari users_vendors → Vendor
                "ig_link"        : clean_str(old_user.get("ig_link")),
                "fb_link"        : clean_str(old_user.get("fb_link")),
                "yt_link"        : clean_str(old_user.get("yt_link")),
                "tiktok_link"    : clean_str(old_user.get("tiktok_link")),
                "is_active"      : is_active,
                "is_verified"    : is_verified,
                "is_create_user" : False,
                "tnc_accepted"   : False,
                "tnc_accepted_at": None,
                "last_login_at"  : parse_datetime(old_user.get("last_login_at")),
                "created_at"     : parse_datetime(old_user.get("created_at")) or now_utc(),
                "updated_at"     : parse_datetime(old_user.get("updated_at")) or now_utc(),
            }

            if DRY_RUN:
                log.info(
                    f"  [DRY] user_id={old_uid} → {new_uuid}"
                    f" | {params['user_email']}"
                    f" | active={is_active} verified={is_verified}"
                )
                user_ok += 1
                continue

            result = db.execute(text("""
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
            """), params)

            if result.rowcount > 0:
                log.info(f"  ✓ user_id={old_uid} → {new_uuid} | {params['user_email']}")
                user_ok += 1
            else:
                log.warning(f"  ⚠ SKIP (email duplikat): {params['user_email']}")
                user_skip += 1

        log.info(f"  → Users inserted: {user_ok}, skipped: {user_skip}")

        # ── STEP 2: Insert ke tabel `vendors` baru ───────────────────────────
        log.info("\n" + "─" * 50)
        log.info("[STEP 2] Insert ke tabel `vendors` baru...")
        log.info("─" * 50)

        vendor_ok = vendor_skip = 0

        for old_vendor in old_vendors_list:
            old_uid = str(old_vendor["user_id"])
            new_user_uuid_str = id_map.get(old_uid)

            if not new_user_uuid_str:
                log.warning(f"  ⚠ SKIP vendor user_id={old_uid}: tidak ada mapping UUID (user tidak dimigrasi).")
                vendor_skip += 1
                continue

            vendor_uuid = uuid.uuid4()

            # vendor_area: NULL di data lama → default 0, tandai perlu update manual
            raw_area = old_vendor.get("vendor_area")
            if raw_area is None:
                vendor_area = 0
                log.warning(
                    f"  ⚠ vendor_area NULL untuk user_id={old_uid} "
                    f"({old_vendor.get('vendor_business_name')}). "
                    f"Di-set 0, perlu diupdate manual."
                )
            else:
                try:
                    vendor_area = int(raw_area)
                except (ValueError, TypeError):
                    vendor_area = 0

            # vendor_cashback_percent
            try:
                cashback = float(old_vendor.get("vendor_cashback_percent") or 0)
            except (ValueError, TypeError):
                cashback = 0.0

            # vendor_min_spend
            try:
                min_spend = Decimal(str(old_vendor.get("vendor_min_spend") or "0"))
            except Exception:
                min_spend = Decimal("0")

            # vendor_status: data lama sudah terisi → set 'pending' agar admin review
            vendor_status = "pending"

            params = {
                "id"                    : vendor_uuid,
                "user_id"               : uuid.UUID(new_user_uuid_str),
                "vendor_status"         : vendor_status,
                "approval_notes"        : None,
                "vendor_business_name"  : clean_str(old_vendor.get("vendor_business_name")) or "(no name)",
                "vendor_category"       : int(old_vendor.get("vendor_category") or 0),
                "vendor_area"           : vendor_area,
                "vendor_npwp"           : None,   # tidak ada di data lama
                "vendor_nib"            : None,   # tidak ada di data lama
                "vendor_owner_id_card_url": None, # tidak ada di data lama
                "vendor_location"       : clean_str(old_vendor.get("vendor_location")),
                "vendor_contact_person" : clean_str(old_vendor.get("vendor_contact_person")),
                "vendor_website"        : clean_str(old_vendor.get("vendor_website")),
                "vendor_short_description": clean_str(old_vendor.get("vendor_short_description")),
                "vendor_opening_hours"  : clean_str(old_vendor.get("vendor_opening_hours")),
                "vendor_min_spend"      : min_spend,
                "vendor_cashback_percent": cashback,
                "vendor_know_from"      : clean_str(old_vendor.get("vendor_know_from")),
                # Field baru yang tidak ada di data lama:
                "gallery_urls"          : json.dumps([]),
                "deposit_balance"       : Decimal("0.00"),
                "deposit_minimum"       : None,
                "allow_direct_booking"  : True,
                "created_at"            : now_utc(),
                "updated_at"            : now_utc(),
            }

            if DRY_RUN:
                log.info(
                    f"  [DRY] vendor user_id={old_uid} → {vendor_uuid}"
                    f" | {params['vendor_business_name']}"
                    f" | category={params['vendor_category']} area={params['vendor_area']}"
                )
                vendor_ok += 1
                continue

            result = db.execute(text("""
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
            """), params)

            if result.rowcount > 0:
                log.info(
                    f"  ✓ vendor user_id={old_uid} → {vendor_uuid}"
                    f" | {params['vendor_business_name']}"
                )
                vendor_ok += 1
            else:
                log.warning(f"  ⚠ SKIP (user_id sudah ada di vendors): user_id={new_user_uuid_str}")
                vendor_skip += 1

        log.info(f"  → Vendors inserted: {vendor_ok}, skipped: {vendor_skip}")

        # ── STEP 3: Commit & simpan mapping ID ──────────────────────────────
        if not DRY_RUN:
            db.commit()
            log.info("\n✅ Semua data berhasil di-commit ke database baru.")
        else:
            log.info("\n[DRY-RUN] Tidak ada commit ke database.")

        with open(ID_MAP_FILE, "w", encoding="utf-8") as f:
            json.dump(id_map, f, indent=2, ensure_ascii=False)

        log.info("\n" + "=" * 65)
        log.info("RINGKASAN MIGRASI")
        log.info(f"  Users dimigrasi   : {user_ok}")
        log.info(f"  Users di-skip     : {user_skip}")
        log.info(f"  Vendors dimigrasi : {vendor_ok}")
        log.info(f"  Vendors di-skip   : {vendor_skip}")
        log.info(f"  Mapping ID disimpan: {ID_MAP_FILE}")
        log.info("=" * 65)
        log.info("\n📋 CATATAN PASCA-MIGRASI:")
        log.info("  1. vendor_npwp, vendor_nib, vendor_owner_id_card_url → NULL (isi manual via backoffice)")
        log.info("  2. vendor_area=0 untuk vendor yang datanya NULL di lama (lihat warning di atas)")
        log.info("  3. Semua vendor_status='pending' → admin perlu approve satu per satu")
        log.info("  4. gallery_urls kosong [] → upload foto via backoffice")
        log.info("  5. Field lama yang diabaikan: vendor_access_level, vendor_google_map,")
        log.info("     vendor_languages_spoken, vendor_tags")
        log.info("  6. Field user lama yang diabaikan: user_username, last_login_ip,")
        log.info("     login_attempts, locked_until, remember_token, password_reset_*")

    except Exception as e:
        db.rollback()
        log.error(f"❌ Error → rollback dilakukan: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
