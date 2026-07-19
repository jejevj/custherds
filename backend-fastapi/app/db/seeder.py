"""Database seeder.

Run:
    cd backend-fastapi
    python -m app.db.seeder           # production: superadmin + split config
    python -m app.db.seeder --dev     # dev: add sample guide & vendor
    python -m app.db.seeder --dev --bookings  # dev + sample bookings (direct & package)
"""
import uuid
from datetime import datetime, timezone, date, time
from decimal import Decimal
from typing import Optional

from app.db.session import SessionLocal
from app.models.user import User
from app.models.guide import Guide
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.package import Package
from app.models.booking import Booking
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
    """Dev seed: Guide with status=pending (simulates real registration flow)."""
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
        user_phone="+6281234567890",
        is_active=True,
        is_verified=False,
        tnc_accepted=True,
        tnc_accepted_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    guide = Guide(
        id=uuid.uuid4(),
        user_id=user.id,
        guide_nationality="Indonesian",
        guide_certificate_status="pending",
        bio="Sample guide for development testing.",
        languages="English, Indonesian, Balinese",
        total_earnings=Decimal("0.00"),
        pending_earnings=Decimal("0.00"),
        wallet_balance=Decimal("0.00"),
    )
    db.add(guide)
    db.flush()
    print(f"  [OK] Sample guide (pending): {user.user_email}")
    return user


def seed_sample_guide_approved(db) -> Optional[User]:
    """Dev seed: Approved guide with full profile."""
    existing = db.query(User).filter(User.user_email == "guide.approved@custherds.dev").first()
    if existing:
        print("  [SKIP] Sample approved guide already exists")
        return existing
    user = User(
        id=uuid.uuid4(),
        user_name="Made Approved Guide",
        user_email="guide.approved@custherds.dev",
        user_password=get_password_hash("Guide@Dev2026!"),
        user_type=1,
        user_phone="+6281234567891",
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
        guide_status="approved",
        bio="Experienced guide specializing in Ubud cultural tours.",
        languages="English, Indonesian, Balinese, Japanese",
        total_earnings=Decimal("1250000.00"),
        pending_earnings=Decimal("125000.00"),
        wallet_balance=Decimal("375000.00"),
        bank_name="BCA",
        bank_account_number="1234567890",
        bank_account_name="Made Approved Guide",
    )
    db.add(guide)
    db.flush()
    print(f"  [OK] Sample approved guide: {user.user_email}")
    return user


def seed_sample_vendor(db) -> Optional[User]:
    """Dev seed: Vendor with status=pending."""
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
        user_phone="+6281234567892",
        is_active=True,
        is_verified=False,
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
        vendor_status="pending",
        deposit_balance=Decimal("0.00"),
    )
    db.add(vendor)
    db.flush()
    print(f"  [OK] Sample vendor (pending): {user.user_email}")
    return user


def seed_sample_vendor_approved(db) -> Optional[User]:
    """Dev seed: Approved vendor with full profile + products + packages."""
    existing = db.query(User).filter(User.user_email == "vendor.approved@custherds.dev").first()
    if existing:
        print("  [SKIP] Sample approved vendor already exists")
        return existing
    user = User(
        id=uuid.uuid4(),
        user_name="Nyoman Approved Vendor",
        user_email="vendor.approved@custherds.dev",
        user_password=get_password_hash("Vendor@Dev2026!"),
        user_type=2,
        user_phone="+6281234567893",
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
        vendor_business_name="Neka Art Museum Ubud",
        vendor_category=35,
        vendor_area=10,
        vendor_location="Jl. Raya Sanggingan, Ubud, Gianyar, Bali",
        vendor_contact_person="Nyoman",
        vendor_website="https://nekaartmuseum.com",
        vendor_short_description="Premier art museum in Ubud showcasing traditional and modern Balinese art.",
        vendor_opening_hours="Mon-Sun 09:00-17:00",
        vendor_min_spend=Decimal("75000.00"),
        vendor_cashback_percent=12.0,
        vendor_know_from="Referral from Custherds team",
        vendor_status="approved",
        allow_direct_booking=True,
        deposit_balance=Decimal("5000000.00"),
    )
    db.add(vendor)
    db.flush()
    # Product (item jual satuan)
    product = Product(
        id=uuid.uuid4(),
        vendor_id=vendor.id,
        name="Museum Entry Ticket (Adult)",
        description="Full access to all galleries. Includes free audio guide.",
        price=Decimal("150000.00"),
        currency="IDR",
        min_pax=1,
        max_pax=50,
        is_active=True,
    )
    db.add(product)
    # Package (paket wisata dengan price_per_pax)
    package = Package(
        id=uuid.uuid4(),
        vendor_id=vendor.id,
        name="Museum Tour + Audio Guide",
        description="Full museum tour with audio guide for groups.",
        price_per_pax=Decimal("150000.00"),
        min_pax=1,
        max_pax=20,
        quota_per_slot=20,
        duration_minutes=120,
        is_active=True,
    )
    db.add(package)
    db.flush()
    print(f"  [OK] Sample approved vendor: {user.user_email} (+ 1 product, 1 package)")
    return user


