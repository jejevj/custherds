"""add tx_attempt to bookings

Revision ID: a1f3c9e20001
Revises: f7c3b9d21e04
Create Date: 2026-06-27 15:15:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1f3c9e20001'
down_revision = 'f7c3b9d21e04'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'bookings',
        sa.Column('tx_attempt', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('bookings', 'tx_attempt')
