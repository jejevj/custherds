"""add_allow_direct_booking_to_vendors

Revision ID: a1b2c3d4e5f6
Revises: 0002
Create Date: 2026-06-26 14:05:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'a1b2c3d4e5f6'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Step 1: tambah kolom sebagai nullable dulu
    op.add_column('vendors', sa.Column('allow_direct_booking', sa.Boolean(), nullable=True))

    # Step 2: isi semua row yang ada dengan True (default)
    op.execute("UPDATE vendors SET allow_direct_booking = TRUE WHERE allow_direct_booking IS NULL")

    # Step 3: set NOT NULL setelah data terisi
    op.alter_column('vendors', 'allow_direct_booking', nullable=False)


def downgrade() -> None:
    op.drop_column('vendors', 'allow_direct_booking')
