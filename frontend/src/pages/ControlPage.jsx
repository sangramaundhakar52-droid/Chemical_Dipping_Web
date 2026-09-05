import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import "../styles/page3.css";


// ============================================================
// CHEMICAL DIPPING ROBOT
// PAGE 3 — SETUP + REAL-TIME MACHINE VIEW
// ORIGINAL GUI → REACT
// ============================================================

const API_BASE = "";


const POSITIONS = [
    {
        name: "B1",
        angle: 0,
    },
    {
        name: "B2",
        angle: 50,
    },
    {
        name: "B3",
        angle: 100,
    },
    {
        name: "B4",
        angle: 150,
    },
];


// ============================================================
// MACHINE VIEW
// ============================================================

function MachineView({
    angle,
}) {

    const width = 650;

    const height = 540;

    const pivotX = 325;

    const pivotY = 105;

    const radius = 225;


    const getPosition = (
        servoAngle
    ) => {

        const radians =
            (
                servoAngle *
                Math.PI
            ) / 180;


        return {

            x:
                pivotX -
                radius *
                Math.cos(
                    radians
                ),

            y:
                pivotY +
                radius *
                Math.sin(
                    radians
                ),

        };

    };


    const beakers =
        POSITIONS.map(
            (station) => ({

                ...station,

                ...getPosition(
                    station.angle
                ),

            })
        );


    const armEnd =
        getPosition(angle);


    // ========================================================
    // GUIDE ARC
    // ========================================================

    const arcPoints = [];


    for (
        let a = 0;
        a <= 150;
        a += 2
    ) {

        const p =
            getPosition(a);


        arcPoints.push(
            `${p.x},${p.y}`
        );

    }


    const arcPath =
        `M ${arcPoints.join(" L ")}`;


    return (

        <svg
            className="machine-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
        >

            {/* ====================================================
                BACKGROUND
            ==================================================== */}

            <rect
                x="0"
                y="0"
                width={width}
                height={height}
                fill="#DDE7EA"
            />


            {/* ====================================================
                FLOOR
            ==================================================== */}

            <rect
                x="20"
                y="500"
                width="610"
                height="35"
                fill="#344651"
            />


            {/* ====================================================
                OUTER MACHINE FRAME
            ==================================================== */}

            <rect
                x="45"
                y="25"
                width="560"
                height="470"
                fill="none"
                stroke="#536B78"
                strokeWidth="7"
            />


            {/* ====================================================
                SERVO HOUSING
            ==================================================== */}

            <rect
                x="255"
                y="40"
                width="140"
                height="65"
                fill="#304651"
                stroke="#1C303A"
                strokeWidth="4"
            />


            <text
                x="325"
                y="72"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#F4F7F9"
                fontSize="15"
                fontWeight="700"
            >
                SERVO
            </text>


            {/* ====================================================
                PIVOT
            ==================================================== */}

            <circle
                cx={pivotX}
                cy={pivotY}
                r="27"
                fill="#172A35"
                stroke="#35A7FF"
                strokeWidth="3"
            />


            {/* ====================================================
                GUIDE ARC
            ==================================================== */}

            <path
                d={arcPath}
                fill="none"
                stroke="#269DD8"
                strokeWidth="2"
                strokeDasharray="3 7"
            />


            {/* ====================================================
                BEAKERS
            ==================================================== */}

            {beakers.map(
                (beaker) => (

                    <g
                        key={
                            beaker.name
                        }
                    >

                        {/* Glass body */}

                        <polygon
                            points={`
                                ${beaker.x - 29},${beaker.y}
                                ${beaker.x + 29},${beaker.y}
                                ${beaker.x + 21},${beaker.y + 72}
                                ${beaker.x - 21},${beaker.y + 72}
                            `}
                            fill="#B8D7E3"
                            stroke="#526A75"
                            strokeWidth="3"
                        />


                        {/* Chemical */}

                        <rect
                            x={
                                beaker.x - 22
                            }
                            y={
                                beaker.y + 30
                            }
                            width="44"
                            height="36"
                            fill="#269DD8"
                        />


                        {/* Chemical surface */}

                        <line
                            x1={
                                beaker.x - 22
                            }
                            y1={
                                beaker.y + 30
                            }
                            x2={
                                beaker.x + 22
                            }
                            y2={
                                beaker.y + 30
                            }
                            stroke="#76D5F2"
                            strokeWidth="3"
                        />


                        {/* Station name */}

                        <text
                            x={beaker.x}
                            y={
                                beaker.y - 16
                            }
                            textAnchor="middle"
                            fill="#263B46"
                            fontSize="14"
                            fontWeight="700"
                        >
                            {
                                beaker.name
                            }
                        </text>


                        {/* Angle */}

                        <text
                            x={beaker.x}
                            y={
                                beaker.y + 88
                            }
                            textAnchor="middle"
                            fill="#263B46"
                            fontSize="13"
                            fontWeight="700"
                        >
                            {
                                beaker.angle
                            }°
                        </text>

                    </g>

                )
            )}


            {/* ====================================================
                MOVING ARM
            ==================================================== */}

            <g
                className="machine-arm"
            >

                {/* Main arm */}

                <line
                    x1={pivotX}
                    y1={pivotY}
                    x2={armEnd.x}
                    y2={armEnd.y}
                    stroke="#263B46"
                    strokeWidth="17"
                    strokeLinecap="round"
                />


                {/* Inner arm */}

                <line
                    x1={pivotX}
                    y1={pivotY}
                    x2={armEnd.x}
                    y2={armEnd.y}
                    stroke="#6A808B"
                    strokeWidth="8"
                    strokeLinecap="round"
                />


                {/* Dipping shaft */}

                <rect
                    x={
                        armEnd.x - 10
                    }
                    y={
                        armEnd.y - 2
                    }
                    width="20"
                    height="47"
                    fill="#596E79"
                    stroke="#263B46"
                    strokeWidth="2"
                />


                {/* Tool */}

                <circle
                    cx={armEnd.x}
                    cy={
                        armEnd.y + 42
                    }
                    r="7"
                    fill="#263B46"
                />


                {/* Current position indicator */}

                <circle
                    cx={armEnd.x}
                    cy={armEnd.y}
                    r="5"
                    fill="#20D47A"
                />

            </g>

        </svg>

    );

}


