"""Database seeder.

Jalankan:
    cd backend-fastapi
    python -m app.db.seeder           # production: superadmin + split config
    python -m app.db.seeder --dev     # dev: tambah sample guide & vendor
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from app.db.session import SessionLocal
from app.models.user import User
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.revenue_split_config import RevenueSplitConfig
from app.core.security import get_password_hash


def seed_superadmin(db) -> User:
    existing = db.query(User).filter(User.user_email == "admin@custherds.com").first()
    if existing:
        print("  [SKIP] Superadmin already exists")
        return existing
    admin = User(
        id=uuid.uuid4(),
        user_name="Custherds Admin",
        user_email="admin@custherds.com",
        user_password=get_password_hash("Admin@Custherds2026!"),
        user_type=99,
        is_active=True,
        is_verified=True,
        tnc_accepted=True,
        tnc_accepted_at=datetime.now(timezone.utc),
    )
    db.add(admin)
    db.flush()
    print(f"  [OK] Superadmin created: {admin.user_email}")
    return admin


def seed_revenue_split_config(db, admin: User) -> RevenueSplitConfig:
    existing = db.query(RevenueSplitConfig).filter(
        RevenueSplitConfig.is_active == True  # noqa: E712
    ).first()
    if existing:
        print("  [SKIP] Active revenue split config already exists")
        return existing
    config = RevenueSplitConfig(
        id=uuid.uuid4(),
        vendor_percent=85.0,
        guide_percent=10.0,
        platform_percent=5.0,
        is_active=True,
        notes="Default: 85% vendor / 10% guide / 5% platform",
        set_by=admin.id,
        effective_from=datetime.now(timezone.utc),
    )
    db.add(config)
    db.flush()
    print(
        f"  [OK] Revenue split: vendor={config.vendor_percent}% / "
        f"guide={config.guide_percent}% / platform={config.platform_percent}%"
    )
    return config


def seed_sample_guide(db) -> Optional[User]:
    existing = db.query(User).filter(User.user_email == "guide@custherds.dev").first()
    if existing:
        print("  [SKIP] Sample guide already exists")
        return existing
    user = User(
        id=uuid.uuid4(),
        user_name="Wayan Sample Guide",
        user_email="guide@custherds.dev",
        user_password=get_password_hash("Guide@Dev2026!"),
        user_type=1,
        is_active=True,
        is_verified=True,
        tnc_accepted=True,
        tnc_accepted_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    guide = Guide(
        id=uuid.uuid4(),
        user_id=user.id,
        guide_nationality="Indonesian",
        guide_certificate_status="approved",
        bio="Sample guide for development testing.",
        languages="English, Indonesian, Balinese",
        total_earnings=Decimal("0.00"),
        pending_earnings=Decimal("0.00"),
        wallet_balance=Decimal("0.00"),
        bank_name="BCA",
        bank_account_number="1234567890",
        bank_account_name="Wayan Sample Guide",
    )
    db.add(guide)
    db.flush()
    print(f"  [OK] Sample guide: {user.user_email}")
    return user


def seed_sample_vendor(db) -> Optional[User]:
    existing = db.query(User).filter(User.user_email == "vendor@custherds.dev").first()
    if existing:
        print("  [SKIP] Sample vendor already exists")
        return existing
    user = User(
        id=uuid.uuid4(),
        user_name="Ketut Sample Vendor",
        user_email="vendor@custherds.dev",
        user_password=get_password_hash("Vendor@Dev2026!"),
        user_type=2,
        is_active=True,
        is_verified=True,
        tnc_accepted=True,
        tnc_accepted_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    vendor = Vendor(
        id=uuid.uuid4(),
        user_id=user.id,
        vendor_business_name="Warung Sample Ubud",
        vendor_category=27,
        vendor_area=10,
        vendor_location="Jl. Monkey Forest No. 1, Ubud, Bali",
        vendor_short_description="Sample restaurant for development testing.",
        vendor_opening_hours="Mon-Sun 08:00-22:00",
        vendor_min_spend=Decimal("100000.00"),
        vendor_cashback_percent=10.0,
        vendor_status="approved",
        deposit_balance=Decimal("5000000.00"),
    )
    db.add(vendor)
    db.flush()
    product = Product(
        id=uuid.uuid4(),
        vendor_id=vendor.id,
        name="Nasi Campur Ubud",
        description="Traditional Balinese mixed rice, serves 1 pax.",
        price=Decimal("75000.00"),
        currency="IDR",
        min_pax=1,
        max_pax=10,
        is_active=True,
    )
    db.add(product)
    db.flush()
    print(f"  [OK] Sample vendor: {user.user_email}")
    return user


def run_all_seeds(dev_mode: bool = False) -> None:
    db = SessionLocal()
    try:
        print("\n=== Custherds Database Seeder ===")
        admin = seed_superadmin(db)
        seed_revenue_split_config(db, admin)
        if dev_mode:
            print("\n--- Dev seeds (--dev) ---")
            seed_sample_guide(db)
            seed_sample_vendor(db)
        db.commit()
        print("\n[DONE] All seeds committed.\n")
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeder failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    dev = "--dev" in sys.argv
    run_all_seeds(dev_mode=dev)
