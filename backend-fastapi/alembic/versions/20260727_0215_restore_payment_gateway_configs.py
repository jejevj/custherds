"""restore payment_gateway_configs table + re-seed DOKU Snap

Revision ID: 20260727_0215_restore_pgc
Revises: f68907af7ab3
Create Date: 2026-07-27 02:15:00

Root cause: model PaymentGatewayConfig tidak ter-import di models/__init__.py
sehingga autogenerate migration sebelumnya (f68907af7ab3) mendeteksinya
sebagai 'removed table' dan men-drop-nya beserta datanya.
Migration ini merestore tabel + index + re-seed data DOKU Snap.
"""
from alembic import op
import sqlalchemy as sa
import json

# revision identifiers, used by Alembic.
revision = '20260727_0215_restore_pgc'
down_revision = 'f68907af7ab3'
branch_labels = None
depends_on = None

_DOKU_SANDBOX_CREDENTIALS = {
    "client_id":  "BRN-0368-1784799585862",
    "secret_key": "SK-vXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  # placeholder — override via admin panel
    "base_url":   "https://api-sandbox.doku.com",
    "notify_url": "/api/v1/webhooks/doku/payment",
}


def upgrade() -> None:
    # 1. Recreate table
    op.create_table(
        'payment_gateway_configs',
        sa.Column('id',            sa.Integer(),               nullable=False),
        sa.Column('provider',      sa.String(length=50),       nullable=False),
        sa.Column('label',         sa.String(length=100),      nullable=False),
        sa.Column('is_active',     sa.Boolean(),               nullable=False, server_default=sa.text('false')),
        sa.Column('is_production', sa.Boolean(),               nullable=False, server_default=sa.text('false')),
        sa.Column('credentials',   sa.JSON(),                  nullable=False, server_default=sa.text("'{}""'")),
        sa.Column('notes',         sa.Text(),                  nullable=True),
        sa.Column('created_at',    sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at',    sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_payment_gateway_configs_id',       'payment_gateway_configs', ['id'],       unique=False)
    op.create_index('ix_payment_gateway_configs_provider', 'payment_gateway_configs', ['provider'], unique=True)

    # 2. Re-seed DOKU Snap sandbox row
    op.execute(
        sa.text("""
            INSERT INTO payment_gateway_configs
                (provider, label, is_active, is_production, credentials, notes, created_at)
            VALUES
                (
                    'doku_snap',
                    'DOKU Snap (Sandbox)',
                    true,
                    false,
                    :creds ::jsonb,
                    'Re-seed setelah tabel di-drop oleh migration f68907af7ab3. Override credentials via admin panel.',
                    now()
                )
            ON CONFLICT (provider) DO NOTHING;
        """)
        .bindparams(creds=json.dumps(_DOKU_SANDBOX_CREDENTIALS))
    )


def downgrade() -> None:
    op.drop_index('ix_payment_gateway_configs_provider', table_name='payment_gateway_configs')
    op.drop_index('ix_payment_gateway_configs_id',       table_name='payment_gateway_configs')
    op.drop_table('payment_gateway_configs')
