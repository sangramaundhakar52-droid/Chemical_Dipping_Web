import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/page1.css";


// ============================================================
// CHEMICAL DIPPING ROBOT
// PAGE 1 — ESP32 CONNECTION
// ============================================================

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

      const response = await fetch(
        "/api/machine/demo",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Demo mode failed");
      }

      const data = await response.json();

      sessionStorage.setItem(
        "chemical_robot_mode",
        "demo"
      );

      setStatus("DEMO MODE");

      console.log(
        "Demo mode:",
        data
      );

      navigate("/start");

    } catch (error) {

      console.error(
        "Demo mode error:",
        error
      );

      setStatus("FAILED");

      alert(
        "Could not start Demo Mode.\n\n" +
        "Make sure the FastAPI backend is running."
      );
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
        "/api/machine/connect" +
        `?ip=${encodeURIComponent(
          ipAddress.trim()
        )}` +
        `&port=${encodeURIComponent(
          tcpPort
        )}`;


      const response = await fetch(
        url,
        {
          method: "POST",
        }
      );


      const data =
        await response.json();


      console.log(
        "ESP32 connection response:",
        data
      );


      // ======================================================
      // SUCCESS
      // ======================================================

      if (
        response.ok &&
        data.connected === true
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


        // Original GUI behavior:
        // successful connection → Page 2

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
            setIpAddress(
              event.target.value
            )
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
                setTcpPort(
                  event.target.value
                )
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
                  : status === "CONNECTING..."
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
            {
              connecting
                ? "CONNECTING..."
                : "CONNECT"
            }
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