// ============================================================
// PAGE 3
// ============================================================

function ControlPage() {

    const navigate =
        useNavigate();


    // ========================================================
    // MACHINE STATE
    // ========================================================

    const [
        machine,
        setMachine,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ========================================================
    // CYCLE COMPLETE POPUP
    // ========================================================

    const [
        showCompletionPopup,
        setShowCompletionPopup,
    ] = useState(false);


    // Prevent repeatedly opening the popup
    // while the status polling continues.

    const [
        completionShownForCycle,
        setCompletionShownForCycle,
    ] = useState(null);


    // ========================================================
    // LOCAL SETTINGS
    // ========================================================

    const [
        cycleInput,
        setCycleInput,
    ] = useState("1");


    const [
        waitTimes,
        setWaitTimes,
    ] = useState({

        B1: "2.0",
        B2: "2.0",
        B3: "2.0",
        B4: "2.0",

    });


    const [
        dipTimes,
        setDipTimes,
    ] = useState({

        B1: "5.0",
        B2: "5.0",
        B3: "5.0",
        B4: "5.0",

    });


    // ========================================================
    // LOCAL SERVO ANIMATION
    // ========================================================

    const [
        visualAngle,
        setVisualAngle,
    ] = useState(0);


    // ========================================================
    // LOAD STATUS
    // ========================================================

    const loadStatus =
        async () => {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/machine/status`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Machine status unavailable"
                    );

                }


                const data =
                    await response.json();


                setMachine(data);

                setError("");

            }

            catch (err) {

                console.error(
                    "Status error:",
                    err
                );


                setError(
                    "Backend connection unavailable"
                );

            }

            finally {

                setLoading(false);

            }

        };


    // ========================================================
    // INITIAL + LIVE STATUS
    // ========================================================

    useEffect(() => {

        loadStatus();


        const timer =
            setInterval(
                loadStatus,
                500
            );


        return () =>
            clearInterval(timer);

    }, []);


    // ========================================================
    // CYCLE COMPLETE DETECTION
    // ========================================================

    useEffect(() => {

        if (!machine) {
            return;
        }


        const isComplete =
            machine.operation ===
            "CYCLE COMPLETE";


        if (!isComplete) {

            return;

        }


        const completedCycle =
            Number(
                machine.current_cycle || 0
            );


        // Do not open the same popup
        // repeatedly during 500 ms polling.

        if (
            completionShownForCycle ===
            completedCycle
        ) {

            return;

        }


        setCompletionShownForCycle(
            completedCycle
        );


        setShowCompletionPopup(
            true
        );


    }, [
        machine?.operation,
        machine?.current_cycle,
    ]);


    // ========================================================
    // SYNC VISUAL POSITION
    // ========================================================

    useEffect(() => {

        if (!machine) {
            return;
        }


        const target =
            POSITIONS.some(
                (item) =>
                    item.angle ===
                    machine.angle
            )
                ? machine.angle
                : 0;


        const start =
            visualAngle;


        const difference =
            target - start;


        const duration = 900;


        const startTime =
            performance.now();


        let frame;


        const animate =
            (currentTime) => {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed /
                        duration,
                        1
                    );


                const smooth =
                    progress *
                    progress *
                    (
                        3 -
                        2 *
                        progress
                    );


                setVisualAngle(
                    start +
                    difference *
                    smooth
                );


                if (
                    progress < 1
                ) {

                    frame =
                        requestAnimationFrame(
                            animate
                        );

                }

            };


        frame =
            requestAnimationFrame(
                animate
            );


        return () =>
            cancelAnimationFrame(
                frame
            );


    }, [
        machine?.angle
    ]);


    // ========================================================
    // COMMAND
    // ========================================================

    const sendCommand =
        async (
            endpoint
        ) => {

            setError("");


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/machine/${endpoint}`,
                        {
                            method:
                                "POST",
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.detail ||
                        "Command failed"
                    );

                }


                setMachine(data);


                return data;

            }

            catch (err) {

                console.error(
                    "Command error:",
                    err
                );


                setError(
                    err.message ||
                    "Command failed"
                );


                return null;

            }

        };


    // ========================================================
    // APPLY CYCLE COUNT
    // ========================================================

    const applyCycleCount =
        async () => {

            const cycles =
                Number(
                    cycleInput
                );


            if (
                !Number.isInteger(
                    cycles
                ) ||
                cycles < 1 ||
                cycles > 1000
            ) {

                setError(
                    "Enter a whole number from 1 to 1000."
                );

                return;

            }


            const result =
                await sendCommand(
                    `cycles/${cycles}`
                );


            if (result) {

                // A new configuration
                // can produce a new completion.

                setCompletionShownForCycle(
                    null
                );

            }

        };


    // ========================================================
    // START
    // ========================================================

    const startCycle =
        async () => {

            const cycles =
                Number(
                    cycleInput
                );


            if (
                !Number.isInteger(
                    cycles
                ) ||
                cycles < 1 ||
                cycles > 1000
            ) {

                setError(
                    "Enter a whole number from 1 to 1000."
                );

                return;

            }


            // New cycle sequence.
            // Allow the next completion popup.

            setCompletionShownForCycle(
                null
            );


            setShowCompletionPopup(
                false
            );


            // First apply cycle count.

            const cycleResult =
                await sendCommand(
                    `cycles/${cycles}`
                );


            if (!cycleResult) {
                return;
            }


            // Then start machine.

            await sendCommand(
                "start"
            );

        };


    // ========================================================
    // STOP
    // ========================================================

    const stopCycle =
        async () => {

            setShowCompletionPopup(
                false
            );


            await sendCommand(
                "stop"
            );

        };


    // ========================================================
    // HOME
    // ========================================================

    const homeMachine =
        async () => {

            setShowCompletionPopup(
                false
            );


            await sendCommand(
                "home"
            );


            setVisualAngle(0);

        };


    // ========================================================
    // CHANGE AFTER COMPLETION
    // ========================================================

    const handleCompletionChange =
        () => {

            setShowCompletionPopup(
                false
            );


            setError("");


            // The existing Page 3 timing
            // section remains the setup area.

            setTimeout(() => {

                const timingPanel =
                    document.querySelector(
                        ".timing-panel"
                    );


                if (timingPanel) {

                    timingPanel.scrollIntoView(
                        {
                            behavior:
                                "smooth",

                            block:
                                "center",
                        }
                    );

                }

            }, 100);

        };


    // ========================================================
    // CLOSE COMPLETION POPUP
    // ========================================================

    const handleCompletionClose =
        () => {

            setShowCompletionPopup(
                false
            );

        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div
                className="page3-loading"
            >

                <div>
                    LOADING MACHINE...
                </div>

            </div>

        );

    }


    // ========================================================
    // MACHINE ERROR
    // ========================================================

    if (!machine) {

        return (

            <div
                className="page3-loading"
            >

                <div>

                    <h2>
                        MACHINE CONTROL
                    </h2>


                    <p>
                        {error}
                    </p>


                    <button
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        RETURN TO CONNECTION
                    </button>

                </div>

            </div>

        );

    }


    // ========================================================
    // DERIVED VALUES
    // ========================================================

    const isDemo =
        machine.mode ===
        "DEMO";


    const positionText =
        machine.position ===
            "HOME"

            ? "HOME • 0°"

            : `${machine.position} • ${machine.angle}°`;


    const stationText =
        machine.position ===
            "SAFE"

            ? "SAFE"

            : `STATION ${machine.station} / 4`;


    const cycleText =
        `CYCLE ${machine.current_cycle || 0
        } / ${machine.total_cycles || 1
        }`;


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div
            className="page3"
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <header
                className="page3-header"
            >

                <div
                    className="page3-title"
                >
                    CHEMICAL DIPPING ROBOT
                </div>


                <div
                    className="page3-mode"
                >

                    <span>
                        ●
                    </span>


                    {
                        isDemo
                            ? "DEMO MODE"
                            : "ESP32 ONLINE"
                    }

                </div>

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main
                className="page3-main"
            >

                {/* =================================================
                    LEFT MACHINE VIEW
                ================================================= */}

                <section
                    className="machine-section"
                >

                    <h2>
                        REAL-TIME MACHINE VIEW
                    </h2>


                    <div
                        className="machine-canvas-wrap"
                    >

                        <MachineView
                            angle={
                                visualAngle
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <section
                    className="page3-right"
                >

                    {/* ==============================================
                        STATUS
                    ============================================== */}

                    <div
                        className="status-panel"
                    >

                        <div
                            className="status-heading"
                        >
                            CURRENT POSITION
                        </div>


                        <div
                            className="status-position"
                        >
                            {
                                positionText
                            }
                        </div>


                        <div
                            className="status-operation"
                        >
                            {
                                machine.operation ||
                                "SYSTEM READY"
                            }
                        </div>


                        <div
                            className="status-timer"
                        >

                            {
                                Number(
                                    machine.timer_remaining ||
                                    0
                                ).toFixed(1)
                            }

                            {" "}s

                        </div>


                        <div
                            className="status-station"
                        >
                            {
                                stationText
                            }
                        </div>


                        <div
                            className="status-cycle"
                        >
                            {
                                cycleText
                            }
                        </div>

                    </div>


                    {/* ==============================================
                        TIMING SETTINGS
                    ============================================== */}

                    <div
                        className="timing-panel"
                    >

                        <h2>
                            BEAKER TIMING SETTINGS
                        </h2>


                        <div
                            className="timing-header"
                        >

                            <span>
                                BEAKER
                            </span>


                            <span>
                                WAITING TIME (s)
                            </span>


                            <span>
                                DIPPING TIME (s)
                            </span>

                        </div>


                        {
                            POSITIONS.map(
                                (station) => (

                                    <div
                                        className="timing-row"
                                        key={
                                            station.name
                                        }
                                    >

                                        <div
                                            className="timing-name"
                                        >

                                            {
                                                station.name
                                            }

                                            {
                                                station.angle === 0
                                                    ? " (HOME)"
                                                    : ""
                                            }

                                            {" "}

                                            {
                                                station.angle
                                            }°

                                        </div>


                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={
                                                waitTimes[
                                                station.name
                                                ]
                                            }
                                            onChange={
                                                (event) =>
                                                    setWaitTimes(
                                                        {
                                                            ...waitTimes,

                                                            [
                                                                station.name
                                                            ]:
                                                                event
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                            }
                                        />


                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={
                                                dipTimes[
                                                station.name
                                                ]
                                            }
                                            onChange={
                                                (event) =>
                                                    setDipTimes(
                                                        {
                                                            ...dipTimes,

                                                            [
                                                                station.name
                                                            ]:
                                                                event
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                            }
                                        />

                                    </div>

                                )
                            )
                        }


                        {/* =============================================
                            MANUAL CYCLE COUNT
                        ============================================= */}

                        <div
                            className="cycle-setting"
                        >

                            <label>
                                MANUAL CYCLE COUNT
                            </label>


                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={
                                    cycleInput
                                }
                                onChange={
                                    (event) =>
                                        setCycleInput(
                                            event
                                                .target
                                                .value
                                        )
                                }
                            />


                            <button
                                type="button"
                                onClick={
                                    applyCycleCount
                                }
                            >
                                APPLY
                            </button>

                        </div>


                        <div
                            className="timing-help"
                        >
                            Type 1, 10, 20, 100... then APPLY
                        </div>

                    </div>


                    {/* ==============================================
                        CONTROL
                    ============================================== */}

                    <div
                        className="control-panel"
                    >

                        <h2>
                            CONTROL
                        </h2>


                        <div
                            className="control-row"
                        >

                            <button
                                type="button"
                                className="start-cycle"
                                onClick={
                                    startCycle
                                }
                                disabled={
                                    machine.machine_status ===
                                    "RUNNING"
                                }
                            >
                                ▶&nbsp; START CYCLE
                            </button>


                            <button
                                type="button"
                                className="stop-cycle"
                                onClick={
                                    stopCycle
                                }
                            >
                                ■&nbsp; STOP
                            </button>


                            <button
                                type="button"
                                className="home-cycle"
                                onClick={
                                    homeMachine
                                }
                            >
                                ⌂&nbsp; HOME
                            </button>

                        </div>

                    </div>


                    {/* ==============================================
                        ERROR
                    ============================================== */}

                    {
                        error && (

                            <div
                                className="page3-error"
                            >
                                {
                                    error
                                }
                            </div>

                        )
                    }

                </section>

            </main>


            {/* ==================================================
                CYCLE COMPLETE POPUP
            ================================================== */}

            {
                showCompletionPopup && (

                    <div
                        className="cycle-complete-overlay"
                    >

                        <div
                            className="cycle-complete-popup"
                        >

                            {/* ======================================
                                SUCCESS ICON
                            ====================================== */}

                            <div
                                className="cycle-complete-icon"
                            >
                                ✓
                            </div>


                            {/* ======================================
                                TITLE
                            ====================================== */}

                            <div
                                className="cycle-complete-title"
                            >
                                CYCLE COMPLETE
                            </div>


                            {/* ======================================
                                SUMMARY
                            ====================================== */}

                            <div
                                className="cycle-complete-summary"
                            >

                                All 4 beakers completed
                                {" • "}
                                {
                                    machine.total_cycles || 1
                                }
                                {" cycle(s)"}

                            </div>


                            {/* ======================================
                                HOME
                            ====================================== */}

                            <div
                                className="cycle-complete-home"
                            >
                                Robot returned to HOME • 0°
                            </div>


                            {/* ======================================
                                FINAL MESSAGE
                            ====================================== */}

                            <div
                                className="cycle-complete-message"
                            >
                                All requested cycles are finished.
                            </div>


                            {/* ======================================
                                BUTTONS
                            ====================================== */}

                            <div
                                className="cycle-complete-buttons"
                            >

                                <button
                                    type="button"
                                    className="cycle-complete-change"
                                    onClick={
                                        handleCompletionChange
                                    }
                                >
                                    CHANGE
                                </button>


                                <button
                                    type="button"
                                    className="cycle-complete-close"
                                    onClick={
                                        handleCompletionClose
                                    }
                                >
                                    CLOSE
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}


export default ControlPage;