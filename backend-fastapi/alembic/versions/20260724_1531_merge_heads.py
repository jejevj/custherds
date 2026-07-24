"""merge multiple heads into single chain

Revision ID: 20260724_1531
Revises: 20260724_1530, 04d840a1d859
Create Date: 2026-07-24 15:31:00

Menggabungkan dua head:
  - 20260724_1530 (payment_gateway_configs — chain utama)
  - 04d840a1d859  (migration lama broken chain, sudah di-no-op)
menjadi satu head tunggal agar `alembic upgrade head` bisa berjalan.
"""
from alembic import op  # noqa: F401

revision = '20260724_1531'
down_revision = ('20260724_1530', '04d840a1d859')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass  # merge-only, tidak ada DDL


def downgrade() -> None:
    pass  # merge-only, tidak ada DDL
