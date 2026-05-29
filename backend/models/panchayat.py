from sqlalchemy import Column, Integer, String, Boolean, Float, JSON, ForeignKey, func, DateTime
from database import Base

class Panchayat(Base):
    __tablename__ = "panchayats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    sarpanch_name = Column(String(100), nullable=True)
    sarpanch_phone = Column(String(20), nullable=True)
    is_approved = Column(Boolean, default=False)
    
    # Vitals
    population = Column(Integer, default=0)
    total_houses = Column(Integer, default=0)
    target_houses = Column(Integer, default=0)
    
    # Border Mapping (GeoJSON representation)
    border_mapping = Column(JSON, nullable=True)
    
    # Settings
    language_pref = Column(String(20), default="hi") # 'en', 'hi', 'cg' (Chhattisgarhi)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
