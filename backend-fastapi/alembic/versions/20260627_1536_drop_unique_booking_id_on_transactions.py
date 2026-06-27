"""drop unique constraint booking_id on transactions

Revision ID: b2e4d1f30002
Revises: a1f3c9e20001
Create Date: 2026-06-27 15:36:00.000000

Alasan:
  Kolom booking_id di tabel transactions sebelumnya punya UNIQUE constraint,
  sehingga 1 booking hanya bisa punya 1 transaksi.
  Sekarang 1 booking bisa punya lebih dari 1 transaksi (tx lama rejected,
  guide submit ulang tx baru), sehingga constraint UNIQUE harus dihapus.
"""
from alembic import op

revision = 'b2e4d1f30002'
down_revision = 'a1f3c9e20001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop unique constraint pada kolom booking_id di tabel transactions
    # Nama constraint default PostgreSQL: transactions_booking_id_key
    op.drop_constraint('transactions_booking_id_key', 'transactions', type_='unique')


def downgrade() -> None:
    # Kembalikan unique constraint (hati-hati: akan gagal jika sudah ada duplikat data)
    op.create_unique_constraint('transactions_booking_id_key', 'transactions', ['booking_id'])
