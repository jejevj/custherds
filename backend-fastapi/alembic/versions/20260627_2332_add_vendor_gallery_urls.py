"""add gallery_urls to vendors

Revision ID: f9a1b2c3d4e5
Revises: a1f3c8d92e04
Create Date: 2026-06-27 23:32:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'f9a1b2c3d4e5'
down_revision = 'a1f3c8d92e04'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tambah kolom gallery_urls jika belum ada
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='vendors' AND column_name='gallery_urls'"
    ))
    if result.fetchone() is None:
        op.add_column(
            'vendors',
            sa.Column('gallery_urls', JSONB, nullable=True, server_default="'[]'")
        )

    # Fix existing rows yang gallery_urls = NULL
    conn.execute(sa.text(
        "UPDATE vendors SET gallery_urls = '[]'::jsonb WHERE gallery_urls IS NULL"
    ))


def downgrade() -> None:
    op.drop_column('vendors', 'gallery_urls')
