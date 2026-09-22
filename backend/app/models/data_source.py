"""models/data_source.py — Data Provenance Tracking"""

import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Text, Enum as SAEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedBase

if TYPE_CHECKING:
    from app.models.hospital import Hospital


class DataSourceType(str, enum.Enum):
    GOVERNMENT_API = "government_api"
    WEB_SCRAPE = "web_scrape"
    CSV_UPLOAD = "csv_upload"
    MANUAL_ENTRY = "manual_entry"
    SEED_SCRIPT = "seed_script"


class DataSource(TimestampedBase):
    """
    Audit trail for data provenance.
    Every hospital record links back to a DataSource.
    This enables admins to:
    1. Re-run a sync and update records from the same source
    2. Show users WHERE the data came from
    3. Flag records from a source if the source is found to be inaccurate
    """
    __tablename__ = "data_sources"

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="Human-readable source name, e.g. 'PMJAY Hospital List Punjab 2024'",
    )
    source_type: Mapped[DataSourceType] = mapped_column(
        SAEnum(DataSourceType),
        nullable=False,
    )
    url: Mapped[Optional[str]] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text)

    # ── Sync Statistics ───────────────────────────────────────────
    record_count: Mapped[int] = mapped_column(Integer, default=0)
    last_synced_at: Mapped[Optional[str]] = mapped_column(String(50))
    sync_status: Mapped[Optional[str]] = mapped_column(String(50))

    hospitals: Mapped[list["Hospital"]] = relationship(back_populates="data_source")
