from app.db.base_class import Base  # noqa: F401

# NOTE: Model imports for Alembic are in alembic/env.py
# Do NOT import models here — causes circular imports.
# (models import Base from here, so importing models back here creates a loop)
