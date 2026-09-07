import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/page1.css";

// ============================================================
// CHEMICAL DIPPING ROBOT
// PAGE 1 — ESP32 CONNECTION
// ============================================================

// Live FastAPI backend
const API_BASE = "https://chemical-dipping-web.onrender.com";

function ConnectionPage() {
  const navigate = useNavigate();

  const [ipAddress, setIpAddress] = useState("192.168.4.1");
  const [tcpPort, setTcpPort] = useState("5000");

  const [status, setStatus] = useState("DISCONNECTED");
  const [connecting, setConnecting] = useState(false);

  // ==========================================================
  // DEMO MODE
  // ==========================================================

  const handleDemoMode = async () => {
    try {
      setConnecting(true);
      setStatus("STARTING DEMO...");

      const response = await fetch(
        `${API_BASE}/api/machine/demo`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log("Demo mode response:", data);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          data?.message ||
          "Demo mode failed"
        );
      }

      sessionStorage.setItem(
        "chemical_robot_mode",
        "demo"
      );

      setStatus("DEMO MODE");

      navigate("/start");
    } catch (error) {
      console.error("Demo mode error:", error);

      setStatus("FAILED");

      alert(
        "Could not start Demo Mode.\n\n" +
        "Make sure the FastAPI backend is running."
      );
    } finally {
      setConnecting(false);
    }
  };

  // ==========================================================
  // REAL ESP32 CONNECTION
  // ==========================================================

  const handleConnect = async () => {
    if (!ipAddress.trim()) {
      setStatus("INVALID IP");
      return;
    }

    if (!tcpPort.trim()) {
      setStatus("INVALID PORT");
      return;
    }

    setConnecting(true);
    setStatus("CONNECTING...");

    try {
      const url =
        `${API_BASE}/api/machine/connect` +
        `?ip=${encodeURIComponent(
          ipAddress.trim()
        )}` +
        `&port=${encodeURIComponent(
          tcpPort
        )}`;

      console.log(
        "Connecting to backend:",
        url
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log(
        "ESP32 connection response:",
        data
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      if (
        response.ok &&
        data?.connected === true
      ) {
        setStatus("CONNECTED");

        sessionStorage.setItem(
          "chemical_robot_mode",
          "esp32"
        );

        sessionStorage.setItem(
          "esp32_ip",
          ipAddress.trim()
        );

        sessionStorage.setItem(
          "esp32_port",
          tcpPort
        );

        navigate("/start");

        return;
      }

      // ======================================================
      // FAILED
      // ======================================================

      setStatus("FAILED");

      alert(
        "Could not connect to ESP32.\n\n" +
        "Check the IP address, TCP port, " +
        "Wi-Fi connection and ESP32 TCP server."
      );
    } catch (error) {
      console.error(
        "ESP32 connection error:",
        error
      );

      setStatus("FAILED");

      alert(
        "Could not connect to the backend.\n\n" +
        "Make sure the FastAPI backend is running."
      );
    } finally {
      setConnecting(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="connection-page">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="connection-bg-circle connection-bg-circle-left" />

      <div className="connection-bg-circle connection-bg-circle-right" />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="connection-header">
        <h1>
          CHEMICAL DIPPING ROBOT
        </h1>

        <p>
          SMART MACHINE CONTROL SYSTEM
        </p>
      </header>

      {/* ======================================================
          CONNECTION CARD
      ====================================================== */}

      <main className="connection-card">

        <h2>
          ESP32 Wi-Fi CONNECTION
        </h2>

        {/* ====================================================
            IP ADDRESS
        ==================================================== */}

        <label>
          ESP32 IP ADDRESS
        </label>

        <input
          type="text"
          value={ipAddress}
          onChange={(event) =>
            setIpAddress(event.target.value)
          }
          disabled={connecting}
        />

        {/* ====================================================
            PORT + STATUS
        ==================================================== */}

        <div className="connection-row">

          <div className="connection-field">

            <label>
              TCP PORT
            </label>

            <input
              type="number"
              value={tcpPort}
              onChange={(event) =>
                setTcpPort(event.target.value)
              }
              disabled={connecting}
            />

          </div>

          <div className="connection-field">

            <label>
              STATUS
            </label>

            <div
              className={`connection-status ${status === "CONNECTED"
                ? "status-connected"
                : status === "DEMO MODE"
                  ? "status-demo"
                  : status === "CONNECTING..." ||
                    status === "STARTING DEMO..."
                    ? "status-connecting"
                    : status === "FAILED"
                      ? "status-failed"
                      : ""
                }`}
            >
              {status}
            </div>

          </div>

        </div>

        {/* ====================================================
            BUTTONS
        ==================================================== */}

        <div className="connection-buttons">

          <button
            type="button"
            className="connect-button"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting
              ? "CONNECTING..."
              : "CONNECT"}
          </button>

          <button
            type="button"
            className="demo-button"
            onClick={handleDemoMode}
            disabled={connecting}
          >
            DEMO MODE
          </button>

        </div>

        <p className="demo-description">
          Demo mode runs the complete machine simulation
        </p>

      </main>

    </div>
  );
}

export default ConnectionPage;