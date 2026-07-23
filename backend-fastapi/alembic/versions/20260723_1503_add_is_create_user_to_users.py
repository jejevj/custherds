"""add is_create_user to users

Revision ID: 20260723_1503
Revises: 20260723_1400
Create Date: 2026-07-23 15:03:00

Changes:
- Add is_create_user (BOOLEAN, NOT NULL, DEFAULT FALSE) to users table
  Flag yang menandai apakah user admin boleh membuat user internal lainnya.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260723_1503'
down_revision = '20260723_1400'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('is_create_user', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )


def downgrade() -> None:
    op.drop_column('users', 'is_create_user')
