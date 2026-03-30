from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func
from database import Base

class CollectorLocation(Base):
    __tablename__ = "collector_locations"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
