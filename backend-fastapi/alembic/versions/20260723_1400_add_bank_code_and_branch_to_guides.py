"""add bank_code and bank_branch to guides

Revision ID: 20260723_1400
Revises: 
Create Date: 2026-07-23 14:00:00

Changes:
- Add bank_code (VARCHAR 20, nullable) to guides table
- Add bank_branch (VARCHAR 255, nullable) to guides table
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260723_1400'
down_revision = None  # update this to the latest revision in your chain
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add bank_code column — kode bank, e.g. '014' = BCA
    op.add_column(
        'guides',
        sa.Column('bank_code', sa.String(20), nullable=True)
    )
    # Add bank_branch column — kantor cabang pembuatan bank
    op.add_column(
        'guides',
        sa.Column('bank_branch', sa.String(255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('guides', 'bank_branch')
    op.drop_column('guides', 'bank_code')
