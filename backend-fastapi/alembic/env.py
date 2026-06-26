from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base_class import Base          # noqa: E402
from app.core.config import settings        # noqa: E402

from app.models.user import User                                        # noqa: F401
from app.models.guide import Guide                                      # noqa: F401
from app.models.vendor import Vendor                                    # noqa: F401
from app.models.vendor_deposit_topup import VendorDepositTopup          # noqa: F401
from app.models.product import Product                                  # noqa: F401
from app.models.booking import Booking                                  # noqa: F401
from app.models.transaction import Transaction                          # noqa: F401
from app.models.revenue_split_config import RevenueSplitConfig          # noqa: F401
from app.models.commission_disbursement import (                        # noqa: F401
    CommissionDisbursement,
    CommissionDisbursementItem,
)
from app.models.guide_withdrawal import GuideWithdrawal                 # noqa: F401
from app.models.destination import Destination                          # noqa: F401
from app.models.audit_log import AuditLog                               # noqa: F401
from app.models.api_log import APILog                                   # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
