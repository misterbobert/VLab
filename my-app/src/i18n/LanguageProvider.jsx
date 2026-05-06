import React, { createContext, useContext, useMemo, useState } from "react";
import { translatePageToLanguage } from "./domTranslator";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("site-language") || "ro"
  );
  const [isTranslating, setIsTranslating] = useState(false);

  async function changeLanguage(nextLanguage) {
    if (!nextLanguage || nextLanguage === language) return;

    try {
      setIsTranslating(true);

      // lăsăm overlay-ul să se deseneze înainte să înceapă traducerea
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => setTimeout(resolve, 120));

      await translatePageToLanguage(nextLanguage);

      localStorage.setItem("site-language", nextLanguage);
      setLanguage(nextLanguage);

      // ca să nu dispară prea brutal popup-ul
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (err) {
      console.error("Eroare la schimbarea limbii:", err);
    } finally {
      setIsTranslating(false);
    }
  }

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      isTranslating,
    }),
    [language, isTranslating]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error("useLanguage trebuie folosit în LanguageProvider");
  }

  return ctx;
}