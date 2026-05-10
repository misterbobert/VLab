import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import TranslationLoader from "../components/TranslationLoader";

import LabPage from "../pages/LabPage";
import LogicLabPage from "../pages/LogicLabPage";
import LogicTheoryPage from "../pages/LogicTheoryPage";
import Theory from "../pages/Theory";
import HowItWorks from "../pages/HowItWorks";
import Examples from "../pages/Examples";
import Tests from "../pages/Tests";
import About from "../pages/About";

import { VoltLabProvider } from "../hooks/useVoltLabStore.jsx";

const LANGUAGE_LABELS = {
  ro: "Română",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  hu: "Magyar",
  bg: "Български",
  tr: "Türkçe",
  uk: "Українська",
  ru: "Русский",
  ar: "العربية",
  "zh-CN": "中文",
  ja: "日本語",
  ko: "한국어",
};

function AppContent() {
  const location = useLocation();

  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("");

  const hideNavbar =
    location.pathname === "/logic" || location.pathname === "/logic-theory";

  return (
    <>
      <TranslationLoader
        open={isTranslating}
        languageLabel={LANGUAGE_LABELS[targetLanguage] || ""}
      />

      <div className={isTranslating ? "pointer-events-none select-none" : ""}>
        {!hideNavbar && <Navbar />}

        <Routes>
          <Route path="/" element={<LabPage />} />
          <Route path="/logic" element={<LogicLabPage />} />
          <Route path="/logic-theory" element={<LogicTheoryPage />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>

      <LanguageSwitcher
        onTranslateStart={(lang) => {
          setTargetLanguage(lang);
          setIsTranslating(true);
        }}
        onTranslateEnd={() => {
          window.setTimeout(() => {
            setIsTranslating(false);
            setTargetLanguage("");
          }, 250);
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <VoltLabProvider>
        <AppContent />
      </VoltLabProvider>
    </BrowserRouter>
  );
}
