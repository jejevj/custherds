from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic can detect them
from app.models.user import User          # noqa: F401, E402
from app.models.vendor import Vendor      # noqa: F401, E402
from app.models.guide import Guide        # noqa: F401, E402
from app.models.tourist import Tourist    # noqa: F401, E402
from app.models.destination import Destination  # noqa: F401, E402
from app.models.product import Product    # noqa: F401, E402
from app.models.order import Order        # noqa: F401, E402
from app.models.review import Review      # noqa: F401, E402
