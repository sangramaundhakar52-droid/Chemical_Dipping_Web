# ============================================================
# CHEMICAL DIPPING ROBOT
# HEALTH API
# ============================================================

from fastapi import APIRouter


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/health",
    tags=["Health"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("")
def health():
    return {
        "status": "ok",
        "service": "chemical-dipping-robot-backend",
    }