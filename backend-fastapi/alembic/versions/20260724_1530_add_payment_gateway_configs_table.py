"""add payment_gateway_configs table + seed DOKU Snap

Revision ID: 20260724_1530
Revises: 20260723_1503
Create Date: 2026-07-24 15:30:00

Changes:
- Create table payment_gateway_configs
- Seed 1 row: DOKU Snap (sandbox mode, is_active=true, is_production=false)
  Credentials placeholder — override via admin panel atau langsung di DB.
"""
from alembic import op
import sqlalchemy as sa
import json

revision = '20260724_1530'
down_revision = '20260723_1503'
branch_labels = None
depends_on = None

# ---------------------------------------------------------------------------
# Seed credentials DOKU Snap (sandbox)
# Ganti nilai ini via admin panel /admin/payment-gateway atau langsung di DB.
# DEV credentials — JANGAN commit production secret ke sini.
# ---------------------------------------------------------------------------
_DOKU_SANDBOX_CREDENTIALS = {
    "client_id":     "BRN-0368-1784799585862",
    "secret_key":    "SK-vXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  # placeholder — ganti via admin
    "base_url":      "https://api-sandbox.doku.com",
    "notify_url":    "/api/v1/webhooks/doku/payment",
}


def upgrade() -> None:
    # 1. Buat tabel
    op.create_table(
        'payment_gateway_configs',
        sa.Column('id',            sa.Integer(),               nullable=False),
        sa.Column('provider',      sa.String(length=50),       nullable=False),
        sa.Column('label',         sa.String(length=100),      nullable=False),
        sa.Column('is_active',     sa.Boolean(),               nullable=False),
        sa.Column('is_production', sa.Boolean(),               nullable=False),
        sa.Column('credentials',   sa.JSON(),                  nullable=False),
        sa.Column('notes',         sa.Text(),                  nullable=True),
        sa.Column('created_at',    sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at',    sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_payment_gateway_configs_id'),
        'payment_gateway_configs', ['id'], unique=False,
    )
    op.create_index(
        op.f('ix_payment_gateway_configs_provider'),
        'payment_gateway_configs', ['provider'], unique=True,
    )

    # 2. Seed row DOKU Snap sandbox
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
                    'Seed otomatis dari migration. Override credentials via admin panel.',
                    now()
                )
            ON CONFLICT (provider) DO NOTHING;
        """)
        .bindparams(creds=json.dumps(_DOKU_SANDBOX_CREDENTIALS))
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_payment_gateway_configs_provider'), table_name='payment_gateway_configs')
    op.drop_index(op.f('ix_payment_gateway_configs_id'),       table_name='payment_gateway_configs')
    op.drop_table('payment_gateway_configs')
