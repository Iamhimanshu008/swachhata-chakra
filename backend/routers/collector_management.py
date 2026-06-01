from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from database import get_db
from models.user import User
from models.attendance import Attendance
from models.daily_route import DailyRoute
from models.transaction import Transaction
from services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/api/admin/collectors", tags=["Collector Management"])

@router.get("/attendance")
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "sub_admin"))
):
    """Fetch today's attendance roster for all collectors."""
    today = date.today()
    # Get all collectors
    collectors = db.query(User).filter(User.role == "collector", User.is_active == True).all()
    
    # Get today's attendance
    attendances = db.query(Attendance).filter(Attendance.date == today).all()
    attendance_map = {a.collector_id: a for a in attendances}
    
    result = []
    for c in collectors:
        att = attendance_map.get(c.id)
        result.append({
            "collector_id": c.id,
            "name": c.full_name,
            "phone": c.phone_number,
            "ward_no": c.ward_no if hasattr(c, 'ward_no') else None,
            "status": att.status if att else "absent",
            "check_in_time": att.check_in_time if att else None,
            "check_out_time": att.check_out_time if att else None,
        })
    return result

@router.get("/performance")
def get_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "sub_admin"))
):
    """Fetch a leaderboard of collectors showing total houses covered and total weight collected today."""
    today = date.today()
    
    # Aggregate houses covered from DailyRoute
    routes = db.query(
        DailyRoute.collector_id,
        func.sum(DailyRoute.completed_houses).label("total_houses_covered"),
        func.sum(DailyRoute.total_houses).label("total_target_houses")
    ).filter(DailyRoute.route_date == today).group_by(DailyRoute.collector_id).all()
    
    # Aggregate weight collected from Transactions
    # Cast func.now() to Date to get transactions from today
    transactions = db.query(
        Transaction.collector_id,
        func.sum(Transaction.weight_grams).label("total_weight_grams")
    ).filter(func.date(Transaction.collected_at) == today).group_by(Transaction.collector_id).all()
    
    route_map = {r.collector_id: r for r in routes}
    weight_map = {t.collector_id: t.total_weight_grams for t in transactions}
    
    collectors = db.query(User).filter(User.role == "collector", User.is_active == True).all()
    
    leaderboard = []
    for c in collectors:
        r = route_map.get(c.id)
        houses_covered = r.total_houses_covered if r else 0
        target_houses = r.total_target_houses if r else 0
        weight_grams = weight_map.get(c.id, 0)
        
        leaderboard.append({
            "collector_id": c.id,
            "name": c.full_name,
            "ward_no": getattr(c, 'ward_no', None),
            "houses_covered": houses_covered,
            "target_houses": target_houses,
            "weight_kg": round((weight_grams or 0) / 1000, 2)
        })
        
    # Sort by weight_kg desc, then houses_covered desc
    leaderboard.sort(key=lambda x: (x["weight_kg"], x["houses_covered"]), reverse=True)
    return leaderboard

@router.get("/sync_status")
def get_sync_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "sub_admin"))
):
    """Fetch the sync status of all active collectors. Highlight workers who haven't uploaded their afternoon batch yet."""
    today = date.today()
    
    collectors = db.query(User).filter(User.role == "collector", User.is_active == True).all()
    routes = db.query(DailyRoute).filter(DailyRoute.route_date == today).all()
    
    route_map = {r.collector_id: r for r in routes}
    
    result = []
    for c in collectors:
        route = route_map.get(c.id)
        if not route:
            # No route started today
            status = "not_started"
            last_sync = None
            pending_afternoon_batch = False
        else:
            last_sync = route.synced_at
            if route.is_synced:
                status = "synced"
                pending_afternoon_batch = False
            else:
                status = "pending_sync"
                # If it's past 2 PM and not synced, highlight them
                # Since we don't have exact "afternoon batch" logic, we just flag them as pending sync
                pending_afternoon_batch = True
                
        result.append({
            "collector_id": c.id,
            "name": c.full_name,
            "ward_no": getattr(c, 'ward_no', None),
            "status": status,
            "last_sync": last_sync,
            "pending_afternoon_batch": pending_afternoon_batch,
            "completed_houses": route.completed_houses if route else 0,
            "total_houses": route.total_houses if route else 0
        })
        
    return result
