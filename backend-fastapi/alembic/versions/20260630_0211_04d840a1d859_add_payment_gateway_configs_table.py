"""add_payment_gateway_configs_table

Revision ID: 04d840a1d859
Revises: f9a1b2c3d4e5
Create Date: 2026-06-30 02:11:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '04d840a1d859'
down_revision = 'f9a1b2c3d4e5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'payment_gateway_configs',
        sa.Column('id',            sa.Integer(),              nullable=False),
        sa.Column('provider',      sa.String(length=50),      nullable=False),
        sa.Column('label',         sa.String(length=100),     nullable=False),
        sa.Column('is_active',     sa.Boolean(),              nullable=False),
        sa.Column('is_production', sa.Boolean(),              nullable=False),
        sa.Column('credentials',   sa.JSON(),                 nullable=False),
        sa.Column('notes',         sa.Text(),                 nullable=True),
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


def downgrade() -> None:
    op.drop_index(op.f('ix_payment_gateway_configs_provider'), table_name='payment_gateway_configs')
    op.drop_index(op.f('ix_payment_gateway_configs_id'),       table_name='payment_gateway_configs')
    op.drop_table('payment_gateway_configs')
