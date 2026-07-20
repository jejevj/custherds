"""add settlement_bank_accounts table

Revision ID: 0012_add_settlement_bank_accounts
Revises: 7d9f4e2c1b83
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '0012_add_settlement_bank_accounts'
down_revision = '7d9f4e2c1b83'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'settlement_bank_accounts',
        sa.Column('id',                    postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('guide_id',              postgresql.UUID(as_uuid=True), sa.ForeignKey('guides.id',   ondelete='CASCADE'), nullable=True),
        sa.Column('vendor_id',             postgresql.UUID(as_uuid=True), sa.ForeignKey('vendors.id',  ondelete='CASCADE'), nullable=True),
        sa.Column('bank_code',             sa.String(20),   nullable=False),
        sa.Column('account_number',        sa.String(50),   nullable=False),
        sa.Column('account_name',          sa.String(255),  nullable=False),
        sa.Column('account_email',         sa.String(255),  nullable=True),
        sa.Column('doku_sba_id',           sa.String(255),  nullable=True,  unique=True),
        sa.Column('doku_reference_no',     sa.String(255),  nullable=True),
        sa.Column('doku_status',           sa.String(50),   nullable=True),
        sa.Column('doku_rejection_reason', sa.Text,         nullable=True),
        sa.Column('doku_raw_response',     sa.Text,         nullable=True),
        sa.Column('status',                sa.String(30),   nullable=False,  server_default='pending'),
        sa.Column('is_primary',            sa.Boolean,      nullable=False,  server_default=sa.text('false')),
        sa.Column('registered_at',         sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_at',           sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at',            sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at',            sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )

    # Index untuk query cepat
    op.create_index('ix_sba_guide_id',    'settlement_bank_accounts', ['guide_id'])
    op.create_index('ix_sba_vendor_id',   'settlement_bank_accounts', ['vendor_id'])
    op.create_index('ix_sba_status',      'settlement_bank_accounts', ['status'])
    op.create_index('ix_sba_doku_sba_id', 'settlement_bank_accounts', ['doku_sba_id'])


def downgrade() -> None:
    op.drop_index('ix_sba_doku_sba_id', table_name='settlement_bank_accounts')
    op.drop_index('ix_sba_status',      table_name='settlement_bank_accounts')
    op.drop_index('ix_sba_vendor_id',   table_name='settlement_bank_accounts')
    op.drop_index('ix_sba_guide_id',    table_name='settlement_bank_accounts')
    op.drop_table('settlement_bank_accounts')
