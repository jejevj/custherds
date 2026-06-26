"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------ users
    op.create_table(
        'users',
        sa.Column('id',              UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_name',       sa.String(255),  nullable=False),
        sa.Column('user_email',      sa.String(255),  nullable=False),
        sa.Column('user_phone',      sa.String(30),   nullable=True),
        sa.Column('user_password',   sa.String(255),  nullable=False),
        sa.Column('user_type',       sa.SmallInteger, nullable=False),
        sa.Column('ig_link',         sa.String(255),  nullable=True),
        sa.Column('fb_link',         sa.String(255),  nullable=True),
        sa.Column('yt_link',         sa.String(255),  nullable=True),
        sa.Column('tiktok_link',     sa.String(255),  nullable=True),
        sa.Column('is_active',       sa.Boolean,      nullable=False, server_default=sa.false()),
        sa.Column('is_verified',     sa.Boolean,      nullable=False, server_default=sa.false()),
        sa.Column('tnc_accepted',    sa.Boolean,      nullable=False, server_default=sa.false()),
        sa.Column('tnc_accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_at',   sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at',      sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',      sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('user_email', name='uq_users_email'),
    )
    op.create_index('ix_users_id',    'users', ['id'])
    op.create_index('ix_users_email', 'users', ['user_email'])

    # ------------------------------------------------------------------ guides
    op.create_table(
        'guides',
        sa.Column('id',                       UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id',                  UUID(as_uuid=True), nullable=False),
        sa.Column('guide_nationality',        sa.String(100),   nullable=True),
        sa.Column('guide_certificate',        sa.String(500),   nullable=True),
        sa.Column('guide_certificate_status', sa.String(20),    nullable=False, server_default='pending'),
        sa.Column('bio',                      sa.Text,          nullable=True),
        sa.Column('languages',                sa.String(255),   nullable=True),
        sa.Column('rating',                   sa.Float,         nullable=True),
        sa.Column('total_earnings',           sa.Numeric(15,2), nullable=False, server_default='0'),
        sa.Column('pending_earnings',         sa.Numeric(15,2), nullable=False, server_default='0'),
        sa.Column('wallet_balance',           sa.Numeric(15,2), nullable=False, server_default='0'),
        sa.Column('bank_name',                sa.String(100),   nullable=True),
        sa.Column('bank_account_number',      sa.String(50),    nullable=True),
        sa.Column('bank_account_name',        sa.String(255),   nullable=True),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_guides_user_id'),
        sa.UniqueConstraint('user_id', name='uq_guides_user_id'),
    )
    op.create_index('ix_guides_id', 'guides', ['id'])

    # ------------------------------------------------------------------ vendors
    op.create_table(
        'vendors',
        sa.Column('id',                       UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id',                  UUID(as_uuid=True), nullable=False),
        sa.Column('vendor_business_name',     sa.String(255),   nullable=False),
        sa.Column('vendor_category',          sa.Integer,       nullable=False),
        sa.Column('vendor_area',              sa.Integer,       nullable=False),
        sa.Column('vendor_location',          sa.Text,          nullable=True),
        sa.Column('vendor_contact_person',    sa.String(255),   nullable=True),
        sa.Column('vendor_website',           sa.String(255),   nullable=True),
        sa.Column('vendor_short_description', sa.Text,          nullable=True),
        sa.Column('vendor_opening_hours',     sa.String(255),   nullable=True),
        sa.Column('vendor_min_spend',         sa.Numeric(15,2), nullable=True),
        sa.Column('vendor_cashback_percent',  sa.Float,         nullable=False),
        sa.Column('vendor_know_from',         sa.Text,          nullable=True),
        sa.Column('vendor_status',            sa.String(20),    nullable=False, server_default='pending'),
        sa.Column('approval_notes',           sa.Text,          nullable=True),
        sa.Column('deposit_balance',          sa.Numeric(15,2), nullable=False, server_default='0'),
        sa.Column('deposit_minimum',          sa.Numeric(15,2), nullable=True),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_vendors_user_id'),
        sa.UniqueConstraint('user_id', name='uq_vendors_user_id'),
    )
    op.create_index('ix_vendors_id', 'vendors', ['id'])

    # ------------------------------------------------------------------ vendor_deposit_topups
    op.create_table(
        'vendor_deposit_topups',
        sa.Column('id',                  UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('vendor_id',           UUID(as_uuid=True), nullable=False),
        sa.Column('amount',              sa.Numeric(15,2), nullable=False),
        sa.Column('currency',            sa.String(10),    nullable=False, server_default='IDR'),
        sa.Column('payment_method',      sa.String(50),    nullable=True),
        sa.Column('xendit_invoice_id',   sa.String(255),   nullable=True),
        sa.Column('xendit_payment_id',   sa.String(255),   nullable=True),
        sa.Column('status',              sa.String(20),    nullable=False, server_default='pending'),
        sa.Column('paid_at',             sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes',               sa.Text,          nullable=True),
        sa.Column('created_at',          sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',          sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='CASCADE', name='fk_topups_vendor_id'),
    )
    op.create_index('ix_vendor_deposit_topups_vendor_id', 'vendor_deposit_topups', ['vendor_id'])
    op.create_index('ix_vendor_deposit_topups_status',    'vendor_deposit_topups', ['status'])

    # ------------------------------------------------------------------ products
    op.create_table(
        'products',
        sa.Column('id',          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('vendor_id',   UUID(as_uuid=True), nullable=False),
        sa.Column('name',        sa.String(255),   nullable=False),
        sa.Column('description', sa.Text,          nullable=True),
        sa.Column('price',       sa.Numeric(15,2), nullable=False),
        sa.Column('currency',    sa.String(10),    nullable=False, server_default='IDR'),
        sa.Column('min_pax',     sa.Integer,       nullable=True),
        sa.Column('max_pax',     sa.Integer,       nullable=True),
        sa.Column('images',      sa.Text,          nullable=True),
        sa.Column('is_active',   sa.Boolean,       nullable=False, server_default=sa.true()),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='CASCADE', name='fk_products_vendor_id'),
    )
    op.create_index('ix_products_id',        'products', ['id'])
    op.create_index('ix_products_vendor_id', 'products', ['vendor_id'])

    # ------------------------------------------------------------------ revenue_split_configs
    op.create_table(
        'revenue_split_configs',
        sa.Column('id',               UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('vendor_percent',   sa.Float, nullable=False),
        sa.Column('guide_percent',    sa.Float, nullable=False),
        sa.Column('platform_percent', sa.Float, nullable=False),
        sa.Column('is_active',        sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column('notes',            sa.Text,  nullable=True),
        sa.Column('set_by',           UUID(as_uuid=True), nullable=False),
        sa.Column('effective_from',   sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at',       sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['set_by'], ['users.id'], ondelete='RESTRICT', name='fk_split_config_set_by'),
    )
    op.create_index('ix_revenue_split_configs_id',        'revenue_split_configs', ['id'])
    op.create_index('ix_revenue_split_configs_is_active', 'revenue_split_configs', ['is_active'])

    # ------------------------------------------------------------------ bookings
    op.create_table(
        'bookings',
        sa.Column('id',                      UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('booking_code',            sa.String(20),  nullable=False),
        sa.Column('guide_id',                UUID(as_uuid=True), nullable=False),
        sa.Column('vendor_id',               UUID(as_uuid=True), nullable=False),
        sa.Column('product_id',              UUID(as_uuid=True), nullable=True),
        sa.Column('booking_date',            sa.Date,        nullable=False),
        sa.Column('booking_time',            sa.Time,        nullable=True),
        sa.Column('pax_count',               sa.Integer,     nullable=False, server_default='1'),
        sa.Column('tourist_names',           sa.Text,        nullable=True),
        sa.Column('tourist_nationality',     sa.String(100), nullable=True),
        sa.Column('notes',                   sa.Text,        nullable=True),
        sa.Column('status',                  sa.String(30),  nullable=False, server_default='pending_vendor'),
        sa.Column('vendor_approval_at',      sa.DateTime(timezone=True), nullable=True),
        sa.Column('vendor_rejection_reason', sa.Text,        nullable=True),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['guide_id'],   ['guides.id'],   ondelete='RESTRICT', name='fk_bookings_guide_id'),
        sa.ForeignKeyConstraint(['vendor_id'],  ['vendors.id'],  ondelete='RESTRICT', name='fk_bookings_vendor_id'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='SET NULL',  name='fk_bookings_product_id'),
        sa.UniqueConstraint('booking_code', name='uq_bookings_booking_code'),
    )
    op.create_index('ix_bookings_id',           'bookings', ['id'])
    op.create_index('ix_bookings_booking_code', 'bookings', ['booking_code'])
    op.create_index('ix_bookings_guide_id',     'bookings', ['guide_id'])
    op.create_index('ix_bookings_vendor_id',    'bookings', ['vendor_id'])
    op.create_index('ix_bookings_status',       'bookings', ['status'])

    # ------------------------------------------------------------------ transactions
    op.create_table(
        'transactions',
        sa.Column('id',                        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('transaction_code',          sa.String(30),    nullable=False),
        sa.Column('booking_id',                UUID(as_uuid=True), nullable=False),
        sa.Column('vendor_id',                 UUID(as_uuid=True), nullable=False),
        sa.Column('guide_id',                  UUID(as_uuid=True), nullable=False),
        sa.Column('gross_amount',              sa.Numeric(15,2), nullable=False),
        sa.Column('currency',                  sa.String(10),    nullable=False, server_default='IDR'),
        sa.Column('receipt_image',             sa.String(500),   nullable=False),
        sa.Column('receipt_notes',             sa.Text,          nullable=True),
        sa.Column('split_config_id',           UUID(as_uuid=True), nullable=False),
        sa.Column('vendor_percent_snapshot',   sa.Float, nullable=False),
        sa.Column('guide_percent_snapshot',    sa.Float, nullable=False),
        sa.Column('platform_percent_snapshot', sa.Float, nullable=False),
        sa.Column('vendor_amount',             sa.Numeric(15,2), nullable=True),
        sa.Column('guide_commission',          sa.Numeric(15,2), nullable=True),
        sa.Column('platform_fee',              sa.Numeric(15,2), nullable=True),
        sa.Column('status',                    sa.String(30), nullable=False, server_default='pending_vendor_approval'),
        sa.Column('payment_method',            sa.String(30),    nullable=True),
        sa.Column('xendit_invoice_id',         sa.String(255),   nullable=True),
        sa.Column('xendit_payment_id',         sa.String(255),   nullable=True),
        sa.Column('paid_at',                   sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at',              sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('vendor_reviewed_at',        sa.DateTime(timezone=True), nullable=True),
        sa.Column('vendor_rejection_reason',   sa.Text,          nullable=True),
        sa.Column('settled_at',                sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['booking_id'],      ['bookings.id'],              ondelete='RESTRICT', name='fk_transactions_booking_id'),
        sa.ForeignKeyConstraint(['vendor_id'],       ['vendors.id'],               ondelete='RESTRICT', name='fk_transactions_vendor_id'),
        sa.ForeignKeyConstraint(['guide_id'],        ['guides.id'],                ondelete='RESTRICT', name='fk_transactions_guide_id'),
        sa.ForeignKeyConstraint(['split_config_id'], ['revenue_split_configs.id'], ondelete='RESTRICT', name='fk_transactions_split_config_id'),
        sa.UniqueConstraint('transaction_code', name='uq_transactions_transaction_code'),
        sa.UniqueConstraint('booking_id',       name='uq_transactions_booking_id'),
    )
    op.create_index('ix_transactions_id',               'transactions', ['id'])
    op.create_index('ix_transactions_transaction_code', 'transactions', ['transaction_code'])
    op.create_index('ix_transactions_vendor_id',        'transactions', ['vendor_id'])
    op.create_index('ix_transactions_guide_id',         'transactions', ['guide_id'])
    op.create_index('ix_transactions_status',           'transactions', ['status'])

    # ------------------------------------------------------------------ guide_withdrawals
    op.create_table(
        'guide_withdrawals',
        sa.Column('id',                     UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('guide_id',               UUID(as_uuid=True), nullable=False),
        sa.Column('amount',                 sa.Numeric(15,2), nullable=False),
        sa.Column('bank_name',              sa.String(100),   nullable=False),
        sa.Column('bank_account_number',    sa.String(50),    nullable=False),
        sa.Column('bank_account_name',      sa.String(255),   nullable=False),
        sa.Column('xendit_disbursement_id', sa.String(255),   nullable=True),
        sa.Column('status',                 sa.String(20),    nullable=False, server_default='pending'),
        sa.Column('processed_by',           UUID(as_uuid=True), nullable=True),
        sa.Column('processed_at',           sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes',                  sa.Text,          nullable=True),
        sa.Column('created_at',             sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',             sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['guide_id'],     ['guides.id'], ondelete='RESTRICT', name='fk_guide_withdrawals_guide_id'),
        sa.ForeignKeyConstraint(['processed_by'], ['users.id'],  ondelete='SET NULL',  name='fk_guide_withdrawals_processed_by'),
    )
    op.create_index('ix_guide_withdrawals_guide_id', 'guide_withdrawals', ['guide_id'])
    op.create_index('ix_guide_withdrawals_status',   'guide_withdrawals', ['status'])

    # ------------------------------------------------------------------ commission_disbursements
    op.create_table(
        'commission_disbursements',
        sa.Column('id',                     UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('guide_id',               UUID(as_uuid=True), nullable=False),
        sa.Column('period_start',           sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end',             sa.DateTime(timezone=True), nullable=False),
        sa.Column('total_amount',           sa.Numeric(15,2), nullable=False),
        sa.Column('transaction_count',      sa.Integer, nullable=False, server_default='0'),
        sa.Column('bank_name',              sa.String(100), nullable=False),
        sa.Column('bank_account_number',    sa.String(50),  nullable=False),
        sa.Column('bank_account_name',      sa.String(255), nullable=False),
        sa.Column('xendit_disbursement_id', sa.String(255), nullable=True),
        sa.Column('status',                 sa.String(20),  nullable=False, server_default='pending'),
        sa.Column('processed_by',           UUID(as_uuid=True), nullable=True),
        sa.Column('processed_at',           sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes',                  sa.Text, nullable=True),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['guide_id'],     ['guides.id'], ondelete='RESTRICT', name='fk_disbursements_guide_id'),
        sa.ForeignKeyConstraint(['processed_by'], ['users.id'],  ondelete='SET NULL',  name='fk_disbursements_processed_by'),
    )
    op.create_index('ix_commission_disbursements_guide_id', 'commission_disbursements', ['guide_id'])
    op.create_index('ix_commission_disbursements_status',   'commission_disbursements', ['status'])

    # ------------------------------------------------------------------ commission_disbursement_items
    op.create_table(
        'commission_disbursement_items',
        sa.Column('id',               UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('disbursement_id',  UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_id',   UUID(as_uuid=True), nullable=False),
        sa.Column('guide_commission', sa.Numeric(15,2), nullable=False),
        sa.Column('created_at',       sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['disbursement_id'], ['commission_disbursements.id'], ondelete='CASCADE',  name='fk_disbursement_items_disbursement_id'),
        sa.ForeignKeyConstraint(['transaction_id'],  ['transactions.id'],             ondelete='RESTRICT', name='fk_disbursement_items_transaction_id'),
    )
    op.create_index('ix_disbursement_items_disbursement_id', 'commission_disbursement_items', ['disbursement_id'])
    op.create_index('ix_disbursement_items_transaction_id',  'commission_disbursement_items', ['transaction_id'])

    # ------------------------------------------------------------------ destinations
    op.create_table(
        'destinations',
        sa.Column('id',          UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('vendor_id',   UUID(as_uuid=True), nullable=True),
        sa.Column('name',        sa.String(255), nullable=False),
        sa.Column('area_id',     sa.Integer,     nullable=False),
        sa.Column('description', sa.Text,        nullable=True),
        sa.Column('images',      sa.Text,        nullable=True),
        sa.Column('is_active',   sa.Boolean,     nullable=False, server_default=sa.true()),
        sa.Column('created_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at',  sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='SET NULL', name='fk_destinations_vendor_id'),
    )
    op.create_index('ix_destinations_id', 'destinations', ['id'])

    # ------------------------------------------------------------------ audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id',           UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('actor_id',     UUID(as_uuid=True), nullable=True),
        sa.Column('action',       sa.String(100), nullable=False),
        sa.Column('target_type',  sa.String(50),  nullable=False),
        sa.Column('target_id',    UUID(as_uuid=True), nullable=False),
        sa.Column('before_state', sa.Text, nullable=True),
        sa.Column('after_state',  sa.Text, nullable=True),
        sa.Column('ip_address',   sa.String(45), nullable=True),
        sa.Column('created_at',   sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL', name='fk_audit_logs_actor_id'),
    )
    op.create_index('ix_audit_logs_actor_id',  'audit_logs', ['actor_id'])
    op.create_index('ix_audit_logs_action',    'audit_logs', ['action'])
    op.create_index('ix_audit_logs_target_id', 'audit_logs', ['target_id'])

    # ------------------------------------------------------------------ api_logs
    op.create_table(
        'api_logs',
        sa.Column('id',            UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('method',        sa.String(10),  nullable=False),
        sa.Column('path',          sa.String(512), nullable=False),
        sa.Column('status_code',   sa.Integer,     nullable=True),
        sa.Column('duration_ms',   sa.Float,       nullable=True),
        sa.Column('ip_address',    sa.String(64),  nullable=True),
        sa.Column('user_agent',    sa.String(512), nullable=True),
        sa.Column('error_message', sa.Text,        nullable=True),
        sa.Column('error_type',    sa.String(100), nullable=True),
        sa.Column('request_body',  sa.Text,        nullable=True),
        sa.Column('created_at',    sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_api_logs_path',        'api_logs', ['path'])
    op.create_index('ix_api_logs_status_code', 'api_logs', ['status_code'])


def downgrade() -> None:
    op.drop_table('api_logs')
    op.drop_table('audit_logs')
    op.drop_table('destinations')
    op.drop_table('commission_disbursement_items')
    op.drop_table('commission_disbursements')
    op.drop_table('guide_withdrawals')
    op.drop_table('transactions')
    op.drop_table('bookings')
    op.drop_table('revenue_split_configs')
    op.drop_table('products')
    op.drop_table('vendor_deposit_topups')
    op.drop_table('vendors')
    op.drop_table('guides')
    op.drop_table('users')
