# ============================================================
# CHEMICAL DIPPING ROBOT
# MACHINE API
# ============================================================

from fastapi import APIRouter

from app.schemas.machine import MachineStatus
from app.services.machine_service import MachineService


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/machine",
    tags=["Machine"],
)


# ============================================================
# STATUS
# ============================================================

@router.get(
    "/status",
    response_model=MachineStatus,
)
def get_machine_status():

    return MachineService.get_status()


# ============================================================
# CONNECT
# ============================================================

@router.post(
    "/connect",
)
def connect_machine(
    ip: str = "192.168.4.1",
    port: int = 5000,
):

    return MachineService.connect(
        ip,
        port,
    )


# ============================================================
# DEMO MODE
# ============================================================

@router.post(
    "/demo",
    response_model=MachineStatus,
)
def start_demo():

    return MachineService.start_demo()


# ============================================================
# DISCONNECT
# ============================================================

@router.post(
    "/disconnect",
    response_model=MachineStatus,
)
def disconnect_machine():

    return MachineService.disconnect()


# ============================================================
# HOME
# ============================================================

@router.post(
    "/home",
    response_model=MachineStatus,
)
def home_machine():

    return MachineService.home()


# ============================================================
# START
# ============================================================

@router.post(
    "/start",
    response_model=MachineStatus,
)
def start_machine():

    return MachineService.start()


# ============================================================
# STOP
# ============================================================

@router.post(
    "/stop",
    response_model=MachineStatus,
)
def stop_machine():

    return MachineService.stop()


# ============================================================
# CYCLE COUNT
# ============================================================

@router.post(
    "/cycles/{count}",
    response_model=MachineStatus,
)
def set_cycles(count: int):

    return MachineService.set_cycles(
        count
    )