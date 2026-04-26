import React from "react";
import { Link } from "react-router-dom";
import { useVoltLab } from "../../hooks/useVoltLabStore.jsx";

export default function SafetyDialog() {
  const { state, actions } = useVoltLab();

  const dialog = state.safetyDialog;
  if (!dialog) return null;

  const warnings = dialog.warnings || [];
  const first = warnings[0];

  if (!first) return null;

  const isDanger = first.severity === "danger";
  const isWarning = first.severity === "warning";

  const badgeClass = isDanger
    ? "bg-rose-500/15 text-rose-200 ring-rose-400/25"
    : isWarning
    ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
    : "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25";

  const icon = isDanger ? "⚠️" : isWarning ? "💡" : "ℹ️";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[540px] rounded-[28px] border border-white/10 bg-[#0b0f17] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.7)]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl ring-1 ring-white/10">
            {icon}
          </div>

          <div>
            <div
              className={[
                "mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                badgeClass,
              ].join(" ")}
            >
              Atenție la circuit
            </div>

            <h2 className="text-xl font-bold text-white">
              {first.title}
            </h2>
          </div>
        </div>

        <p className="text-sm leading-6 text-white/75">
          {first.message}
        </p>

        {warnings.length > 1 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Alte probleme detectate
            </div>

            <div className="space-y-2">
              {warnings.slice(1).map((warning, index) => (
                <div
                  key={`${warning.title}-${index}`}
                  className="rounded-xl bg-black/20 px-3 py-2 text-sm text-white/70"
                >
                  {warning.title}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={actions.closeSafetyDialog}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Închide
          </button>

          <Link
            to="/theory"
            onClick={actions.closeSafetyDialog}
            className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-center text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
          >
            Mergi la teorie
          </Link>
        </div>
      </div>
    </div>
  );
}