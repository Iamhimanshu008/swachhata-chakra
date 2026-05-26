from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=True)
    ward_no = Column(Integer, nullable=True, unique=True)
    panchayat_name = Column(String(200), nullable=True)
    total_citizens = Column(Integer, default=0)
    center_lat = Column(Float, nullable=True)
    center_lng = Column(Float, nullable=True)
    radius_km = Column(Float, default=10.0)
    depot_lat = Column(Float, nullable=True)
    depot_lng = Column(Float, nullable=True)
    depot_address = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
