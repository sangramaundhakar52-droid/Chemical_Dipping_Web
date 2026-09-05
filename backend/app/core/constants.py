# ============================================================
# CHEMICAL DIPPING ROBOT
# MACHINE CONSTANTS
# ============================================================

# ------------------------------------------------------------
# ESP32 CONNECTION
# ------------------------------------------------------------

ESP32_DEFAULT_IP = "192.168.4.1"
ESP32_DEFAULT_PORT = 5000

TCP_CONNECTION_TIMEOUT = 5.0


# ------------------------------------------------------------
# MACHINE POSITIONS
# ------------------------------------------------------------

B1_ANGLE = 0
B2_ANGLE = 50
B3_ANGLE = 100
B4_ANGLE = 150

MACHINE_POSITIONS = {
    "B1": B1_ANGLE,
    "B2": B2_ANGLE,
    "B3": B3_ANGLE,
    "B4": B4_ANGLE,
}


# ------------------------------------------------------------
# STATIONS
# ------------------------------------------------------------

STATIONS = (
    "B1",
    "B2",
    "B3",
    "B4",
)

TOTAL_STATIONS = 4


# ------------------------------------------------------------
# CYCLE LIMITS
# ------------------------------------------------------------

MIN_CYCLES = 1
MAX_CYCLES = 1000


# ------------------------------------------------------------
# DEFAULT TIMING
# ------------------------------------------------------------

DEFAULT_WAITING_TIME = 2.0
DEFAULT_DIPPING_TIME = 5.0

POST_DIP_WAIT = 2.0


# ------------------------------------------------------------
# SERVO ANIMATION
# ------------------------------------------------------------

SERVO_ANIMATION_MS = 900


# ------------------------------------------------------------
# MACHINE STATES
# ------------------------------------------------------------

STATE_IDLE = "IDLE"
STATE_READY = "READY"
STATE_RUNNING = "RUNNING"
STATE_STOPPED = "STOPPED"
STATE_HOMING = "HOMING"


# ------------------------------------------------------------
# MACHINE MODES
# ------------------------------------------------------------

MODE_REAL = "REAL"
MODE_DEMO = "DEMO"


# ------------------------------------------------------------
# TIMER PHASES
# ------------------------------------------------------------

TIMER_WAIT = "WAIT"
TIMER_DIP = "DIP"
TIMER_POST = "POST"


# ------------------------------------------------------------
# MACHINE OPERATIONS
# ------------------------------------------------------------

OPERATION_WAITING = "WAITING"
OPERATION_DIPPING = "DIPPING"
OPERATION_POST_WAIT = "POST WAIT"
OPERATION_HOMING = "HOMING"
OPERATION_READY = "SYSTEM READY"
OPERATION_STOPPED = "EMERGENCY STOP"
OPERATION_COMPLETE = "CYCLE COMPLETE"