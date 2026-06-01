from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, func
from database import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    check_in_time = Column(DateTime(timezone=True), server_default=func.now())
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="present") # present, absent, half_day
