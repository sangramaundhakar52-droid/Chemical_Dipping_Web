from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.machine import router as machine_router


# ============================================================
# CHEMICAL DIPPING ROBOT
# FASTAPI BACKEND
# ============================================================

app = FastAPI(
    title="Chemical Dipping Robot API",
    description="Backend for the Chemical Dipping Robot Web HMI",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(machine_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "application": "Chemical Dipping Robot",
        "status": "online",
        "service": "FastAPI backend",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "chemical-dipping-robot-backend",
    }