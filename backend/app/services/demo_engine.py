# ============================================================
# CHEMICAL DIPPING ROBOT
# DEMO ENGINE
# ============================================================

import threading
import time

from app.core.constants import (
    MODE_DEMO,
    OPERATION_COMPLETE,
    OPERATION_DIPPING,
    OPERATION_HOMING,
    OPERATION_POST_WAIT,
    STATE_READY,
    STATE_RUNNING,
    STATE_STOPPED,
    TIMER_DIP,
    TIMER_POST,
    TIMER_WAIT,
)

from app.core.state import machine_state


class DemoEngine:
    """
    DEMO execution engine.

    Machine sequence:

        B1 -> WAIT -> DIP -> POST
        B2 -> WAIT -> DIP -> POST
        B3 -> WAIT -> DIP -> POST
        B4 -> WAIT -> DIP -> POST
        HOME
        NEXT CYCLE / COMPLETE
    """

    _thread = None
    _stop_event = None

    # ========================================================
    # START
    # ========================================================

    @classmethod
    def start(cls):

        # Prevent duplicate demo threads
        if (
            cls._thread is not None
            and cls._thread.is_alive()
        ):
            return False

        # Demo engine can only run in DEMO mode
        if machine_state["mode"] != MODE_DEMO:
            return False

        # Create stop event
        cls._stop_event = threading.Event()

        # Start background execution
        cls._thread = threading.Thread(
            target=cls._run,
            daemon=True,
            name="ChemicalDippingDemoEngine",
        )

        cls._thread.start()

        return True

    # ========================================================
    # STOP
    # ========================================================

    @classmethod
    def stop(cls):

        if cls._stop_event is not None:
            cls._stop_event.set()

        machine_state["demo_running"] = False

        machine_state["machine_status"] = STATE_STOPPED

        machine_state["timer_phase"] = None

        machine_state["timer_remaining"] = 0.0

        machine_state["operation"] = (
            "Machine operation stopped"
        )

    # ========================================================
    # RUNNING STATUS
    # ========================================================

    @classmethod
    def is_running(cls):

        return (
            cls._thread is not None
            and cls._thread.is_alive()
        )

    # ========================================================
    # WAIT / TIMER PHASE
    # ========================================================

    @classmethod
    def _wait_phase(
        cls,
        phase,
        seconds,
        operation,
    ):

        machine_state["timer_phase"] = phase

        machine_state["operation"] = operation

        remaining = max(
            float(seconds),
            0.0,
        )

        while remaining > 0:

            # Stop immediately if requested
            if (
                cls._stop_event is not None
                and cls._stop_event.is_set()
            ):
                return False

            machine_state["timer_remaining"] = round(
                remaining,
                1,
            )

            time.sleep(0.1)

            remaining -= 0.1

        machine_state["timer_remaining"] = 0.0

        return True

    # ========================================================
    # RUN ONE STATION
    # ========================================================

    @classmethod
    def _run_station(
        cls,
        station_name,
    ):

        station_data = machine_state[
            "positions"
        ][station_name]

        angle = station_data["angle"]

        timing = machine_state[
            "timing"
        ][station_name]

        waiting_time = float(
            timing["waiting"]
        )

        dipping_time = float(
            timing["dipping"]
        )

        # ----------------------------------------------------
        # MOVE TO STATION
        # ----------------------------------------------------

        machine_state["position"] = station_name

        machine_state["angle"] = angle

        # ----------------------------------------------------
        # WAIT
        # ----------------------------------------------------

        if not cls._wait_phase(
            TIMER_WAIT,
            waiting_time,
            f"Waiting at {station_name}",
        ):
            return False

        # ----------------------------------------------------
        # DIP
        # ----------------------------------------------------

        if not cls._wait_phase(
            TIMER_DIP,
            dipping_time,
            f"Dipping at {station_name}",
        ):
            return False

        # ----------------------------------------------------
        # POST DIP WAIT
        # ----------------------------------------------------

        if not cls._wait_phase(
            TIMER_POST,
            2.0,
            OPERATION_POST_WAIT,
        ):
            return False

        return True

    # ========================================================
    # MAIN DEMO LOOP
    # ========================================================

    @classmethod
    def _run(cls):

        try:

            machine_state["demo_running"] = True

            machine_state["machine_status"] = (
                STATE_RUNNING
            )

            machine_state["current_cycle"] = 0

            machine_state["station"] = 1

            machine_state["position"] = "HOME"

            machine_state["angle"] = 0

            machine_state["timer_phase"] = None

            machine_state["timer_remaining"] = 0.0

            total_cycles = int(
                machine_state["total_cycles"]
            )

            stations = (
                "B1",
                "B2",
                "B3",
                "B4",
            )

            # =================================================
            # CYCLE LOOP
            # =================================================

            for cycle in range(
                1,
                total_cycles + 1,
            ):

                if cls._stop_event.is_set():
                    return

                machine_state["current_cycle"] = cycle

                # =============================================
                # STATION LOOP
                # =============================================

                for index, station_name in enumerate(
                    stations,
                    start=1,
                ):

                    if cls._stop_event.is_set():
                        return

                    machine_state["station"] = index

                    success = cls._run_station(
                        station_name
                    )

                    if not success:
                        return

                # =============================================
                # RETURN HOME
                # =============================================

                machine_state["position"] = "HOME"

                machine_state["angle"] = 0

                machine_state["station"] = 1

                if not cls._wait_phase(
                    TIMER_POST,
                    0.9,
                    OPERATION_HOMING,
                ):
                    return

            # =================================================
            # COMPLETE
            # =================================================

            machine_state["demo_running"] = False

            machine_state["machine_status"] = (
                STATE_READY
            )

            machine_state["position"] = "HOME"

            machine_state["angle"] = 0

            machine_state["station"] = 1

            machine_state["timer_phase"] = None

            machine_state["timer_remaining"] = 0.0

            machine_state["operation"] = (
                OPERATION_COMPLETE
            )

        except Exception as exc:

            machine_state["demo_running"] = False

            machine_state["machine_status"] = (
                STATE_STOPPED
            )

            machine_state["timer_phase"] = None

            machine_state["timer_remaining"] = 0.0

            machine_state["operation"] = (
                f"Demo engine error: {exc}"
            )

        finally:

            machine_state["demo_running"] = False

            cls._stop_event = None

            cls._thread = None