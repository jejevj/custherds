"""restore payment_gateway_configs table

Revision ID: 20260727_0215_restore_pgc
Revises: f68907af7ab3
Create Date: 2026-07-27 02:15:00

Root cause: model PaymentGatewayConfig tidak ter-import di models/__init__.py
sehingga autogenerate migration sebelumnya (f68907af7ab3) mendeteksinya
sebagai 'removed table' dan men-drop-nya. Migration ini merestore tabel beserta
index yang ikut terhapus.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260727_0215_restore_pgc'
down_revision = 'f68907af7ab3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'payment_gateway_configs',
        sa.Column('id',            sa.Integer(),     primary_key=True, autoincrement=True),
        sa.Column('provider',      sa.String(50),    nullable=False),
        sa.Column('label',         sa.String(100),   nullable=False),
        sa.Column('is_active',     sa.Boolean(),     nullable=False, server_default=sa.text('false')),
        sa.Column('is_production', sa.Boolean(),     nullable=False, server_default=sa.text('false')),
        sa.Column('credentials',   sa.JSON(),        nullable=False, server_default=sa.text("'{}'") ),
        sa.Column('notes',         sa.Text(),        nullable=True),
        sa.Column('created_at',    sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at',    sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_payment_gateway_configs_id',       'payment_gateway_configs', ['id'],       unique=False)
    op.create_index('ix_payment_gateway_configs_provider', 'payment_gateway_configs', ['provider'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_payment_gateway_configs_provider', table_name='payment_gateway_configs')
    op.drop_index('ix_payment_gateway_configs_id',       table_name='payment_gateway_configs')
    op.drop_table('payment_gateway_configs')
