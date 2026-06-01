from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from database import Base

class GreenWallet(Base):
    __tablename__ = "green_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    total_redeemed = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PointLedger(Base):
    __tablename__ = "point_ledgers"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("green_wallets.id"), nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=True) # If earned via waste
    transaction_type = Column(String(20)) # "credit" or "debit"
    amount = Column(Float, nullable=False)
    description = Column(String(200)) # e.g., "AI Grade: HIGH - 500g Plastic"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
