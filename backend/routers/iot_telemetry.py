from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from database import get_db
from models.iot_scale import IoTScale
from models.user import User

router = APIRouter(
    prefix="/iot",
    tags=["IoT Telemetry"]
)

# Pydantic models for request/response
class IoTScaleCreate(BaseModel):
    serial_number: str
    mac_address: str
    panchayat_id: Optional[int] = None

class IoTScalePair(BaseModel):
    collector_id: int

class IoTHeartbeat(BaseModel):
    mac_address: str
    battery_level: float
    is_tampered: bool

class IoTScaleResponse(BaseModel):
    id: int
    serial_number: str
    mac_address: str
    panchayat_id: Optional[int]
    paired_collector_id: Optional[int]
    battery_level: float
    is_tampered: bool
    is_online: bool
    last_heartbeat: Optional[datetime]
    status: str

    class Config:
        orm_mode = True

@router.post("/admin/iot/register", response_model=IoTScaleResponse)
def register_scale(scale_data: IoTScaleCreate, db: Session = Depends(get_db)):
    """Register a new IoT scale"""
    # Check if serial number or mac address already exists
    existing_scale = db.query(IoTScale).filter(
        (IoTScale.serial_number == scale_data.serial_number) | 
        (IoTScale.mac_address == scale_data.mac_address)
    ).first()
    
    if existing_scale:
        raise HTTPException(status_code=400, detail="Scale with this serial number or MAC address already exists")
        
    new_scale = IoTScale(
        serial_number=scale_data.serial_number,
        mac_address=scale_data.mac_address,
        panchayat_id=scale_data.panchayat_id
    )
    db.add(new_scale)
    db.commit()
    db.refresh(new_scale)
    return new_scale

@router.post("/admin/iot/{scale_id}/pair", response_model=IoTScaleResponse)
def pair_scale(scale_id: int, pair_data: IoTScalePair, db: Session = Depends(get_db)):
    """Pair scale with a specific collector"""
    scale = db.query(IoTScale).filter(IoTScale.id == scale_id).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Scale not found")
        
    collector = db.query(User).filter(User.id == pair_data.collector_id, User.role == "collector").first()
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
        
    scale.paired_collector_id = pair_data.collector_id
    db.commit()
    db.refresh(scale)
    return scale

@router.get("/admin/iot/status", response_model=List[IoTScaleResponse])
def get_scales_status(db: Session = Depends(get_db)):
    """Get a list of all IoT scales, their battery life, and tamper status"""
    scales = db.query(IoTScale).all()
    # Optional: Update is_online based on last_heartbeat here
    return scales

@router.post("/iot/heartbeat")
def heartbeat(data: IoTHeartbeat, db: Session = Depends(get_db)):
    """Public/device endpoint for ESP32 heartbeat"""
    scale = db.query(IoTScale).filter(IoTScale.mac_address == data.mac_address).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Scale not found")
        
    scale.battery_level = data.battery_level
    scale.is_tampered = data.is_tampered
    scale.is_online = True
    scale.last_heartbeat = func.now()
    
    db.commit()
    return {"status": "success", "message": "Heartbeat received"}
