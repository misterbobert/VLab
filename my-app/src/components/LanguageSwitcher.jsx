import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LANGUAGES,
  getSavedLanguage,
  translatePage,
} from "../i18n/domTranslator";

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function LanguageSwitcher({
  onTranslateStart,
  onTranslateEnd,
}) {
  const location = useLocation();
  const [lang, setLang] = useState(getSavedLanguage());
  const [loading, setLoading] = useState(false);
  const translatingRef = useRef(false);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  async function applyLanguage(nextLang, { silent = false, force = false } = {}) {
    if (!nextLang) return;
    if (translatingRef.current) return;

    // force permite reaplicarea aceleiași limbi după rerandări React.
    if (!force && nextLang === lang && nextLang !== "ro") {
      // Totuși reaplicăm traducerea, fiindcă pagina poate fi din nou în română după rerandare.
      force = true;
    }

    translatingRef.current = true;

    try {
      setLoading(true);
      setLang(nextLang);

      if (!silent) onTranslateStart?.(nextLang);

      await wait(120);
      await translatePage(nextLang);
      await wait(200);
    } finally {
      translatingRef.current = false;
      setLoading(false);
      if (!silent) onTranslateEnd?.();
    }
  }

  useEffect(() => {
    const saved = getSavedLanguage();

    const id = window.setTimeout(() => {
      if (saved !== "ro") {
        applyLanguage(saved, { force: true });
      } else {
        setLang("ro");
      }
    }, 250);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    function handleContentChanged() {
      const saved = getSavedLanguage();
      if (saved !== "ro") {
        window.setTimeout(() => applyLanguage(saved, { force: true, silent: true }), 80);
      }
    }

    window.addEventListener("voltlab:content-changed", handleContentChanged);
    return () => window.removeEventListener("voltlab:content-changed", handleContentChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[10000]" data-no-translate>
      <div className="group relative rounded-2xl p-1">
        <button
          disabled={loading}
          className={[
            "flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b0f17]/80 px-3 py-2 text-xs font-bold text-white/75 shadow-2xl backdrop-blur transition hover:bg-white/10 hover:text-white",
            loading ? "cursor-wait opacity-70" : "",
          ].join(" ")}
          title="Schimbă limba"
        >
          <span>{current.flag}</span>
          <span>{current.code.toUpperCase()}</span>
          <span className="text-white/35">{loading ? "..." : "▾"}</span>
        </button>

        <div className="pointer-events-none absolute bottom-full right-0 mb-0 max-h-80 w-56 translate-y-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0f17]/95 p-2 opacity-0 shadow-2xl backdrop-blur transition group-hover:pointer-events-auto group-hover:opacity-100">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => applyLanguage(language.code, { force: true })}
              disabled={loading}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition disabled:cursor-wait disabled:opacity-50",
                lang === language.code
                  ? "bg-cyan-300/15 text-cyan-100"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <span className="text-base">{language.flag}</span>
              <span className="flex-1">{language.label}</span>
              {lang === language.code && (
                <span className="text-xs text-cyan-200">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
