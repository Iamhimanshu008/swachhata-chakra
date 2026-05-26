import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from database import Base

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_house_id = Column(String(20), ForeignKey("users.house_id"), nullable=False, index=True)
    merchant_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    points_deducted = Column(Float, nullable=False)
    inr_value = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())
