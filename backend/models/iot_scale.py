from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, func
from database import Base

class IoTScale(Base):
    __tablename__ = "iot_scales"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(100), unique=True, index=True, nullable=False)
    mac_address = Column(String(50), unique=True, nullable=False)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=True)
    paired_collector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Telemetry Data
    battery_level = Column(Float, default=100.0)
    is_tampered = Column(Boolean, default=False)
    is_online = Column(Boolean, default=False)
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(String(20), default="active") # active, maintenance, retired
