import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean, ForeignKey, DateTime, func, Float
from sqlalchemy.orm import relationship
from database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    sub_admin = "sub_admin"
    shg = "shg"
    collector = "collector"
    recycler = "recycler"
    citizen = "citizen"
    merchant = "merchant"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    phone_number = Column(String, nullable=True, unique=True, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.shg)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    expo_push_token = Column(String(255), nullable=True)
    house_id = Column(String(20), nullable=True, unique=True, index=True)
    ward_no = Column(Integer, nullable=True)
    wallet_balance_points = Column(Float, default=0.0)
    qr_hash = Column(String(255), nullable=True, unique=True)
    is_citizen = Column(Boolean, default=False)
    qr_status = Column(String(20), default="active")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    socio_category = Column(String(20), default="APL")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    zone = relationship("Zone", backref="users")
