import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/page2.css";


// ============================================================
// CHEMICAL DIPPING ROBOT
// PAGE 2 — SYSTEM READY
// ORIGINAL GUI → WEB
// ============================================================

// ============================================================
// LIVE FASTAPI BACKEND
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://chemical-dipping-web.onrender.com";


// ============================================================
// SAFE RESPONSE READER
// ============================================================

const readResponse = async (response) => {

  const contentType =
    response.headers.get("content-type") || "";

  // ----------------------------------------------------------
  // JSON response
  // ----------------------------------------------------------

  if (
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {

    try {

      return await response.json();

    } catch (error) {

      console.warn(
        "Backend returned invalid JSON:",
        error
      );

      return {};

    }

  }

  // ----------------------------------------------------------
  // Empty / text response
  // ----------------------------------------------------------

  const text =
    await response.text();

  if (!text.trim()) {
    return {};
  }

  try {

    return JSON.parse(text);

  } catch {

    return {
      message: text
    };

  }

};


// ============================================================
// START PAGE
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

      console.log(
        "Starting Chemical Dipping Robot..."
      );

      console.log(
        "Backend:",
        API_BASE
      );


      // ------------------------------------------------------
      // CALL FASTAPI BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        `${API_BASE}/api/machine/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

        }
      );


      // ------------------------------------------------------
      // READ RESPONSE SAFELY
      // ------------------------------------------------------

      const data =
        await readResponse(response);


      console.log(
        "START SYSTEM response:",
        data
      );


      // ------------------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          data?.message ||
          `Unable to start machine (${response.status})`
        );

      }


      // ======================================================
      // MACHINE STARTED
      // ======================================================

      sessionStorage.setItem(
        "chemical_robot_machine_started",
        "true"
      );


      sessionStorage.setItem(
        "chemical_robot_mode",
        sessionStorage.getItem(
          "chemical_robot_mode"
        ) || "demo"
      );


      // ------------------------------------------------------
      // Original GUI:
      // START SYSTEM → CONTROL PAGE
      // ------------------------------------------------------

      navigate("/control");

    }


    // ========================================================
    // ERROR
    // ========================================================

    catch (error) {

      console.error(
        "Start system error:",
        error
      );


      setError(
        error?.message ||
        "Unable to start system. Please check the backend."
      );

    }


    // ========================================================
    // FINALLY
    // ========================================================

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

            <div
              className="robot-wheel robot-wheel-left"
            />

            <div
              className="robot-wheel robot-wheel-right"
            />

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