def seed_sample_bookings(db) -> None:
    """
    Dev seed: buat sample booking (direct & package) yang mewakili
    setiap status lifecycle agar bisa ditest di dashboard.

    Membutuhkan: guide.approved@custherds.dev dan vendor.approved@custherds.dev
    sudah di-seed terlebih dahulu.
    """
    # Ambil guide & vendor yang sudah approved
    guide_user = db.query(User).filter(User.user_email == "guide.approved@custherds.dev").first()
    vendor_user = db.query(User).filter(User.user_email == "vendor.approved@custherds.dev").first()
    if not guide_user or not vendor_user:
        print("  [SKIP] Sample bookings: guide/vendor approved belum ada, jalankan --dev dulu")
        return

    guide = db.query(Guide).filter(Guide.user_id == guide_user.id).first()
    vendor = db.query(Vendor).filter(Vendor.user_id == vendor_user.id).first()
    package = db.query(Package).filter(Package.vendor_id == vendor.id).first()

    if not guide or not vendor:
        print("  [SKIP] Sample bookings: profil guide/vendor tidak ditemukan")
        return

    def _bk_code(db, prefix="BK"):
        import random, string
        while True:
            code = prefix + "".join(random.choices(string.digits, k=8))
            if not db.query(Booking).filter(Booking.booking_code == code).first():
                return code

    bookings_data = [
        # (label, booking_type, status, direct_price, use_package)
        ("direct pending_vendor",     "direct",  "pending_vendor",     Decimal("75000.00"),  False),
        ("direct confirmed",          "direct",  "confirmed",          Decimal("75000.00"),  False),
        ("direct pending_receipt",    "direct",  "pending_receipt",    Decimal("75000.00"),  False),
        ("direct pending_completion", "direct",  "pending_completion", Decimal("75000.00"),  False),
        ("direct completed",          "direct",  "completed",          Decimal("75000.00"),  False),
        ("direct cancelled",          "direct",  "cancelled",          Decimal("75000.00"),  False),
        ("package pending_vendor",    "package", "pending_vendor",     None,                 True),
        ("package confirmed",         "package", "confirmed",          None,                 True),
        ("package pending_receipt",   "package", "pending_receipt",    None,                 True),
        ("package completed",         "package", "completed",          None,                 True),
    ]

    created = 0
    for label, btype, bstatus, dprice, use_pkg in bookings_data:
        # Cek apakah sudah ada (berdasarkan notes label)
        existing = db.query(Booking).filter(
            Booking.guide_id == guide.id,
            Booking.vendor_id == vendor.id,
            Booking.notes == f"[seed] {label}",
        ).first()
        if existing:
            continue

        pkg_id = package.id if (use_pkg and package) else None
        pkg_price = package.price_per_pax if (use_pkg and package) else None
        subtotal_pkg = (pkg_price * Decimal("2")).quantize(Decimal("0.01")) if pkg_price else None
        direct_snapshot = dprice if btype == "direct" else None
        subtotal_dir = (dprice * Decimal("2")).quantize(Decimal("0.01")) if (btype == "direct" and dprice) else None

        bk = Booking(
            booking_code=_bk_code(db),
            guide_id=guide.id,
            vendor_id=vendor.id,
            booking_type=btype,
            package_id=pkg_id,
            package_price_snapshot=pkg_price,
            subtotal_package=subtotal_pkg,
            direct_price_snapshot=direct_snapshot,
            subtotal_direct=subtotal_dir,
            booking_date=date(2026, 8, 1),
            booking_time=time(10, 0),
            pax_count=2,
            tourist_names="Tanaka Kenji, Suzuki Yuki",
            tourist_nationality="Japanese",
            notes=f"[seed] {label}",
            status=bstatus,
            vendor_approval_at=datetime.now(timezone.utc) if bstatus not in ("pending_vendor", "rejected") else None,
            checkin_at=datetime.now(timezone.utc) if bstatus in ("pending_receipt", "pending_completion", "completed") else None,
            receipt_uploaded_at=datetime.now(timezone.utc) if bstatus in ("pending_completion", "completed") else None,
            completed_at=datetime.now(timezone.utc) if bstatus == "completed" else None,
            cancelled_by="guide" if bstatus == "cancelled" else None,
            cancelled_reason="Test cancel" if bstatus == "cancelled" else None,
            cancelled_at=datetime.now(timezone.utc) if bstatus == "cancelled" else None,
        )
        db.add(bk)
        created += 1

    db.flush()
    print(f"  [OK] Sample bookings: {created} booking dibuat (direct & package, semua status)")


def run_all_seeds(dev_mode: bool = False, seed_bookings: bool = False) -> None:
    db = SessionLocal()
    try:
        print("\n=== Custherds Database Seeder ===")
        admin = seed_superadmin(db)
        seed_revenue_split_config(db, admin)
        if dev_mode:
            print("\n--- Dev seeds (--dev) ---")
            seed_sample_guide(db)
            seed_sample_guide_approved(db)
            seed_sample_vendor(db)
            seed_sample_vendor_approved(db)
        if seed_bookings and dev_mode:
            print("\n--- Booking seeds (--bookings) ---")
            seed_sample_bookings(db)
        db.commit()
        print("\n[DONE] All seeds committed.\n")
        if dev_mode:
            print("Dev accounts:")
            print("  Guide  (pending):  guide@custherds.dev         / Guide@Dev2026!")
            print("  Guide  (approved): guide.approved@custherds.dev / Guide@Dev2026!")
            print("  Vendor (pending):  vendor@custherds.dev         / Vendor@Dev2026!")
            print("  Vendor (approved): vendor.approved@custherds.dev / Vendor@Dev2026!")
            print("  Admin:             admin@custherds.com           / Admin@Custherds2026!\n")
        if seed_bookings:
            print("  Jalankan --dev --bookings untuk seed booking sample (semua status).\n")
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeder failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    dev = "--dev" in sys.argv
    bookings = "--bookings" in sys.argv
    run_all_seeds(dev_mode=dev, seed_bookings=bookings)
