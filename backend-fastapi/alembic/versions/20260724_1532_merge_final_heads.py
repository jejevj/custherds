"""merge final heads: bfc6e224b7f3 + 20260724_1531

Revision ID: 20260724_1532
Revises: bfc6e224b7f3, 20260724_1531
Create Date: 2026-07-24 15:32:00

Menggabungkan dua head yang tersisa:
  - bfc6e224b7f3  (revision di DB yang file migration-nya tidak ada di repo)
  - 20260724_1531 (merge head sebelumnya)
menjadi SATU head tunggal permanen.
Setelah ini `alembic upgrade head` (singular) bisa dipakai normal.
"""
from alembic import op  # noqa: F401

revision = '20260724_1532'
down_revision = ('bfc6e224b7f3', '20260724_1531')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass  # merge-only, tidak ada DDL


def downgrade() -> None:
    pass  # merge-only, tidak ada DDL
