"""create api_logs table

Revision ID: 0001_api_logs
Revises:
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = '0001_api_logs'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'api_logs',
        sa.Column('id',            sa.Integer(),                    nullable=False),
        sa.Column('method',        sa.String(length=10),            nullable=False),
        sa.Column('path',          sa.String(length=512),           nullable=False),
        sa.Column('status_code',   sa.Integer(),                    nullable=False),
        sa.Column('duration_ms',   sa.Float(),                      nullable=True),
        sa.Column('ip_address',    sa.String(length=64),            nullable=True),
        sa.Column('user_agent',    sa.String(length=512),           nullable=True),
        sa.Column('error_message', sa.Text(),                       nullable=True),
        sa.Column('error_type',    sa.String(length=128),           nullable=True),
        sa.Column('request_body',  sa.Text(),                       nullable=True),
        sa.Column('created_at',    sa.DateTime(timezone=True),      server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_api_logs_id',         'api_logs', ['id'],         unique=False)
    op.create_index('ix_api_logs_path',       'api_logs', ['path'],       unique=False)
    op.create_index('ix_api_logs_created_at', 'api_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_api_logs_created_at', table_name='api_logs')
    op.drop_index('ix_api_logs_path',       table_name='api_logs')
    op.drop_index('ix_api_logs_id',         table_name='api_logs')
    op.drop_table('api_logs')
