import React from "react";

export default function TranslationLoader({ open, languageLabel = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md" data-no-translate>
      <div className="w-[360px] max-w-[calc(100vw-32px)] rounded-[28px] border border-cyan-300/20 bg-[#0b0f17] p-6 text-white shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200/20 border-t-cyan-300" />
        </div>

        <h2 className="mt-5 text-center text-lg font-black">
          Se traduce pagina...
        </h2>

        <p className="mt-2 text-center text-sm leading-6 text-white/60">
          {languageLabel
            ? `Se încarcă limba ${languageLabel}.`
            : "Te rog așteaptă câteva momente."}
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300" />
        </div>

        <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-white/35">
          VoltLab Translator
        </p>
      </div>
    </div>
  );
}