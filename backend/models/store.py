from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from database import Base

class RewardItem(Base):
    __tablename__ = "reward_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    point_cost = Column(Integer, nullable=False)
    stock_quantity = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("reward_items.id"), nullable=False)
    points_spent = Column(Integer, nullable=False)
    status = Column(String(20), default="pending") # pending, fulfilled, cancelled
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())
