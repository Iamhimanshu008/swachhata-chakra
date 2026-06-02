"""
Bin model: smart waste bins with geolocation and fill tracking.
"""
import enum

from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, Float, String, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from database import Base


class BinStatus(str, enum.Enum):
    empty = "empty"
    inactive = "inactive"
    low = "low"
    medium = "medium"
    high = "high"
    full = "full"
    overflow = "overflow"
    partial = "partial"
    critical = "critical"


class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    status = Column(Enum(BinStatus), nullable=False, default=BinStatus.empty)
    fill_level = Column(Integer, nullable=True, default=0)
    capacity_kg = Column(Float, nullable=True)
    last_collected = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    zone = relationship("Zone", backref="bins")
