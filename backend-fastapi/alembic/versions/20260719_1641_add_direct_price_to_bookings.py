"""add_direct_price_to_bookings

Revision ID: 7d9f4e2c1b83
Revises: 04d840a1d859
Create Date: 2026-07-19 16:41:00

Parity direct booking dengan package booking:
- direct_price_snapshot: harga per-pax yang disepakati saat guide buat direct booking
- subtotal_direct: direct_price_snapshot * pax_count (sama seperti subtotal_package)
"""
from alembic import op
import sqlalchemy as sa


revision = '7d9f4e2c1b83'
down_revision = '04d840a1d859'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'bookings',
        sa.Column('direct_price_snapshot', sa.Numeric(15, 2), nullable=True),
    )
    op.add_column(
        'bookings',
        sa.Column('subtotal_direct', sa.Numeric(15, 2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('bookings', 'subtotal_direct')
    op.drop_column('bookings', 'direct_price_snapshot')
