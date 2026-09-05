# ============================================================
# CHEMICAL DIPPING ROBOT
# MACHINE WEBSOCKET SERVICE
# ============================================================

import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect

from app.core.state import machine_state


# ============================================================
# CONNECTION MANAGER
# ============================================================

class MachineWebSocketManager:
    """
    Manages WebSocket connections from the React HMI.
    """

    def __init__(self):
        self.connections = set()

    # ========================================================
    # CONNECT
    # ========================================================

    async def connect(
        self,
        websocket: WebSocket,
    ):
        await websocket.accept()

        self.connections.add(
            websocket
        )

    # ========================================================
    # DISCONNECT
    # ========================================================

    def disconnect(
        self,
        websocket: WebSocket,
    ):
        self.connections.discard(
            websocket
        )

    # ========================================================
    # SEND STATE
    # ========================================================

    async def send_state(
        self,
        websocket: WebSocket,
    ):
        await websocket.send_text(
            json.dumps(
                machine_state
            )
        )

    # ========================================================
    # BROADCAST
    # ========================================================

    async def broadcast(self):
        """
        Broadcast current machine state to all
        connected React clients.
        """

        if not self.connections:
            return

        message = json.dumps(
            machine_state
        )

        disconnected = []

        for websocket in list(
            self.connections
        ):

            try:
                await websocket.send_text(
                    message
                )

            except Exception:
                disconnected.append(
                    websocket
                )

        for websocket in disconnected:
            self.disconnect(
                websocket
            )


# ============================================================
# GLOBAL MANAGER
# ============================================================

machine_ws_manager = (
    MachineWebSocketManager()
)


# ============================================================
# WEBSOCKET ENDPOINT HANDLER
# ============================================================

async def machine_websocket(
    websocket: WebSocket,
):
    """
    WebSocket connection for the machine HMI.

    Sends the current machine state immediately and
    then keeps sending updated state periodically.
    """

    await machine_ws_manager.connect(
        websocket
    )

    try:

        # ----------------------------------------------------
        # Send initial state immediately
        # ----------------------------------------------------

        await machine_ws_manager.send_state(
            websocket
        )

        # ----------------------------------------------------
        # Keep connection alive
        # ----------------------------------------------------

        while True:

            try:

                # Wait for optional client message.
                # Timeout allows us to periodically send
                # the latest machine state.

                await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=0.5,
                )

            except asyncio.TimeoutError:

                await machine_ws_manager.send_state(
                    websocket
                )

    except WebSocketDisconnect:

        machine_ws_manager.disconnect(
            websocket
        )

    except Exception:

        machine_ws_manager.disconnect(
            websocket
        )