import { useVoltLab } from "../../hooks/useVoltLabStore.jsx";
import React from "react";

function Btn({ active, onClick, children, danger }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-sm transition",
        danger
          ? "border-rose-400/20 bg-rose-500/10 hover:bg-rose-500/15"
          : active
          ? "border-white/20 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RenderStyleToggle({ value, onChange }) {
  const schematic = value === "schematic";

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span
        className={[
          "text-xs font-bold transition",
          !schematic ? "text-cyan-100" : "text-white/45",
        ].join(" ")}
      >
        Vizual
      </span>

      <button
        type="button"
        onClick={() => onChange(schematic ? "real" : "schematic")}
        className={[
          "relative h-7 w-14 rounded-full border transition",
          schematic
            ? "border-cyan-300/40 bg-cyan-300/25"
            : "border-white/10 bg-black/30",
        ].join(" ")}
        title="Schimbă modul de afișare al circuitului"
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            schematic ? "left-8" : "left-1",
          ].join(" ")}
        />
      </button>

      <span
        className={[
          "text-xs font-bold transition",
          schematic ? "text-cyan-100" : "text-white/45",
        ].join(" ")}
      >
        Schematic
      </span>
    </div>
  );
}

export default function Toolbar() {
  const { state, actions } = useVoltLab();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <RenderStyleToggle
        value={state.renderStyle}
        onChange={actions.setRenderStyle}
      />

      <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

      <Btn active={state.mode === "select"} onClick={() => actions.setMode("select")}>
        Selectează
      </Btn>
      <Btn active={state.mode === "wire"} onClick={() => actions.setMode("wire")}>
        Cablu
      </Btn>

      <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

      {!state.running ? (
        <Btn onClick={() => actions.play()} active={false}>
          Start
        </Btn>
      ) : (
        <Btn onClick={() => actions.stop()} active={false}>
          Stop
        </Btn>
      )}

      <Btn danger onClick={() => actions.clearWires()}>
        Ștergeți firele
      </Btn>

      <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

      <Btn onClick={() => actions.undo()}>↶ Înapoi</Btn>
      <Btn onClick={() => actions.redo()}>↷ Înainte</Btn>
    </div>
  );
}
