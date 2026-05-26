from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.user import User, UserRole
from models.redemption import Redemption
from services.auth_service import require_role

router = APIRouter(prefix="/api/points", tags=["Points"])

POINT_TO_INR = 0.10  # 1 point = ₹0.10, 10 points = ₹1

class RedeemRequest(BaseModel):
    citizen_house_id: str
    points_to_redeem: float
    description: str

# POST /api/points/redeem — merchant redeems points for citizen
@router.post("/redeem")
def redeem_points(
    request: RedeemRequest,
    current_user: User = Depends(require_role("merchant")),
    db: Session = Depends(get_db)
):
    citizen = db.query(User).filter(
        User.house_id == request.citizen_house_id
    ).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    if citizen.wallet_balance_points < request.points_to_redeem:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Balance: {citizen.wallet_balance_points}"
        )
    
    inr_value = round(request.points_to_redeem * POINT_TO_INR, 2)
    
    # Deduct points
    citizen.wallet_balance_points -= request.points_to_redeem
    
    # Record redemption
    redemption = Redemption(
        citizen_house_id=request.citizen_house_id,
        merchant_id=current_user.id,
        points_deducted=request.points_to_redeem,
        inr_value=inr_value,
        description=request.description
    )
    db.add(redemption)
    db.commit()
    
    return {
        "success": True,
        "points_deducted": request.points_to_redeem,
        "inr_value": inr_value,
        "new_balance": citizen.wallet_balance_points
    }

# GET /api/points/leaderboard?ward_no=4
@router.get("/leaderboard")
def get_leaderboard(
    ward_no: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(
        User.role == UserRole.citizen,
        User.is_active == True
    )
    if ward_no:
        query = query.filter(User.ward_no == ward_no)
    
    citizens = query.order_by(
        User.wallet_balance_points.desc()
    ).limit(20).all()
    
    return {
        "ward_no": ward_no,
        "leaderboard": [
            {
                "rank": i+1,
                "name": c.full_name,
                "house_id": c.house_id,
                "points": c.wallet_balance_points
            } for i, c in enumerate(citizens)
        ]
    }

# GET /api/points/ward_summary?ward_no=4 — admin analytics
@router.get("/ward_summary")
def get_ward_summary(
    ward_no: int,
    current_user: User = Depends(require_role("admin", "sub_admin")),
    db: Session = Depends(get_db)
):
    from models.transaction import Transaction
    from sqlalchemy import func as sqlfunc
    
    stats = db.query(
        sqlfunc.count(Transaction.id).label("total_transactions"),
        sqlfunc.sum(Transaction.weight_grams).label("total_grams"),
        sqlfunc.sum(Transaction.points_awarded).label("total_points")
    ).filter(Transaction.ward_no == ward_no).first()
    
    total_kg = round((stats.total_grams or 0) / 1000, 2)
    revenue_inr = round(total_kg * 30, 2)
    citizen_fund = round(revenue_inr * 0.3333, 2)
    ops_fund = round(revenue_inr * 0.3333, 2)
    panchayat_profit = round(revenue_inr * 0.3334, 2)
    
    return {
        "ward_no": ward_no,
        "total_transactions": stats.total_transactions or 0,
        "total_weight_grams": stats.total_grams or 0,
        "total_weight_kg": total_kg,
        "total_points_issued": stats.total_points or 0,
        "financials": {
            "total_revenue_inr": revenue_inr,
            "citizen_incentive_fund": citizen_fund,
            "operations_fund": ops_fund,
            "panchayat_profit": panchayat_profit
        }
    }
