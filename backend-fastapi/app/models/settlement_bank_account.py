import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class SettlementBankAccount(Base):
    """
    Menyimpan data rekening bank settlement yang didaftarkan ke DOKU
    melalui Bulk Registration Bank H2H API.

    Lifecycle:
      1. POST /v2/settlement-bank-account  → create, status = pending
      2. DOKU verifikasi rekening          → status = verified / rejected
      3. PUT  /v2/settlement-bank-account  → update (hanya jika verified)
      4. GET  /v2/settlement-bank-account/{id} → sync status terbaru dari DOKU

    Relasi:
      - guide_id  : rekening milik Guide (nullable jika milik platform/vendor)
      - vendor_id : rekening milik Vendor (nullable)
      Salah satu dari keduanya wajib diisi.
    """
    __tablename__ = "settlement_bank_accounts"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # ── Ownership (salah satu wajib diisi) ───────────────────────────────────
    guide_id                    = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="CASCADE"), nullable=True, index=True)
    vendor_id                   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=True, index=True)

    # ── Data Rekening ─────────────────────────────────────────────────────────
    bank_code                   = Column(String(20), nullable=False)          # Kode bank DOKU, e.g. "014" = BCA
    account_number              = Column(String(50), nullable=False)
    account_name                = Column(String(255), nullable=False)         # Nama pemilik rekening
    account_email               = Column(String(255), nullable=True)          # Email terkait (opsional dari DOKU)

    # ── Response DOKU ────────────────────────────────────────────────────────
    doku_sba_id                 = Column(String(255), nullable=True, unique=True, index=True)  # bank_account_settlement_id dari DOKU
    doku_reference_no           = Column(String(255), nullable=True)          # Reference number dari response DOKU
    doku_status                 = Column(String(50), nullable=True)           # Status dari DOKU: PENDING, VERIFIED, REJECTED
    doku_rejection_reason       = Column(Text, nullable=True)                 # Alasan penolakan jika REJECTED
    doku_raw_response           = Column(Text, nullable=True)                 # JSON response mentah dari DOKU (untuk debugging)

    # ── Status Internal ───────────────────────────────────────────────────────
    # pending       = baru didaftarkan, menunggu verifikasi DOKU
    # verified      = DOKU sudah verifikasi, siap dipakai disbursement
    # rejected      = DOKU menolak rekening
    # synced        = sudah di-GET ulang dan status disinkronkan
    status                      = Column(String(30), default="pending", nullable=False, index=True)
    is_primary                  = Column(Boolean, default=False, nullable=False)  # Rekening utama untuk disbursement

    # ── Timestamps ───────────────────────────────────────────────────────────
    registered_at               = Column(DateTime(timezone=True), nullable=True)   # Waktu DOKU terima pendaftaran
    verified_at                 = Column(DateTime(timezone=True), nullable=True)   # Waktu DOKU verifikasi
    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    guide                       = relationship("Guide", back_populates="settlement_bank_accounts")
    vendor                      = relationship("Vendor", back_populates="settlement_bank_accounts")
