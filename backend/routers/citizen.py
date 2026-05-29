from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from models.transaction import Transaction
from models.redemption import Redemption
from services.auth_service import require_role
import hashlib, secrets

router = APIRouter(prefix="/api/citizen", tags=["Citizen"])

# GET /api/citizen/profile — get citizen profile + wallet balance
@router.get("/profile")
def get_citizen_profile(
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db)
):
    return {
        "house_id": current_user.house_id,
        "name": current_user.full_name,
        "ward_no": current_user.ward_no,
        "wallet_balance_points": current_user.wallet_balance_points,
        "qr_hash": current_user.qr_hash,
        "phone": current_user.phone_number
    }

# GET /api/citizen/wallet — get wallet balance + transaction history
@router.get("/wallet")
def get_wallet(
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.house_id == current_user.house_id
    ).order_by(Transaction.collected_at.desc()).limit(50).all()
    
    redemptions = db.query(Redemption).filter(
        Redemption.citizen_house_id == current_user.house_id
    ).order_by(Redemption.redeemed_at.desc()).limit(20).all()
    
    return {
        "balance": current_user.wallet_balance_points,
        "transactions": [
            {
                "id": t.id,
                "weight_grams": t.weight_grams,
                "points_awarded": t.points_awarded,
                "collected_at": t.collected_at,
                "status": t.status
            } for t in transactions
        ],
        "redemptions": [
            {
                "id": r.id,
                "points_deducted": r.points_deducted,
                "inr_value": r.inr_value,
                "description": r.description,
                "redeemed_at": r.redeemed_at
            } for r in redemptions
        ]
    }

# POST /api/citizen/register — register citizen, generate house_id + qr_hash
@router.post("/register")
def register_citizen(
    name: str,
    phone_number: str,
    ward_no: int,
    lat: float = None,
    lng: float = None,
    socio_category: str = "APL",
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.phone_number == phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Generate unique house_id: CG-W{ward_no:02d}-{Random/Seq}
    import random
    house_id = f"CG-W{ward_no:02d}-{random.randint(1000,9999)}"
    while db.query(User).filter(User.house_id == house_id).first():
        house_id = f"CG-W{ward_no:02d}-{random.randint(1000,9999)}"
    
    # Generate QR hash
    qr_hash = hashlib.sha256(f"{house_id}{secrets.token_hex(8)}".encode()).hexdigest()[:32]
    
    citizen = User(
        full_name=name,
        phone_number=phone_number,
        email=f"{phone_number}@smartwaste.citizen",
        hashed_password="",
        role=UserRole.citizen,
        house_id=house_id,
        ward_no=ward_no,
        wallet_balance_points=0.0,
        qr_hash=qr_hash,
        is_citizen=True,
        lat=lat,
        lng=lng,
        socio_category=socio_category
    )
    db.add(citizen)
    db.commit()
    db.refresh(citizen)
    
    return {
        "house_id": house_id,
        "qr_hash": qr_hash,
        "name": name,
        "ward_no": ward_no,
        "message": "Citizen registered successfully"
    }
