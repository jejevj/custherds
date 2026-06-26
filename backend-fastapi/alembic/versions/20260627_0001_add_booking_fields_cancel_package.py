"""add booking fields: booking_type, package, cancelled_by/reason/at

Revision ID: 20260627_0001
Revises: e732b622c087
Create Date: 2026-06-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '20260627_0001'
down_revision = 'e732b622c087'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # booking_type column (direct | package), default 'direct'
    op.add_column('bookings', sa.Column('booking_type', sa.String(10), nullable=False, server_default='direct'))

    # package reference columns
    op.add_column('bookings', sa.Column('package_id', UUID(as_uuid=True), nullable=True))
    op.add_column('bookings', sa.Column('package_price_snapshot', sa.Numeric(15, 2), nullable=True))
    op.add_column('bookings', sa.Column('subtotal_package', sa.Numeric(15, 2), nullable=True))

    # cancellation columns
    op.add_column('bookings', sa.Column('cancelled_by', sa.String(10), nullable=True))   # 'guide' | 'vendor' | 'admin'
    op.add_column('bookings', sa.Column('cancelled_reason', sa.Text, nullable=True))
    op.add_column('bookings', sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True))

    # FK for package_id (packages table was added in 33ca01a9f9fd)
    op.create_foreign_key(
        'fk_bookings_package_id',
        'bookings', 'packages',
        ['package_id'], ['id'],
        ondelete='SET NULL',
    )
    op.create_index('ix_bookings_package_id', 'bookings', ['package_id'])


def downgrade() -> None:
    op.drop_constraint('fk_bookings_package_id', 'bookings', type_='foreignkey')
    op.drop_index('ix_bookings_package_id', table_name='bookings')
    op.drop_column('bookings', 'cancelled_at')
    op.drop_column('bookings', 'cancelled_reason')
    op.drop_column('bookings', 'cancelled_by')
    op.drop_column('bookings', 'subtotal_package')
    op.drop_column('bookings', 'package_price_snapshot')
    op.drop_column('bookings', 'package_id')
    op.drop_column('bookings', 'booking_type')
