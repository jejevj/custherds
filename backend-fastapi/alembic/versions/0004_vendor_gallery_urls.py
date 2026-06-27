"""add gallery_urls to vendors

Revision ID: 0004_vendor_gallery_urls
Revises: 0003
Create Date: 2026-06-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = '0004_vendor_gallery_urls'
down_revision = None   # ganti dengan revision ID migrasi sebelumnya
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'vendors',
        sa.Column('gallery_urls', JSONB, nullable=True, server_default='[]')
    )


def downgrade() -> None:
    op.drop_column('vendors', 'gallery_urls')
