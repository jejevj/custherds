"""add checkin receipt fields to bookings

Revision ID: f7c3b9d21e04
Revises: e732b622c087
Create Date: 2026-06-27 05:16:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'f7c3b9d21e04'
down_revision = 'e732b622c087'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Tambah 4 kolom baru ke tabel bookings untuk mendukung flow:
    confirmed → pending_receipt → pending_completion → completed
    """
    op.add_column('bookings', sa.Column(
        'checkin_at',
        sa.DateTime(timezone=True),
        nullable=True,
        comment='Timestamp saat vendor checkin guide (confirmed → pending_receipt)'
    ))
    op.add_column('bookings', sa.Column(
        'receipt_url',
        sa.String(length=500),
        nullable=True,
        comment='URL file receipt/bukti kunjungan yang diupload guide'
    ))
    op.add_column('bookings', sa.Column(
        'receipt_uploaded_at',
        sa.DateTime(timezone=True),
        nullable=True,
        comment='Timestamp saat guide upload receipt (pending_receipt → pending_completion)'
    ))
    op.add_column('bookings', sa.Column(
        'completed_at',
        sa.DateTime(timezone=True),
        nullable=True,
        comment='Timestamp saat vendor mark completed (pending_completion → completed)'
    ))


def downgrade() -> None:
    op.drop_column('bookings', 'completed_at')
    op.drop_column('bookings', 'receipt_uploaded_at')
    op.drop_column('bookings', 'receipt_url')
    op.drop_column('bookings', 'checkin_at')
