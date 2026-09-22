"""
models/__init__.py — Export all models for Alembic detection.

Alembic's autogenerate MUST import all models here so it can
detect schema changes and generate migration scripts.
If you add a new model, add it to this file.
"""

from app.models.base import TimestampedBase
from app.models.user import User, UserRole
from app.models.hospital import Hospital, HospitalType, DataSourceLabel
from app.models.procedure import Procedure, ProcedureCategory
from app.models.hospital_procedure import HospitalProcedure
from app.models.facility import Facility, FacilityCategory
from app.models.department import Department
from app.models.review import Review, ReviewStatus
from app.models.sos_alert import SOSAlert, SOSStatus
from app.models.data_source import DataSource, DataSourceType

__all__ = [
    "TimestampedBase",
    "User", "UserRole",
    "Hospital", "HospitalType", "DataSourceLabel",
    "Procedure", "ProcedureCategory",
    "HospitalProcedure",
    "Facility", "FacilityCategory",
    "Department",
    "Review", "ReviewStatus",
    "SOSAlert", "SOSStatus",
    "DataSource", "DataSourceType",
]
