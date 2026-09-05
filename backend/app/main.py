# ============================================================
# CHEMICAL DIPPING ROBOT
# FASTAPI BACKEND
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket


from app.core.config import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS,
)


from app.api.health import (
    router as health_router,
)

from app.api.machine import (
    router as machine_router,
)

from app.services.websocket_machine import (
    machine_websocket,
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title=f"{APP_NAME} API",
    description=(
        "Backend for the Chemical Dipping Robot Web HMI"
    ),
    version=APP_VERSION,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "application": APP_NAME,
        "status": "online",
        "service": "FastAPI backend",
    }


# ============================================================
# REST API ROUTERS
# ============================================================

app.include_router(
    health_router
)

app.include_router(
    machine_router
)


# ============================================================
# MACHINE WEBSOCKET
# ============================================================

@app.websocket(
    "/ws/machine"
)
async def machine_websocket_endpoint(
    websocket: WebSocket,
):

    await machine_websocket(
        websocket
    )