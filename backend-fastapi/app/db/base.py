from app.db.base_class import Base  # noqa: F401

# Import all models here so Alembic can detect them for migrations
from app.models.user import User                                          # noqa: F401
from app.models.guide import Guide                                        # noqa: F401
from app.models.vendor import Vendor                                      # noqa: F401
from app.models.product import Product                                    # noqa: F401
from app.models.booking import Booking                                    # noqa: F401
from app.models.transaction import Transaction                            # noqa: F401
from app.models.revenue_split_config import RevenueSplitConfig            # noqa: F401
from app.models.commission_disbursement import (                          # noqa: F401
    CommissionDisbursement,
    CommissionDisbursementItem,
)
from app.models.destination import Destination                            # noqa: F401
from app.models.audit_log import AuditLog                                 # noqa: F401
from app.models.api_log import APILog                                     # noqa: F401
