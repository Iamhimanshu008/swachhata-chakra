from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, func
from database import Base

class DailyRoute(Base):
    __tablename__ = "daily_routes"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ward_no = Column(Integer, nullable=False)
    route_date = Column(Date, nullable=False)
    total_houses = Column(Integer, default=0)
    completed_houses = Column(Integer, default=0)
    is_synced = Column(Boolean, default=False)
    synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
