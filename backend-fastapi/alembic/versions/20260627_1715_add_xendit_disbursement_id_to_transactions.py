"""add xendit_disbursement_id to transactions

Revision ID: a1f3c8d92e04
Revises: 8152fd5b3533
Create Date: 2026-06-27 17:15:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1f3c8d92e04'
down_revision = '8152fd5b3533'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'transactions',
        sa.Column('xendit_disbursement_id', sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('transactions', 'xendit_disbursement_id')
