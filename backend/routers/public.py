"""
Public router: unauthenticated endpoints for bin viewing and guest reporting.
"""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.bin import Bin
from models.report import BinReport
from schemas.bin import PublicBinRead
from services.image_analyzer import DEFAULT_ANALYSIS, analyze_bin_image
from services.report_utils import build_report_notes
from models.collector_location import CollectorLocation
from models.user import User
from models.route import Route, RouteStop

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/bins", response_model=list[PublicBinRead])
def get_public_bins(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    return bins


@router.post("/report")
def submit_public_report(
    bin_id: int = Form(...),
    image: UploadFile | None = File(None),
    photo: UploadFile | None = File(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    reporter_lat: float | None = Form(None),
    reporter_lng: float | None = Form(None),
    description: str | None = Form(None),
    db: Session = Depends(get_db),
):
    upload = image or photo
    lat = latitude if latitude is not None else reporter_lat
    lng = longitude if longitude is not None else reporter_lng

    if upload is None:
        raise HTTPException(status_code=422, detail="Image file is required")
    if lat is None or lng is None:
        raise HTTPException(status_code=422, detail="Latitude and longitude are required")

    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    from utils.geofence import is_within_radius
    if not is_within_radius(lat, lng, bin_obj.latitude, bin_obj.longitude):
        raise HTTPException(
            status_code=403,
            detail=f"You must be within 50 meters of the bin to submit a report."
        )

    upload_dir = Path(os.path.abspath(settings.UPLOAD_DIR))
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(upload.filename or "").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = upload_dir / filename

    try:
        with open(file_path, "wb") as destination:
            destination.write(upload.file.read())
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded image: {exc}") from exc

    analysis = DEFAULT_ANALYSIS.copy()
    try:
        analysis = analyze_bin_image(str(file_path), upload.content_type)
    except Exception:
        analysis = DEFAULT_ANALYSIS.copy()

    report = BinReport(
        bin_id=bin_id,
        image_url=f"/uploads/{filename}",
        fill_level=analysis["fill_level"],
        waste_type=analysis["waste_type"],
        urgency=analysis["urgency"],
        ai_confidence=analysis["confidence"],
        ai_observations=analysis["observations"],
        reporter_lat=lat,
        reporter_lng=lng,
        status="pending",
        notes=build_report_notes(
            description=description,
            reporter_name="Guest",
        ),
    )

    try:
        db.add(report)
        bin_obj.fill_level = analysis["fill_level"]
        db.commit()
        db.refresh(report)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while saving report: {exc}") from exc

    return {
        "report_id": report.id,
        "id": report.id,
        "fill_level": report.fill_level,
        "waste_type": report.waste_type,
        "urgency": report.urgency,
        "ai_confidence": report.ai_confidence,
        "ai_observations": report.ai_observations,
        "message": "Report submitted successfully! AI analysis complete.",
    }


@router.get("/report/{report_id}/status")
def get_report_status(report_id: int, db: Session = Depends(get_db)):
    report = db.query(BinReport).filter(BinReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    public_status = "pending_verification" if report.status == "pending" else report.status
    return {
        "id": report.id,
        "status": public_status,
        "ai_confidence": report.ai_confidence,
        "fill_level": report.fill_level,
        "ai_fill_level": report.fill_level,
        "created_at": report.created_at,
    }

from datetime import datetime, date

@router.get("/live-status")
def get_live_collection_status(db: Session = Depends(get_db)):
    """
    Returns live collection status based on real CollectorLocation GPS pings.
    """
    active_locations = db.query(CollectorLocation, User).join(User, CollectorLocation.collector_id == User.id).all()
    
    results = []
    today = date.today()
    
    for loc, user in active_locations:
        # Find their active route for today
        route = db.query(Route).filter(
            Route.collector_id == user.id,
            Route.date == today
        ).first()
        
        current_bin_name = "None"
        eta_minutes = 0
        distance_meters = 0
        
        if route:
            # Get next pending stop
            next_stop = db.query(RouteStop, Bin).join(Bin, RouteStop.bin_id == Bin.id).filter(
                RouteStop.route_id == route.id,
                RouteStop.status == "pending"
            ).order_by(RouteStop.sequence.asc()).first()
            
            if next_stop:
                stop_obj, bin_obj = next_stop
                current_bin_name = bin_obj.label
                
                # Simple logic: assume 20km/h speed. 
                from services.route_optimizer import haversine_distance
                dist_m = haversine_distance(loc.latitude, loc.longitude, bin_obj.latitude, bin_obj.longitude)
                distance_meters = int(dist_m)
                dist_km = dist_m / 1000.0
                eta_minutes = int(round((dist_km / 20.0) * 60))
        
        results.append({
            "collector_id": user.id,
            "name": user.full_name,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "current_bin": current_bin_name,
            "eta_minutes": eta_minutes,
            "distance_meters": distance_meters,
            "updated_at": loc.updated_at.isoformat() if loc.updated_at else None
        })
        
    return results
