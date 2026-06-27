"""add tx_attempt to bookings

Revision ID: a1f3c9e20001
Revises: 20260627_0516_add_checkin_receipt_fields_to_bookings
Create Date: 2026-06-27 15:15:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1f3c9e20001'
down_revision = '20260627_0516'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'bookings',
        sa.Column('tx_attempt', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('bookings', 'tx_attempt')
