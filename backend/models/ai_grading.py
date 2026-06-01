from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, JSON
from database import Base

class AIGradingLog(Base):
    __tablename__ = "ai_grading_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String(500), nullable=True) # S3/Cloud Storage link
    
    # AI Results
    grade = Column(String(20), nullable=False) # HIGH, MEDIUM, LOW
    confidence_score = Column(Float, default=0.0)
    contamination_rate = Column(Float, default=0.0) # % of non-recyclable mixed in
    plastic_types = Column(JSON, nullable=True) # e.g. ["PET", "HDPE"]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
