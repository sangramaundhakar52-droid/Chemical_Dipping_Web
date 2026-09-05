import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/page2.css";


// ============================================================
// CHEMICAL DIPPING ROBOT
// PAGE 2 — SYSTEM READY
// ORIGINAL GUI → WEB
// ============================================================

function StartPage() {

  const navigate = useNavigate();

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");


  // ==========================================================
  // START SYSTEM
  // ==========================================================

  const handleStartSystem = async () => {

    setStarting(true);
    setError("");


    try {

      const response = await fetch(
        "/api/machine/start",
        {
          method: "POST",
        }
      );


      const data =
        await response.json();


      console.log(
        "START SYSTEM response:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Unable to start machine"
        );

      }


      // ======================================================
      // MACHINE STARTED
      // ======================================================

      sessionStorage.setItem(
        "chemical_robot_machine_started",
        "true"
      );


      // Original GUI:
      // START SYSTEM → CONTROL PAGE

      navigate("/control");

    }

    catch (error) {

      console.error(
        "Start system error:",
        error
      );


      setError(
        error.message ||
        "Unable to start system"
      );

    }

    finally {

      setStarting(false);

    }

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="start-page">


      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="start-bg-circle" />


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="start-header">

        <h1>
          CHEMICAL DIPPING
          <br />
          <span>ROBOT</span>
        </h1>

        <p>
          TEAM AUTOMATRIX
        </p>

      </header>


      {/* ======================================================
          ROBOT READY AREA
      ====================================================== */}

      <main className="start-content">


        <div className="robot-display">

          <div className="robot-body">

            <div className="robot-status">
              READY
            </div>

            <div className="robot-wheel robot-wheel-left" />

            <div className="robot-wheel robot-wheel-right" />

          </div>

        </div>


        {/* ====================================================
            SYSTEM STATUS
        ==================================================== */}

        <div className="system-ready">
          SYSTEM READY
        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {
          error && (

            <div className="start-error">
              {error}
            </div>

          )
        }


        {/* ====================================================
            START BUTTON
        ==================================================== */}

        <button
          type="button"
          className="start-system-button"
          onClick={handleStartSystem}
          disabled={starting}
        >

          {
            starting
              ? "STARTING SYSTEM..."
              : "START SYSTEM"
          }

        </button>


      </main>

    </div>

  );
}


export default StartPage;