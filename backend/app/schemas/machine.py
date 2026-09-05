# ============================================================
# CHEMICAL DIPPING ROBOT
# MACHINE SCHEMAS
# ============================================================

from typing import Dict, Optional

from pydantic import BaseModel, Field


# ============================================================
# BEAKER TIMING
# ============================================================

class BeakerTiming(BaseModel):
    waiting: float = Field(
        default=2.0,
        ge=0.0,
    )

    dipping: float = Field(
        default=5.0,
        ge=0.0,
    )


# ============================================================
# MACHINE TIMING
# ============================================================

class MachineTiming(BaseModel):
    B1: BeakerTiming = Field(
        default_factory=BeakerTiming
    )

    B2: BeakerTiming = Field(
        default_factory=BeakerTiming
    )

    B3: BeakerTiming = Field(
        default_factory=BeakerTiming
    )

    B4: BeakerTiming = Field(
        default_factory=BeakerTiming
    )


# ============================================================
# MACHINE POSITION
# ============================================================

class MachinePosition(BaseModel):
    name: str
    angle: int


# ============================================================
# MACHINE STATUS
# ============================================================

class MachineStatus(BaseModel):
    connection: str

    machine_status: str

    operation: str

    position: str

    angle: int

    station: int

    total_stations: int

    current_cycle: int

    total_cycles: int

    timer_phase: Optional[str] = None

    timer_remaining: float = 0.0

    mode: str

    demo_running: bool

    positions: Dict[str, MachinePosition]

    timing: MachineTiming