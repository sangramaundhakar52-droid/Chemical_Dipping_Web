# ============================================================
# CHEMICAL DIPPING ROBOT
# ESP32 TCP CLIENT
# ============================================================

import socket
import threading
from typing import Callable, Optional


class TCPClient:
    """
    TCP communication layer between the FastAPI backend
    and the Chemical Dipping Robot ESP32 controller.
    """

    # ========================================================
    # INITIALIZATION
    # ========================================================

    def __init__(
        self,
        on_message: Optional[Callable[[str], None]] = None,
        on_disconnect: Optional[Callable[[], None]] = None,
    ):

        self.socket = None

        self.ip = None

        self.port = None

        self.connected = False

        self.running = False

        self.on_message = on_message

        self.on_disconnect = on_disconnect

        self.receive_thread = None

        self.send_lock = threading.Lock()


    # ========================================================
    # CONNECT
    # ========================================================

    def connect(
        self,
        ip: str,
        port: int,
        timeout: float = 5.0,
    ) -> bool:

        self.disconnect()

        self.ip = ip

        self.port = port


        sock = None

        try:

            sock = socket.socket(
                socket.AF_INET,
                socket.SOCK_STREAM,
            )

            sock.settimeout(
                timeout
            )

            sock.connect(
                (
                    ip,
                    port,
                )
            )

            # After connection, allow
            # blocking receive.

            sock.settimeout(None)

            self.socket = sock

            self.connected = True

            self.running = True


            # Start background receive thread.

            self.receive_thread = (
                threading.Thread(
                    target=self._receive_loop,
                    daemon=True,
                )
            )

            self.receive_thread.start()


            return True


        except Exception:

            if sock is not None:

                try:
                    sock.close()

                except Exception:
                    pass


            self.socket = None

            self.connected = False

            self.running = False


            return False


    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(self):

        self.running = False

        self.connected = False


        sock = self.socket

        self.socket = None


        if sock is not None:

            try:
                sock.shutdown(
                    socket.SHUT_RDWR
                )

            except Exception:
                pass


            try:
                sock.close()

            except Exception:
                pass


    # ========================================================
    # CONNECTION STATUS
    # ========================================================

    def is_connected(self) -> bool:

        return (
            self.connected
            and self.socket is not None
        )


    # ========================================================
    # SEND RAW MESSAGE
    # ========================================================

    def send(
        self,
        message: str,
    ) -> bool:

        if not self.is_connected():

            return False


        try:

            data = (
                message.rstrip("\r\n")
                + "\n"
            ).encode("utf-8")


            with self.send_lock:

                self.socket.sendall(
                    data
                )


            return True


        except Exception:

            self.connected = False

            return False


    # ========================================================
    # START COMMAND
    # ========================================================

    def send_start(
        self,
        total_cycles: int,
        timing: dict,
    ) -> bool:

        """
        Original GUI protocol:

        START|CYCLES:<count>|0:<wait>:<dip>|
        50:<wait>:<dip>|100:<wait>:<dip>|
        150:<wait>:<dip>
        """

        positions = (
            0,
            50,
            100,
            150,
        )


        parts = [
            "START",
            f"CYCLES:{int(total_cycles)}",
        ]


        for angle in positions:

            station = self._station_from_angle(
                angle
            )


            values = timing.get(
                station,
                {},
            )


            waiting = float(
                values.get(
                    "waiting",
                    2.0,
                )
            )


            dipping = float(
                values.get(
                    "dipping",
                    5.0,
                )
            )


            parts.append(
                f"{angle}:{waiting}:{dipping}"
            )


        command = "|".join(parts)


        return self.send(
            command
        )


    # ========================================================
    # STOP
    # ========================================================

    def send_stop(self) -> bool:

        return self.send(
            "STOP"
        )


    # ========================================================
    # HOME
    # ========================================================

    def send_home(self) -> bool:

        return self.send(
            "HOME"
        )


    # ========================================================
    # RECEIVE LOOP
    # ========================================================

    def _receive_loop(self):

        buffer = ""


        while self.running:

            sock = self.socket


            if sock is None:

                break


            try:

                data = sock.recv(
                    4096
                )


                if not data:

                    break


                buffer += data.decode(
                    "utf-8",
                    errors="ignore",
                )


                # ESP32 messages are
                # newline terminated.

                while "\n" in buffer:

                    line, buffer = (
                        buffer.split(
                            "\n",
                            1,
                        )
                    )


                    message = (
                        line
                        .strip()
                    )


                    if not message:

                        continue


                    self._handle_message(
                        message
                    )


            except Exception:

                break


        # Connection was lost.

        self.connected = False

        self.running = False


        if self.on_disconnect:

            try:

                self.on_disconnect()

            except Exception:
                pass


    # ========================================================
    # MESSAGE HANDLER
    # ========================================================

    def _handle_message(
        self,
        message: str,
    ):

        if self.on_message:

            try:

                self.on_message(
                    message
                )

            except Exception:
                pass


    # ========================================================
    # ANGLE → STATION
    # ========================================================

    @staticmethod
    def _station_from_angle(
        angle: int,
    ) -> str:

        mapping = {

            0: "B1",

            50: "B2",

            100: "B3",

            150: "B4",

        }


        return mapping[
            angle
        ]