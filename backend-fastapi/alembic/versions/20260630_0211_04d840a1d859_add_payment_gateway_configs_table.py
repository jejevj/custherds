"""DEPRECATED — digantikan oleh 20260724_1530_add_payment_gateway_configs_table.py

File ini dikosongkan karena down_revision 'f9a1b2c3d4e5' tidak valid
dan menyebabkan Alembic gagal build migration chain.

Revision ID: 04d840a1d859
Revises: f9a1b2c3d4e5  <-- TIDAK ADA, file ini di-skip Alembic
Create Date: 2026-06-30 02:11:00
"""
from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

revision = '04d840a1d859'
down_revision = 'f9a1b2c3d4e5'  # intentionally broken — migration ini di-skip
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass  # no-op — sudah dipindahkan ke 20260724_1530


def downgrade() -> None:
    pass  # no-op
