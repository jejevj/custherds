"""add incomplete status and document fields to guides and vendors

Revision ID: 0002
Revises: b098ab915d45
Create Date: 2026-06-26
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = 'b098ab915d45'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── guides table ────────────────────────────────────────────────────────
    op.add_column('guides', sa.Column(
        'guide_status', sa.String(20), nullable=False, server_default='incomplete'
    ))
    op.add_column('guides', sa.Column(
        'rejection_notes', sa.Text(), nullable=True
    ))
    op.add_column('guides', sa.Column(
        'guide_phone', sa.String(30), nullable=True
    ))
    op.add_column('guides', sa.Column(
        'guide_id_card_url', sa.String(500), nullable=True
    ))

    # Migrate existing data: set guide_status based on guide_certificate_status
    op.execute("""
        UPDATE guides
        SET guide_status = CASE
            WHEN guide_certificate_status = 'approved' THEN 'approved'
            WHEN guide_certificate_status = 'rejected' THEN 'rejected'
            WHEN guide_certificate_status = 'pending'  THEN 'pending'
            ELSE 'incomplete'
        END
    """)

    # ── vendors table ────────────────────────────────────────────────────────
    op.add_column('vendors', sa.Column(
        'vendor_npwp', sa.String(30), nullable=True
    ))
    op.add_column('vendors', sa.Column(
        'vendor_nib', sa.String(30), nullable=True
    ))
    op.add_column('vendors', sa.Column(
        'vendor_owner_id_card_url', sa.String(500), nullable=True
    ))
    op.alter_column('vendors', 'vendor_status',
        existing_type=sa.String(20),
        server_default='incomplete',
        nullable=False
    )


def downgrade() -> None:
    # guides
    op.drop_column('guides', 'guide_id_card_url')
    op.drop_column('guides', 'guide_phone')
    op.drop_column('guides', 'rejection_notes')
    op.drop_column('guides', 'guide_status')
    # vendors
    op.drop_column('vendors', 'vendor_owner_id_card_url')
    op.drop_column('vendors', 'vendor_nib')
    op.drop_column('vendors', 'vendor_npwp')
    op.alter_column('vendors', 'vendor_status',
        existing_type=sa.String(20),
        server_default='pending',
        nullable=False
    )
