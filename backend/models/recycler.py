from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from database import Base


class BidStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"


class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)

    # V3: panchayat linkage (nullable so existing zone-only rows don't break)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=True)

    name = Column(String, nullable=False)

    # V1 had nullable=False — relaxed to nullable=True for V3 flexibility
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # V1 geo fields — kept as-is, not removed
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # V1 legacy fields — kept so old admin endpoints don't break
    accepted_types = Column(JSON, nullable=True, default=list)
    min_quantity_kg = Column(Float, nullable=True, default=0.0)

    # V3: per-waste-type price map  {"plastic": 12.5, "paper": 8.0}
    waste_types_accepted = Column(JSON, nullable=True, default=list)
    price_per_kg = Column(JSON, nullable=True, default=dict)

    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone")
    bids = relationship("RecyclerBid", back_populates="recycler")


class RecyclerBid(Base):
    __tablename__ = "recycler_bids"

    id = Column(Integer, primary_key=True, index=True)
    recycler_id = Column(Integer, ForeignKey("recyclers.id"), nullable=False, index=True)
    # References either a generic report or a collection event
    report_id = Column(Integer, nullable=True)
    collection_id = Column(Integer, nullable=True)

    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    status = Column(Enum(BidStatus), default=BidStatus.pending, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    recycler = relationship("Recycler", back_populates="bids")
