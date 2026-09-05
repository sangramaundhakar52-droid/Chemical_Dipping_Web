import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ConnectionPage from "./pages/ConnectionPage";
import StartPage from "./pages/StartPage";
import ControlPage from "./pages/ControlPage";

import "./styles/page1.css";
import "./styles/page2.css";
import "./styles/page3.css";


// ============================================================
// CHEMICAL DIPPING ROBOT
// APPLICATION ROUTER
// ============================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==================================================
            PAGE 1
            ESP32 CONNECTION
        ================================================== */}

        <Route
          path="/"
          element={<ConnectionPage />}
        />


        {/* ==================================================
            PAGE 2
            SYSTEM READY
        ================================================== */}

        <Route
          path="/start"
          element={<StartPage />}
        />


        {/* ==================================================
            PAGE 3
            MACHINE CONTROL
        ================================================== */}

        <Route
          path="/control"
          element={<ControlPage />}
        />


        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;