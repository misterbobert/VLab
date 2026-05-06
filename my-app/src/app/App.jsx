import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";

import LabPage from "../pages/LabPage";
import LogicLabPage from "../pages/LogicLabPage";
import LogicTheoryPage from "../pages/LogicTheoryPage";
import Theory from "../pages/Theory";
import HowItWorks from "../pages/HowItWorks";
import Examples from "../pages/Examples";
import About from "../pages/About";

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/logic" || location.pathname === "/logic-theory";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LabPage />} />
        <Route path="/logic" element={<LogicLabPage />} />
        <Route path="/logic-theory" element={<LogicTheoryPage />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}