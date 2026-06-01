"""
SmartWaste AI — FastAPI Application Entry Point
"""
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from config import settings
from database import engine, Base, SessionLocal
from models import Zone, User, Route, RouteStop, Collection, Recycler, RecyclerBid, Notification
import logging

logger = logging.getLogger("smartwaste")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: wait for DB, create tables, then seed data if empty."""

    # --- Wait for Postgres to be ready (up to 30s) ---
    max_retries = 15
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"✓ Database connected (attempt {attempt})")
            break
        except Exception as e:
            if attempt == max_retries:
                logger.error(f"✗ Could not connect to database after {max_retries} attempts: {e}")
                raise
            logger.warning(f"  Waiting for database... (attempt {attempt}/{max_retries})")
            time.sleep(2)

    # Enable PostGIS extension (required on Neon — Docker image has it pre-installed)
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis_topology;"))
            conn.commit()
        logger.info("✓ PostGIS extensions enabled")
    except Exception as e:
        logger.warning(f"⚠️ PostGIS extension note: {e}")

    # Schema is now managed by Alembic
    logger.info("Schema managed by Alembic migrations")
    logger.info("✓ Schema ready (managed by Alembic)")

    # Removed seed_data execution as per production requirements

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield  # App runs here


app = FastAPI(
    title="SmartWaste AI",
    description="Rural plastic waste management platform — Chhattisgarh, India",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartwaste-ai-omega.vercel.app",
        "https://smartwaste-ai-f0i9.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists before mounting (StaticFiles validates at mount time)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all routers
from routers.auth import router as auth_router
from routers.public import router as public_router
from routers.admin import router as admin_router
from routers.subadmin import router as subadmin_router
from routers.collector import router as collector_router
from routers.recycler import router as recycler_router
from routers.notifications import router as notifications_router
from routers.news_feed import router as news_router
from routers.app_version import router as version_router
from routers.citizen import router as citizen_router
from routers.sync import router as sync_router
from routers.points import router as points_router
from routers.qr_manager import router as qr_manager_router
from routers.panchayat import router as panchayat_router
from routers.collector_management import router as collector_management_router
from routers.iot_telemetry import router as iot_telemetry_router
from routers.ai_analytics import router as ai_analytics_router
from routers.gamification import router as gamification_router
from routers.store import router as store_router
app.include_router(auth_router)
app.include_router(public_router)
app.include_router(admin_router)
app.include_router(subadmin_router)
app.include_router(collector_router)
app.include_router(recycler_router)
app.include_router(notifications_router)
app.include_router(news_router, prefix="/api")
app.include_router(version_router, prefix="/api")
app.include_router(citizen_router)
app.include_router(sync_router)
app.include_router(points_router)
app.include_router(qr_manager_router)
app.include_router(panchayat_router)
app.include_router(collector_management_router)
app.include_router(iot_telemetry_router, prefix="/api")
app.include_router(ai_analytics_router, prefix="/api")
app.include_router(gamification_router, prefix="/api")
app.include_router(store_router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "SmartWaste AI",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
