# ============================================================
# CHEMICAL DIPPING ROBOT
# MACHINE SERVICE
# ============================================================

from app.core.constants import (
    MAX_CYCLES,
    MIN_CYCLES,
    MODE_DEMO,
    MODE_REAL,
    STATE_HOMING,
    STATE_IDLE,
    STATE_READY,
    STATE_RUNNING,
    STATE_STOPPED,
)

from app.core.state import machine_state

from app.services.demo_engine import DemoEngine
from app.services.tcp_client import TCPClient


# ============================================================
# MACHINE SERVICE
# ============================================================

class MachineService:
    """
    Central machine-control service.

    DEMO MODE:
        MachineService -> DemoEngine

    REAL MODE:
        MachineService -> TCPClient -> ESP32
    """

    # ========================================================
    # ESP32 TCP CLIENT
    # ========================================================

    tcp_client = TCPClient()


    # ========================================================
    # STATUS
    # ========================================================

    @staticmethod
    def get_status():

        return machine_state


    # ========================================================
    # ESP32 MESSAGE CALLBACK
    # ========================================================

    @staticmethod
    def _handle_esp32_message(
        message: str,
    ):
        """
        Process messages received from ESP32.

        Supported messages:

            START_ACCEPTED

            POSITION:<angle>

            TIMER:WAIT:<remaining>
            TIMER:DIP:<remaining>
            TIMER:POST:<remaining>

            OPERATION:<text>

            CYCLE_COMPLETE
        """

        message = message.strip()


        # ====================================================
        # START ACCEPTED
        # ====================================================

        if message == "START_ACCEPTED":

            machine_state["machine_status"] = (
                STATE_RUNNING
            )

            machine_state["operation"] = (
                "START ACCEPTED • ESP32"
            )

            return


        # ====================================================
        # POSITION
        # ====================================================

        if message.startswith(
            "POSITION:"
        ):

            try:

                angle = int(
                    message.split(
                        ":",
                        1,
                    )[1]
                )

            except (
                ValueError,
                IndexError,
            ):

                return


            # Only accept fixed machine
            # positions.

            position_map = {

                0: ("HOME", 1),

                50: ("B2", 2),

                100: ("B3", 3),

                150: ("B4", 4),

            }


            # B1 is the 0 degree position.

            if angle not in position_map:

                return


            position, station = (
                position_map[angle]
            )


            machine_state["angle"] = (
                angle
            )

            machine_state["position"] = (
                position
            )

            machine_state["station"] = (
                station
            )

            machine_state["timer_remaining"] = (
                0.0
            )


            return


        # ====================================================
        # TIMER
        # ====================================================

        if message.startswith(
            "TIMER:"
        ):

            parts = message.split(":")


            if len(parts) < 3:

                return


            phase = parts[1]


            try:

                remaining = float(
                    parts[2]
                )

            except ValueError:

                return


            machine_state[
                "timer_phase"
            ] = phase


            machine_state[
                "timer_remaining"
            ] = max(
                0.0,
                remaining,
            )


            machine_state[
                "machine_status"
            ] = STATE_RUNNING


            return


        # ====================================================
        # OPERATION
        # ====================================================

        if message.startswith(
            "OPERATION:"
        ):

            operation = message.split(
                ":",
                1,
            )[1]


            machine_state[
                "operation"
            ] = operation


            return


        # ====================================================
        # CYCLE COMPLETE
        # ====================================================

        if message == "CYCLE_COMPLETE":

            machine_state[
                "timer_phase"
            ] = None


            machine_state[
                "timer_remaining"
            ] = 0.0


            machine_state[
                "position"
            ] = "HOME"


            machine_state[
                "angle"
            ] = 0


            machine_state[
                "station"
            ] = 1


            machine_state[
                "machine_status"
            ] = STATE_READY


            machine_state[
                "demo_running"
            ] = False


            machine_state[
                "operation"
            ] = "CYCLE COMPLETE"


            return


    # ========================================================
    # ESP32 DISCONNECT CALLBACK
    # ========================================================

    @staticmethod
    def _handle_esp32_disconnect():

        # Do not overwrite DEMO state.

        if machine_state[
            "mode"
        ] == MODE_DEMO:

            return


        machine_state[
            "connection"
        ] = "offline"


        machine_state[
            "machine_status"
        ] = STATE_IDLE


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = "ESP32 connection lost"


    # ========================================================
    # CONNECT TO REAL ESP32
    # ========================================================

    @staticmethod
    def connect(
        ip: str,
        port: int,
    ):

        # ----------------------------------------------------
        # Stop demo
        # ----------------------------------------------------

        if DemoEngine.is_running():

            DemoEngine.stop()


        # ----------------------------------------------------
        # Configure callbacks
        # ----------------------------------------------------

        MachineService.tcp_client.on_message = (
            MachineService._handle_esp32_message
        )


        MachineService.tcp_client.on_disconnect = (
            MachineService._handle_esp32_disconnect
        )


        # ----------------------------------------------------
        # TCP connection
        # ----------------------------------------------------

        connected = (
            MachineService.tcp_client.connect(
                ip,
                port,
                timeout=5.0,
            )
        )


        if not connected:

            machine_state[
                "connection"
            ] = "offline"


            machine_state[
                "machine_status"
            ] = STATE_IDLE


            machine_state[
                "mode"
            ] = MODE_REAL


            machine_state[
                "demo_running"
            ] = False


            machine_state[
                "operation"
            ] = "Could not connect to ESP32"


            return {
                "connected": False,
                "message": "Could not connect to ESP32",
                **machine_state,
            }


        # ----------------------------------------------------
        # Connected
        # ----------------------------------------------------

        machine_state[
            "connection"
        ] = "online"


        machine_state[
            "mode"
        ] = MODE_REAL


        machine_state[
            "machine_status"
        ] = STATE_READY


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "position"
        ] = "HOME"


        machine_state[
            "angle"
        ] = 0


        machine_state[
            "station"
        ] = 1


        machine_state[
            "current_cycle"
        ] = 0


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = "Machine connected and ready"


        return {
            "connected": True,
            "message": "ESP32 connected successfully",
            **machine_state,
        }


    # ========================================================
    # DEMO MODE
    # ========================================================

    @staticmethod
    def start_demo():

        # ----------------------------------------------------
        # Stop existing demo
        # ----------------------------------------------------

        if DemoEngine.is_running():

            DemoEngine.stop()


        # ----------------------------------------------------
        # Disconnect real ESP32
        # ----------------------------------------------------

        if MachineService.tcp_client.is_connected():

            MachineService.tcp_client.disconnect()


        # ----------------------------------------------------
        # DEMO STATE
        # ----------------------------------------------------

        machine_state[
            "connection"
        ] = "online"


        machine_state[
            "mode"
        ] = MODE_DEMO


        machine_state[
            "machine_status"
        ] = STATE_READY


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "position"
        ] = "HOME"


        machine_state[
            "angle"
        ] = 0


        machine_state[
            "station"
        ] = 1


        machine_state[
            "current_cycle"
        ] = 0


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = "Demo mode ready"


        return machine_state


    # ========================================================
    # DISCONNECT
    # ========================================================

    @staticmethod
    def disconnect():

        # ----------------------------------------------------
        # Stop demo
        # ----------------------------------------------------

        if DemoEngine.is_running():

            DemoEngine.stop()


        # ----------------------------------------------------
        # Disconnect ESP32
        # ----------------------------------------------------

        MachineService.tcp_client.disconnect()


        # ----------------------------------------------------
        # Reset state
        # ----------------------------------------------------

        machine_state[
            "connection"
        ] = "offline"


        machine_state[
            "machine_status"
        ] = STATE_IDLE


        machine_state[
            "mode"
        ] = MODE_REAL


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "position"
        ] = "HOME"


        machine_state[
            "angle"
        ] = 0


        machine_state[
            "station"
        ] = 1


        machine_state[
            "current_cycle"
        ] = 0


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = "Disconnected from machine"


        return machine_state


    # ========================================================
    # HOME
    # ========================================================

    @staticmethod
    def home():

        if machine_state[
            "connection"
        ] != "online":

            machine_state[
                "operation"
            ] = "Connect to the machine first"

            return machine_state


        # ====================================================
        # DEMO
        # ====================================================

        if machine_state[
            "mode"
        ] == MODE_DEMO:

            DemoEngine.stop()


        # ====================================================
        # REAL ESP32
        # ====================================================

        else:

            sent = (
                MachineService.tcp_client
                .send_home()
            )


            if not sent:

                machine_state[
                    "operation"
                ] = "Failed to send HOME to ESP32"

                return machine_state


        # ====================================================
        # STATE
        # ====================================================

        machine_state[
            "machine_status"
        ] = STATE_HOMING


        machine_state[
            "position"
        ] = "HOME"


        machine_state[
            "angle"
        ] = 0


        machine_state[
            "station"
        ] = 1


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = "Moving machine to home position"


        return machine_state


    # ========================================================
    # START
    # ========================================================

    @staticmethod
    def start():

        if machine_state[
            "connection"
        ] != "online":

            machine_state[
                "operation"
            ] = "Connect to the machine first"

            return machine_state


        total_cycles = int(
            machine_state[
                "total_cycles"
            ]
        )


        # ====================================================
        # DEMO MODE
        # ====================================================

        if machine_state[
            "mode"
        ] == MODE_DEMO:

            if DemoEngine.is_running():

                return machine_state


            machine_state[
                "machine_status"
            ] = STATE_RUNNING


            machine_state[
                "demo_running"
            ] = True


            machine_state[
                "current_cycle"
            ] = 0


            machine_state[
                "position"
            ] = "HOME"


            machine_state[
                "angle"
            ] = 0


            machine_state[
                "station"
            ] = 1


            machine_state[
                "timer_phase"
            ] = None


            machine_state[
                "timer_remaining"
            ] = 0.0


            machine_state[
                "operation"
            ] = (
                f"Running {total_cycles} cycle"
                f"{'s' if total_cycles > 1 else ''}"
            )


            DemoEngine.start()


            return machine_state


        # ====================================================
        # REAL ESP32 MODE
        # ====================================================

        timing = (
            machine_state[
                "timing"
            ]
        )


        sent = (
            MachineService.tcp_client
            .send_start(
                total_cycles,
                timing,
            )
        )


        if not sent:

            machine_state[
                "connection"
            ] = "offline"


            machine_state[
                "machine_status"
            ] = STATE_IDLE


            machine_state[
                "operation"
            ] = (
                "Failed to send START to ESP32"
            )


            return machine_state


        # ----------------------------------------------------
        # STATE
        # ----------------------------------------------------

        machine_state[
            "machine_status"
        ] = STATE_RUNNING


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "current_cycle"
        ] = 0


        machine_state[
            "position"
        ] = "HOME"


        machine_state[
            "angle"
        ] = 0


        machine_state[
            "station"
        ] = 1


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = (
            f"Running {total_cycles} cycle"
            f"{'s' if total_cycles > 1 else ''}"
        )


        return machine_state


    # ========================================================
    # STOP
    # ========================================================

    @staticmethod
    def stop():

        if machine_state[
            "connection"
        ] != "online":

            machine_state[
                "operation"
            ] = "Connect to the machine first"

            return machine_state


        # ====================================================
        # DEMO
        # ====================================================

        if machine_state[
            "mode"
        ] == MODE_DEMO:

            DemoEngine.stop()

            return machine_state


        # ====================================================
        # REAL ESP32
        # ====================================================

        sent = (
            MachineService.tcp_client
            .send_stop()
        )


        if not sent:

            machine_state[
                "connection"
            ] = "offline"


            machine_state[
                "machine_status"
            ] = STATE_IDLE


            machine_state[
                "operation"
            ] = (
                "Failed to send STOP to ESP32"
            )


            return machine_state


        # ====================================================
        # STATE
        # ====================================================

        machine_state[
            "machine_status"
        ] = STATE_STOPPED


        machine_state[
            "demo_running"
        ] = False


        machine_state[
            "position"
        ] = "SAFE"


        machine_state[
            "timer_phase"
        ] = None


        machine_state[
            "timer_remaining"
        ] = 0.0


        machine_state[
            "operation"
        ] = (
            "Machine operation stopped"
        )


        return machine_state


    # ========================================================
    # CYCLE COUNT
    # ========================================================

    @staticmethod
    def set_cycles(
        count: int,
    ):

        if (
            count < MIN_CYCLES
            or count > MAX_CYCLES
        ):

            return {
                "error": (
                    f"Cycle count must be between "
                    f"{MIN_CYCLES} and {MAX_CYCLES}"
                )
            }


        machine_state[
            "total_cycles"
        ] = count


        machine_state[
            "current_cycle"
        ] = 0


        machine_state[
            "operation"
        ] = (
            f"Cycle count set to {count}"
        )


        return machine_state