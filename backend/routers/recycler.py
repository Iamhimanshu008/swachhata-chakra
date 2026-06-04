"""
Recycler router — V3
Keeps all existing V1/V2 endpoints and adds V3 endpoints:
  GET  /api/recycler/list
  POST /api/recycler/register         [admin]
  GET  /api/recycler/{id}/prices
  POST /api/recycler/sale             [admin]
  GET  /api/admin/revenue/summary     [admin]
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.user import User
from models.recycler import Recycler, RecyclerBid, BidStatus
from models.transaction import Transaction, WasteType, TransactionStatus
from services.auth_service import require_role

router = APIRouter(prefix="/api/recycler", tags=["Recycler"])

# ─────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────

def get_recycler_entity(db: Session, user: User) -> Recycler:
    """Match a User to their Recycler profile via exact email."""
    recycler = db.query(Recycler).filter(Recycler.email == user.email).first()
    if not recycler:
        raise HTTPException(
            status_code=404,
            detail="Recycler profile not found for this user account. Ensure your emails match.",
        )
    return recycler


def _recycler_dict(r: Recycler) -> Dict[str, Any]:
    return {
        "id": r.id,
        "name": r.name,
        "contact_person": r.contact_person,
        "phone": r.phone,
        "email": r.email,
        "address": r.address,
        "latitude": r.latitude,
        "longitude": r.longitude,
        "waste_types_accepted": r.waste_types_accepted or r.accepted_types or [],
        "price_per_kg": r.price_per_kg if isinstance(r.price_per_kg, dict) else {},
        "is_active": r.is_active,
        "panchayat_id": r.panchayat_id,
        "zone_id": r.zone_id,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


# ─────────────────────────────────────────────────────────────
# EXISTING V1 ENDPOINTS — kept unchanged
# ─────────────────────────────────────────────────────────────

@router.get("/dashboard")
def get_recycler_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> Dict[str, Any]:
    recycler = get_recycler_entity(db, current_user)

    try:
        completed_bids = db.query(RecyclerBid).filter(
            RecyclerBid.recycler_id == recycler.id,
            RecyclerBid.status == BidStatus.completed,
        ).all()
    except Exception:
        db.rollback()
        completed_bids = []

    total_bought_kg = sum(bid.quantity_kg for bid in completed_bids)
    total_paid = sum(bid.quantity_kg * bid.offered_price_per_kg for bid in completed_bids)

    try:
        active_bids_count = db.query(RecyclerBid).filter(
            RecyclerBid.recycler_id == recycler.id,
            RecyclerBid.status.in_([BidStatus.pending, BidStatus.accepted]),
        ).count()
    except Exception:
        db.rollback()
        active_bids_count = 0

    return {
        "recycler_name": recycler.name,
        "total_plastic_bought_kg": round(total_bought_kg, 2),
        "total_amount_paid": round(total_paid, 2),
        "active_bids_count": active_bids_count,
    }


@router.get("/bids")
def get_recycler_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> List[Dict[str, Any]]:
    recycler = get_recycler_entity(db, current_user)

    try:
        bids = db.query(RecyclerBid).filter(
            RecyclerBid.recycler_id == recycler.id
        ).order_by(RecyclerBid.created_at.desc()).all()
    except Exception:
        db.rollback()
        bids = []

    return [
        {
            "id": b.id,
            "report_id": b.report_id,
            "collection_id": b.collection_id,
            "offered_price_per_kg": b.offered_price_per_kg,
            "quantity_kg": b.quantity_kg,
            "status": b.status.value,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "total_value": round(b.quantity_kg * b.offered_price_per_kg, 2),
        }
        for b in bids
    ]


@router.post("/bids/{bid_id}/accept")
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
):
    recycler = get_recycler_entity(db, current_user)

    try:
        bid = db.query(RecyclerBid).filter(
            RecyclerBid.id == bid_id,
            RecyclerBid.recycler_id == recycler.id,
        ).first()
    except Exception:
        db.rollback()
        bid = None

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.status != BidStatus.pending:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept bid currently in {bid.status.value} state",
        )

    bid.status = BidStatus.accepted  # type: ignore[assignment]
    db.commit()
    return {"success": True, "message": "Bid accepted successfully.", "status": bid.status.value}


@router.post("/bids/{bid_id}/complete")
def complete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
):
    recycler = get_recycler_entity(db, current_user)

    try:
        bid = db.query(RecyclerBid).filter(
            RecyclerBid.id == bid_id,
            RecyclerBid.recycler_id == recycler.id,
        ).first()
    except Exception:
        db.rollback()
        bid = None

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.status != BidStatus.accepted:
        raise HTTPException(status_code=400, detail="Only accepted bids can be completed.")

    bid.status = BidStatus.completed  # type: ignore[assignment]
    db.commit()
    return {"success": True, "message": "Transaction completed.", "status": bid.status.value}


# ─────────────────────────────────────────────────────────────
# NEW V3 ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get("/list")
def list_recyclers(
    db: Session = Depends(get_db),
    # Public endpoint — no auth required, collectors use this from mobile app
):
    """Return all active recyclers. No auth required."""
    try:
        recyclers = db.query(Recycler).filter(Recycler.is_active.is_(True)).all()
    except Exception:
        db.rollback()
        recyclers = []
    return [_recycler_dict(r) for r in recyclers]


class RecyclerRegisterRequest(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    waste_types_accepted: Optional[List[str]] = None
    price_per_kg: Optional[Dict[str, float]] = None
    panchayat_id: Optional[int] = None
    zone_id: Optional[int] = None


@router.post("/register", status_code=201)
def register_recycler(
    data: RecyclerRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Create a new recycler. Admin only."""
    try:
        recycler = Recycler(
            name=data.name,
            contact_person=data.contact_person,
            phone=data.phone,
            email=data.email,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
            waste_types_accepted=data.waste_types_accepted or [],
            # Keep legacy accepted_types in sync
            accepted_types=data.waste_types_accepted or [],
            price_per_kg=data.price_per_kg or {},
            panchayat_id=data.panchayat_id,
            zone_id=data.zone_id,
            is_active=True,
        )
        db.add(recycler)
        db.commit()
        db.refresh(recycler)
        return {"id": recycler.id, "message": "Recycler registered successfully", **_recycler_dict(recycler)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to register recycler: {e}")


@router.get("/{recycler_id}/prices")
def get_recycler_prices(
    recycler_id: int,
    db: Session = Depends(get_db),
):
    """Return per-waste-type prices for a recycler. No auth — used by mobile app."""
    try:
        recycler = db.query(Recycler).filter(
            Recycler.id == recycler_id,
            Recycler.is_active.is_(True),
        ).first()
    except Exception:
        db.rollback()
        recycler = None

    if not recycler:
        raise HTTPException(status_code=404, detail="Recycler not found")

    price_map = recycler.price_per_kg if isinstance(recycler.price_per_kg, dict) else {}
    # Fill in defaults for all 4 streams
    for stream in ("plastic", "organic", "paper", "other"):
        price_map.setdefault(stream, 0.0)

    return {
        "recycler_id": recycler_id,
        "recycler_name": recycler.name,
        "prices": price_map,
        "accepted_types": recycler.waste_types_accepted or recycler.accepted_types or [],
    }


class SaleRequest(BaseModel):
    recycler_id: int
    waste_type: WasteType
    weight_kg: float
    price_per_kg: float
    notes: Optional[str] = None


@router.post("/sale")
def record_sale(
    data: SaleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Record a waste sale from panchayat to recycler. Admin only."""
    try:
        recycler = db.query(Recycler).filter(Recycler.id == data.recycler_id).first()
    except Exception:
        db.rollback()
        recycler = None

    if not recycler:
        raise HTTPException(status_code=404, detail="Recycler not found")

    weight_grams = int(data.weight_kg * 1000)
    total_price = round(data.weight_kg * data.price_per_kg, 2)

    try:
        import uuid
        txn = Transaction(
            id=str(uuid.uuid4()),
            weight_grams=weight_grams,
            waste_type=data.waste_type,
            is_sale=True,
            sale_price_inr=total_price,
            recycler_id=data.recycler_id,
            points_awarded=0.0,
            status=TransactionStatus.synced,
            notes=data.notes,
            collected_at=datetime.now(timezone.utc),
            synced_at=datetime.now(timezone.utc),
        )
        db.add(txn)
        db.commit()
        db.refresh(txn)
        return {
            "transaction_id": txn.id,
            "recycler_name": recycler.name,
            "waste_type": data.waste_type.value,
            "weight_kg": data.weight_kg,
            "price_per_kg": data.price_per_kg,
            "total_price_inr": total_price,
            "message": "Sale recorded successfully",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record sale: {e}")


# Revenue summary lives under /api/admin prefix so we need a separate router
# We attach it here but with an absolute path override
revenue_router = APIRouter(prefix="/api/admin", tags=["Revenue"])


@revenue_router.get("/revenue/summary")
def get_revenue_summary(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Revenue summary from recycler sales. Admin only."""
    try:
        now = datetime.now(timezone.utc)
        since_current = now - timedelta(days=days)
        since_last = since_current - timedelta(days=days)

        # Current period
        current_rows = (
            db.query(
                Transaction.waste_type,
                func.count(Transaction.id).label("count"),
                func.sum(Transaction.sale_price_inr).label("revenue"),
                func.sum(Transaction.weight_grams).label("total_grams"),
            )
            .filter(
                Transaction.is_sale.is_(True),
                Transaction.created_at >= since_current,
            )
            .group_by(Transaction.waste_type)
            .all()
        )

        # Last period (for comparison)
        last_total = (
            db.query(func.sum(Transaction.sale_price_inr))
            .filter(
                Transaction.is_sale.is_(True),
                Transaction.created_at >= since_last,
                Transaction.created_at < since_current,
            )
            .scalar()
            or 0.0
        )

        breakdown: Dict[str, Any] = {}
        total_revenue = 0.0
        total_kg = 0.0

        for row in current_rows:
            key = str(row.waste_type.value if hasattr(row.waste_type, "value") else row.waste_type or "other")
            rev = float(row.revenue or 0.0)
            grams = int(row.total_grams or 0)
            breakdown[key] = {
                "transactions": int(row.count),
                "revenue_inr": round(rev, 2),
                "weight_kg": round(grams / 1000, 2),
            }
            total_revenue += rev
            total_kg += grams / 1000

        for stream in ("plastic", "organic", "paper", "other"):
            breakdown.setdefault(stream, {"transactions": 0, "revenue_inr": 0.0, "weight_kg": 0.0})

        mom_change = round(
            ((total_revenue - last_total) / last_total * 100) if last_total > 0 else 0.0, 1
        )

        return {
            "period_days": days,
            "total_revenue_inr": round(total_revenue, 2),
            "total_weight_kg": round(total_kg, 2),
            "mom_change_pct": mom_change,
            "previous_period_revenue_inr": round(float(last_total), 2),
            "breakdown_by_waste_type": breakdown,
        }

    except Exception:
        db.rollback()
        return {
            "period_days": days,
            "total_revenue_inr": 0.0,
            "total_weight_kg": 0.0,
            "mom_change_pct": 0.0,
            "previous_period_revenue_inr": 0.0,
            "breakdown_by_waste_type": {
                s: {"transactions": 0, "revenue_inr": 0.0, "weight_kg": 0.0}
                for s in ("plastic", "organic", "paper", "other")
            },
        }
