import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthPanel from "../components/auth/AuthPanel";
import LogicSavePanel from "../components/accounts/LogicSavePanel";

const GATES = [
  {
    type: "input",
    label: "Input",
    icon: "IN",
    inputs: 0,
    outputs: 1,
    color: "cyan",
  },
  {
    type: "output",
    label: "Output",
    icon: "OUT",
    inputs: 1,
    outputs: 0,
    color: "emerald",
  },
  {
    type: "and",
    label: "AND",
    icon: "AND",
    inputs: 2,
    outputs: 1,
    color: "violet",
  },
  {
    type: "or",
    label: "OR",
    icon: "OR",
    inputs: 2,
    outputs: 1,
    color: "sky",
  },
  {
    type: "not",
    label: "NOT",
    icon: "NOT",
    inputs: 1,
    outputs: 1,
    color: "amber",
  },
  {
    type: "nand",
    label: "NAND",
    icon: "NAND",
    inputs: 2,
    outputs: 1,
    color: "rose",
  },
  {
    type: "nor",
    label: "NOR",
    icon: "NOR",
    inputs: 2,
    outputs: 1,
    color: "orange",
  },
  {
    type: "xor",
    label: "XOR",
    icon: "XOR",
    inputs: 2,
    outputs: 1,
    color: "indigo",
  },
  {
    type: "xnor",
    label: "XNOR",
    icon: "XNOR",
    inputs: 2,
    outputs: 1,
    color: "teal",
  },
];

const gateByType = Object.fromEntries(GATES.map((g) => [g.type, g]));

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now()
    .toString(36)
    .slice(-5)}`;
}

function screenToWorld(clientX, clientY, rect, cam) {
  return {
    x: (clientX - rect.left - cam.x) / cam.z,
    y: (clientY - rect.top - cam.y) / cam.z,
  };
}
function cloneLogicState(state) {
  return {
    gates: JSON.parse(JSON.stringify(state.gates || [])),
    wires: JSON.parse(JSON.stringify(state.wires || [])),
    cam: { ...(state.cam || { x: 0, y: 0, z: 1 }) },
    selectedId: state.selectedId ?? null,
    selectedWireId: state.selectedWireId ?? null,
    mode: state.mode || "select",
  };
}
function makeGate(type, x, y) {
  const meta = gateByType[type];
  const id = uid(type);

  return {
    id,
    type,
    x,
    y,
    label:
      type === "input"
        ? `IN${Math.floor(Math.random() * 9) + 1}`
        : type === "output"
        ? `OUT${Math.floor(Math.random() * 9) + 1}`
        : meta.label,
    value: type === "input" ? false : null,
  };
}

function inputPinId(gateId, index) {
  return `${gateId}:in:${index}`;
}

function outputPinId(gateId, index = 0) {
  return `${gateId}:out:${index}`;
}

function parsePin(pinId) {
  const [gateId, side, index] = pinId.split(":");
  return { gateId, side, index: Number(index) };
}

function pinPosition(gate, side, index) {
  const meta = gateByType[gate.type];
  const count = side === "in" ? meta.inputs : meta.outputs;
  const spacing = count <= 1 ? 0 : 28;
  const start = -((count - 1) * spacing) / 2;

  return {
    x: gate.x + (side === "in" ? -72 : 72),
    y: gate.y + start + index * spacing,
  };
}

function evalGate(type, inputs, ownValue) {
  const a = Boolean(inputs[0]);
  const b = Boolean(inputs[1]);

  if (type === "input") return Boolean(ownValue);
  if (type === "output") return a;
  if (type === "and") return a && b;
  if (type === "or") return a || b;
  if (type === "not") return !a;
  if (type === "nand") return !(a && b);
  if (type === "nor") return !(a || b);
  if (type === "xor") return a !== b;
  if (type === "xnor") return a === b;

  return false;
}

function simulate(gates, wires) {
  const values = {};

  for (const gate of gates) {
    if (gate.type === "input") {
      values[outputPinId(gate.id)] = Boolean(gate.value);
    }
  }

  for (let pass = 0; pass < gates.length + 6; pass++) {
    let changed = false;

    for (const gate of gates) {
      const meta = gateByType[gate.type];

      const inputs = Array.from({ length: meta.inputs }, (_, index) => {
        const target = inputPinId(gate.id, index);
        const wire = wires.find((w) => w.to === target);
        return wire ? Boolean(values[wire.from]) : false;
      });

      const result = evalGate(gate.type, inputs, gate.value);

      if (gate.type === "output") {
        const key = inputPinId(gate.id, 0);

        if (values[key] !== result) {
          values[key] = result;
          changed = true;
        }
      }

      if (meta.outputs > 0) {
        const key = outputPinId(gate.id);

        if (values[key] !== result) {
          values[key] = result;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  return values;
}

function colorClasses(color, active = false) {
  const map = {
    cyan: active
      ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-50"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    emerald: active
      ? "border-emerald-300/45 bg-emerald-300/15 text-emerald-50"
      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    violet: active
      ? "border-violet-300/45 bg-violet-300/15 text-violet-50"
      : "border-violet-300/20 bg-violet-300/10 text-violet-100",
    sky: active
      ? "border-sky-300/45 bg-sky-300/15 text-sky-50"
      : "border-sky-300/20 bg-sky-300/10 text-sky-100",
    amber: active
      ? "border-amber-300/45 bg-amber-300/15 text-amber-50"
      : "border-amber-300/20 bg-amber-300/10 text-amber-100",
    rose: active
      ? "border-rose-300/45 bg-rose-300/15 text-rose-50"
      : "border-rose-300/20 bg-rose-300/10 text-rose-100",
    orange: active
      ? "border-orange-300/45 bg-orange-300/15 text-orange-50"
      : "border-orange-300/20 bg-orange-300/10 text-orange-100",
    indigo: active
      ? "border-indigo-300/45 bg-indigo-300/15 text-indigo-50"
      : "border-indigo-300/20 bg-indigo-300/10 text-indigo-100",
    teal: active
      ? "border-teal-300/45 bg-teal-300/15 text-teal-50"
      : "border-teal-300/20 bg-teal-300/10 text-teal-100",
  };

  return map[color] ?? map.cyan;
}

function GateShape({ type, value }) {
  const on = Boolean(value);
  const stroke = on ? "rgba(34,211,238,0.95)" : "rgba(255,255,255,0.58)";
  const fill = on ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.045)";

  if (type === "and" || type === "nand") {
    return (
      <svg viewBox="0 0 120 70" className="h-16 w-28">
        <path
          d="M20 10 H58 C84 10 101 24 101 35 C101 46 84 60 58 60 H20 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
        />

        {type === "nand" && (
          <circle
            cx="108"
            cy="35"
            r="6"
            fill="rgba(11,15,23,0.95)"
            stroke={stroke}
            strokeWidth="3"
          />
        )}

        <text
          x="55"
          y="40"
          textAnchor="middle"
          className="fill-white text-[15px] font-black"
        >
          {type.toUpperCase()}
        </text>
      </svg>
    );
  }

  if (type === "or" || type === "nor" || type === "xor" || type === "xnor") {
    return (
      <svg viewBox="0 0 130 70" className="h-16 w-28">
        {type.includes("xor") && (
          <path
            d="M12 10 C28 27 28 43 12 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        )}

        <path
          d="M20 10 C42 13 76 14 108 35 C76 56 42 57 20 60 C33 43 33 27 20 10 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
        />

        {(type === "nor" || type === "xnor") && (
          <circle
            cx="115"
            cy="35"
            r="6"
            fill="rgba(11,15,23,0.95)"
            stroke={stroke}
            strokeWidth="3"
          />
        )}

        <text
          x="62"
          y="40"
          textAnchor="middle"
          className="fill-white text-[15px] font-black"
        >
          {type.toUpperCase()}
        </text>
      </svg>
    );
  }

  if (type === "not") {
    return (
      <svg viewBox="0 0 120 70" className="h-16 w-28">
        <path
          d="M24 12 L88 35 L24 58 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
        />

        <circle
          cx="97"
          cy="35"
          r="7"
          fill="rgba(11,15,23,0.95)"
          stroke={stroke}
          strokeWidth="3"
        />

        <text
          x="52"
          y="40"
          textAnchor="middle"
          className="fill-white text-[15px] font-black"
        >
          NOT
        </text>
      </svg>
    );
  }

  if (type === "input") {
    return (
      <div
        className={[
          "grid h-16 w-28 place-items-center rounded-3xl border text-lg font-black",
          on
            ? "border-cyan-300 bg-cyan-300/20 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.18)]"
            : "border-white/15 bg-white/[0.045] text-white/65",
        ].join(" ")}
      >
        {on ? "1" : "0"}
      </div>
    );
  }

  return (
    <div
      className={[
        "grid h-16 w-28 place-items-center rounded-3xl border text-lg font-black",
        on
          ? "border-emerald-300 bg-emerald-300/20 text-emerald-100 shadow-[0_0_35px_rgba(52,211,153,0.18)]"
          : "border-white/15 bg-white/[0.045] text-white/65",
      ].join(" ")}
    >
      {on ? "HIGH" : "LOW"}
    </div>
  );
}

function Sidebar({ onAdd }) {
  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0b0f17]/88 p-4 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">
        Componente digitale
      </div>

      <div className="mt-4 grid gap-2">
        {GATES.map((gate) => (
          <button
            key={gate.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/x-logic-gate",
                JSON.stringify({ type: gate.type })
              );
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(gate.type)}
            className={`rounded-2xl border px-4 py-3 text-left transition hover:scale-[1.01] ${colorClasses(
              gate.color
            )}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-white">{gate.label}</div>
                <div className="mt-1 text-xs opacity-70">
                  {gate.inputs} intrări · {gate.outputs} ieșiri
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-1 font-mono text-xs">
                {gate.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-xs leading-6 text-cyan-50/75">
        Poți trage componentele pe canvas sau poți apăsa click pe ele. Pentru
        conexiuni, selectează <b>Wire</b>, apoi apasă pe un pin de ieșire și
        după aceea pe un pin de intrare.
      </div>
    </aside>
  );
}

function Topbar({
  mode,
  setMode,
  onClear,
  status,
  getLogicSnapshot,
  loadLogicSnapshot,
}) {
  return (
    <header className="absolute left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0b0f17]/85 backdrop-blur">
      <div className="grid grid-cols-[260px_1fr_260px] items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 shadow">
            <span className="text-xl">🧠</span>
          </div>

          <div className="leading-tight">
            <div className="text-base font-semibold text-white">
              VoltLab Logic
            </div>
            <div className="text-xs text-white/60">Laborator porți logice</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setMode("select")}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-semibold transition",
              mode === "select"
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
            ].join(" ")}
          >
            Select
          </button>

          <button
            onClick={() => setMode("wire")}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-semibold transition",
              mode === "wire"
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
            ].join(" ")}
          >
            Wire
          </button>

          <button
            onClick={onClear}
            className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15"
          >
            Clear
          </button>

          <button
            onClick={() => {
              window.location.href = "/logic-theory";
            }}
            className="rounded-xl border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/15"
          >
            Teorie logică
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
  <button
    onClick={() => {
      window.location.href = "/";
    }}
    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10"
  >
    VoltLab
  </button>

  <LogicSavePanel
    className="relative z-[70]"
    getSnapshot={getLogicSnapshot}
    loadSnapshot={loadLogicSnapshot}
  />

  <AuthPanel className="relative z-[80]" />
</div>
      </div>

      <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold text-white/55 backdrop-blur">
        {status}
      </div>
    </header>
  );
}

function Canvas({
  gates,
  wires,
  values,
  mode,
  selectedId,
  setSelectedId,
  selectedWireId,
setSelectedWireId,
  onMove,
  onPinClick,
  activePin,
  
  onToggleInput,
  onDeleteWire,
  onDropGate,
  cam,
  setCam,
}) {
  const panRef = useRef(null);

  return (
    <div
      className="relative h-full flex-1 overflow-hidden bg-[#0b0f17]"
      onWheel={(e) => {
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const before = screenToWorld(e.clientX, e.clientY, rect, cam);

        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const nextZ = Math.max(0.35, Math.min(2.7, cam.z * factor));

        const nextX = e.clientX - rect.left - before.x * nextZ;
        const nextY = e.clientY - rect.top - before.y * nextZ;

        setCam({ x: nextX, y: nextY, z: nextZ });
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;

        panRef.current = {
          sx: e.clientX,
          sy: e.clientY,
          startX: cam.x,
          startY: cam.y,
        };

        setSelectedId(null);
        setSelectedWireId(null);
      }}
      onMouseMove={(e) => {
        if (!panRef.current) return;

        const p = panRef.current;

        setCam((old) => ({
          ...old,
          x: p.startX + e.clientX - p.sx,
          y: p.startY + e.clientY - p.sy,
        }));
      }}
      onMouseUp={() => {
        panRef.current = null;
      }}
      onMouseLeave={() => {
        panRef.current = null;
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();

        const raw = e.dataTransfer.getData("application/x-logic-gate");
        if (!raw) return;

        try {
          const payload = JSON.parse(raw);
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = screenToWorld(e.clientX, e.clientY, rect, cam);

          onDropGate(payload.type, pos);
        } catch {
          // ignore invalid payload
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.42]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: `${32 * cam.z}px ${32 * cam.z}px`,
            backgroundPosition: `${cam.x}px ${cam.y}px`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full origin-top-left"
        style={{
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`,
        }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width="4000"
          height="3000"
        >
          {wires.map((wire) => {
            const from = parsePin(wire.from);
            const to = parsePin(wire.to);
            const aGate = gates.find((g) => g.id === from.gateId);
            const bGate = gates.find((g) => g.id === to.gateId);

            if (!aGate || !bGate) return null;

            const a = pinPosition(aGate, "out", from.index);
            const b = pinPosition(bGate, "in", to.index);
            const mid = (a.x + b.x) / 2;
            const on = Boolean(values[wire.from]);
            const selectedWire = selectedWireId === wire.id;

            return (
              <g key={wire.id}>
                <path
                  d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
                  fill="none"
                 stroke={
  selectedWire
    ? "rgba(250,204,21,0.95)"
    : on
    ? "rgba(34,211,238,0.95)"
    : "rgba(255,255,255,0.26)"
}
                  strokeWidth={selectedWire ? "8" : "5"}
                  strokeLinecap="round"
                />

               <path
  d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
  fill="none"
  stroke="transparent"
  strokeWidth="18"
  strokeLinecap="round"
  className="pointer-events-auto cursor-pointer"
  onMouseDown={(e) => {
    e.stopPropagation();
  }}
  onClick={(e) => {
    e.stopPropagation();
    setSelectedWireId(wire.id);
    setSelectedId(null);
    setActivePin(null);
  }}
  onDoubleClick={(e) => {
    e.stopPropagation();
    onDeleteWire(wire.id);
    setSelectedWireId(null);
  }}
/>
              </g>
            );
          })}
        </svg>

        {gates.map((gate) => {
          const meta = gateByType[gate.type];
          const selected = selectedId === gate.id;
          const outputValue =
            values[outputPinId(gate.id)] ??
            values[inputPinId(gate.id, 0)] ??
            false;

          return (
            <div
              key={gate.id}
              onMouseDown={(e) => {
                if (e.target.closest("[data-pin]")) return;

                e.stopPropagation();
                setSelectedId(gate.id);
                setSelectedWireId(null);
                const startX = e.clientX;
                const startY = e.clientY;
                const original = { x: gate.x, y: gate.y };

                function move(ev) {
                  onMove(gate.id, {
                    x: original.x + (ev.clientX - startX) / cam.z,
                    y: original.y + (ev.clientY - startY) / cam.z,
                  });
                }

                function up() {
                  window.removeEventListener("mousemove", move);
                  window.removeEventListener("mouseup", up);
                }

                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
              }}
              className={[
                "pointer-events-auto absolute z-10 select-none",
                selected ? "drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]" : "",
              ].join(" ")}
              style={{ left: gate.x - 72, top: gate.y - 48 }}
            >
              <div
                className={[
                  "rounded-[26px] border bg-black/30 p-3 backdrop-blur",
                  selected ? "border-cyan-300/45" : "border-white/10",
                ].join(" ")}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (gate.type === "input") {
                      onToggleInput(gate.id);
                    }
                  }}
                  className={
                    gate.type === "input"
                      ? "cursor-pointer"
                      : "cursor-grab active:cursor-grabbing"
                  }
                >
                  <GateShape type={gate.type} value={outputValue} />
                </button>

                <div className="mt-1 text-center text-xs font-bold text-white/70">
                  {gate.label}
                </div>
              </div>

              {Array.from({ length: meta.inputs }).map((_, index) => {
                const p = pinPosition(gate, "in", index);
                const id = inputPinId(gate.id, index);
                const active = activePin === id;

                return (
                  <button
                    key={id}
                    data-pin
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick(id);
                    }}
                    className={[
                      "absolute grid h-5 w-5 place-items-center rounded-full border",
                      active
                        ? "border-cyan-200 bg-cyan-300"
                        : "border-white/25 bg-[#0b0f17] hover:bg-cyan-300/70",
                    ].join(" ")}
                    style={{
                      left: p.x - gate.x + 72 - 10,
                      top: p.y - gate.y + 48 - 10,
                    }}
                    title={`input ${index + 1}`}
                  />
                );
              })}

              {Array.from({ length: meta.outputs }).map((_, index) => {
                const p = pinPosition(gate, "out", index);
                const id = outputPinId(gate.id, index);
                const active = activePin === id;
                const on = Boolean(values[id]);

                return (
                  <button
                    key={id}
                    data-pin
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick(id);
                    }}
                    className={[
                      "absolute grid h-5 w-5 place-items-center rounded-full border",
                      active
                        ? "border-cyan-200 bg-cyan-300"
                        : on
                        ? "border-cyan-200 bg-cyan-300"
                        : "border-white/25 bg-[#0b0f17] hover:bg-cyan-300/70",
                    ].join(" ")}
                    style={{
                      left: p.x - gate.x + 72 - 10,
                      top: p.y - gate.y + 48 - 10,
                    }}
                    title="output"
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs text-white/55 backdrop-blur">
        Scroll = zoom · ține apăsat pe fundal = mută masa · dublu click pe fir =
        șterge firul
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-bold text-white/55 backdrop-blur">
        Zoom: {Math.round(cam.z * 100)}%
      </div>
    </div>
  );
}

function Inspector({
  selected,
  values,
  updateGate,
  gates,
  wires,
  onDeleteSelected,
}) {
  const inputs = gates.filter((g) => g.type === "input");
  const outputs = gates.filter((g) => g.type === "output");

  return (
    <aside className="w-80 shrink-0 border-l border-white/10 bg-[#0b0f17]/88 p-4 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">
        Input / Output
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4">
        <div className="text-sm font-black text-cyan-100">Intrări</div>

        <div className="mt-3 grid gap-2">
          {inputs.length === 0 && (
            <div className="text-xs text-white/45">
              Adaugă un Input din stânga.
            </div>
          )}

          {inputs.map((gate) => (
            <button
              key={gate.id}
              onClick={() => updateGate(gate.id, { value: !gate.value })}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold",
                gate.value
                  ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 bg-black/20 text-white/60",
              ].join(" ")}
            >
              <span>{gate.label}</span>
              <span>{gate.value ? "1" : "0"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
        <div className="text-sm font-black text-emerald-100">Ieșiri</div>

        <div className="mt-3 grid gap-2">
          {outputs.length === 0 && (
            <div className="text-xs text-white/45">
              Adaugă un Output din stânga.
            </div>
          )}

          {outputs.map((gate) => {
            const value = Boolean(values[inputPinId(gate.id, 0)]);

            return (
              <div
                key={gate.id}
                className={[
                  "flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold",
                  value
                    ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100"
                    : "border-white/10 bg-black/20 text-white/60",
                ].join(" ")}
              >
                <span>{gate.label}</span>
                <span>{value ? "HIGH / 1" : "LOW / 0"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <div className="text-sm font-black text-white">Inspector</div>

        {!selected ? (
          <p className="mt-2 text-xs leading-6 text-white/50">
            Selectează o poartă ca să îi modifici numele sau valoarea.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-xs text-white/50">
              Nume componentă
              <input
                value={selected.label}
                onChange={(e) =>
                  updateGate(selected.id, { label: e.target.value })
                }
                className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300/35"
              />
            </label>

            {selected.type === "input" && (
              <button
                onClick={() =>
                  updateGate(selected.id, { value: !selected.value })
                }
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-bold transition",
                  selected.value
                    ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-black/20 text-white/60",
                ].join(" ")}
              >
                Valoare: {selected.value ? "1" : "0"}
              </button>
            )}

            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-6 text-white/55">
              Tip:{" "}
              <b className="text-white/80">
                {gateByType[selected.type].label}
              </b>
              <br />
              Fire:{" "}
              <b className="text-white/80">
                {
                  wires.filter(
                    (w) =>
                      w.from.includes(selected.id) || w.to.includes(selected.id)
                  ).length
                }
              </b>
            </div>

            <button
              onClick={onDeleteSelected}
              className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm font-bold text-rose-100 hover:bg-rose-300/15"
            >
              Șterge componenta
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

const STARTER = [
  { ...makeGate("input", 220, 190), id: "inA", label: "A", value: false },
  { ...makeGate("input", 220, 330), id: "inB", label: "B", value: false },
  { ...makeGate("and", 500, 260), id: "and1", label: "AND" },
  { ...makeGate("output", 790, 260), id: "out1", label: "Rezultat" },
];

const STARTER_WIRES = [
  { id: "w1", from: outputPinId("inA"), to: inputPinId("and1", 0) },
  { id: "w2", from: outputPinId("inB"), to: inputPinId("and1", 1) },
  { id: "w3", from: outputPinId("and1"), to: inputPinId("out1", 0) },
];

export default function LogicLabPage() {
  const [mode, setMode] = useState("select");
  const [gates, setGates] = useState(STARTER);
  const [wires, setWires] = useState(STARTER_WIRES);
  const [selectedId, setSelectedId] = useState("and1");
  const [activePin, setActivePin] = useState(null);
  const [selectedWireId, setSelectedWireId] = useState(null);

  const [cam, setCam] = useState({ x: 0, y: 0, z: 1 });
  const [historyPast, setHistoryPast] = useState([]);
const [historyFuture, setHistoryFuture] = useState([]);
const historyLockRef = useRef(false);

  const values = useMemo(() => simulate(gates, wires), [gates, wires]);
  const selected = gates.find((g) => g.id === selectedId) ?? null;

function addGate(type, position = null) {
  pushHistory();

  const count = gates.length;

  const gate = makeGate(
    type,
    position?.x ?? 260 + (count % 3) * 190,
    position?.y ?? 180 + Math.floor(count / 3) * 130
  );

  setGates((old) => [...old, gate]);
  setSelectedId(gate.id);
  setSelectedWireId(null);
}

function updateGate(id, patch) {
  pushHistory();

  setGates((old) => old.map((g) => (g.id === id ? { ...g, ...patch } : g)));
}
function deleteSelectedGate() {
  if (!selectedId) return;

  pushHistory();

  setGates((old) => old.filter((g) => g.id !== selectedId));
  setWires((old) =>
    old.filter(
      (w) => !w.from.includes(selectedId) && !w.to.includes(selectedId)
    )
  );
  setSelectedId(null);
  setSelectedWireId(null);
  setActivePin(null);
}
function deleteSelected() {
  if (selectedWireId) {
    pushHistory();

    setWires((old) => old.filter((w) => w.id !== selectedWireId));
    setSelectedWireId(null);
    setActivePin(null);
    return;
  }

  if (selectedId) {
    deleteSelectedGate();
  }
}

  function onPinClick(pinId) {
    const pin = parsePin(pinId);
setSelectedWireId(null);
    if (mode !== "wire") {
      setSelectedId(pin.gateId);
      return;
    }

    if (!activePin) {
      if (pin.side !== "out") return;

      setActivePin(pinId);
      return;
    }

    const start = parsePin(activePin);

    if (
      start.side !== "out" ||
      pin.side !== "in" ||
      start.gateId === pin.gateId
    ) {
      setActivePin(null);
      return;
    }

 pushHistory();

setWires((old) => [
  ...old.filter((w) => w.to !== pinId),
  { id: uid("wire"), from: activePin, to: pinId },
]);

    setActivePin(null);
  }

 function clearLab() {
  pushHistory();

  setGates([]);
  setWires([]);
  setSelectedId(null);
  setSelectedWireId(null);
  setActivePin(null);
}

function loadStarter() {
  pushHistory();

  setGates(STARTER);
  setWires(STARTER_WIRES);
  setSelectedId("and1");
  setSelectedWireId(null);
  setActivePin(null);
  setCam({ x: 0, y: 0, z: 1 });
  setMode("select");
}

function getLogicSnapshot() {
  return {
    gates,
    wires,
    selectedId,
    selectedWireId: null,
    activePin: null,
    cam,
    mode: "select",
  };
}

function loadLogicSnapshot(snapshot) {
  pushHistory();

  setGates(snapshot.gates || []);
  setWires(snapshot.wires || []);
  setSelectedId(snapshot.selectedId ?? null);
  setSelectedWireId(null);
  setActivePin(null);
  setCam(snapshot.cam || { x: 0, y: 0, z: 1 });
  setMode(snapshot.mode || "select");
}
  const status =
    mode === "wire"
      ? activePin
        ? "Alege pinul de intrare"
        : "Alege pinul de ieșire"
      : "Live simulation";

useEffect(() => {
  function handleKeyDown(e) {
    if (e.key !== "Delete" && e.key !== "Backspace") return;

    const tag = e.target?.tagName?.toLowerCase();
    const isTyping =
      tag === "input" ||
      tag === "textarea" ||
      e.target?.isContentEditable;

    if (isTyping) return;

    e.preventDefault();
    deleteSelected();
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedId, selectedWireId, wires]);





function getCurrentLogicState() {
  return {
    gates,
    wires,
    cam,
    selectedId,
    selectedWireId,
    mode,
  };
}

function pushHistory() {
  if (historyLockRef.current) return;

  const snapshot = cloneLogicState(getCurrentLogicState());

  setHistoryPast((old) => {
    const next = [...old, snapshot];
    return next.slice(-80);
  });

  setHistoryFuture([]);
}

function restoreLogicState(snapshot) {
  historyLockRef.current = true;

  setGates(snapshot.gates || []);
  setWires(snapshot.wires || []);
  setCam(snapshot.cam || { x: 0, y: 0, z: 1 });
  setSelectedId(snapshot.selectedId ?? null);
  setSelectedWireId(snapshot.selectedWireId ?? null);
  setMode(snapshot.mode || "select");
  setActivePin(null);

  setTimeout(() => {
    historyLockRef.current = false;
  }, 0);
}

function undo() {
  setHistoryPast((past) => {
    if (past.length === 0) return past;

    const previous = past[past.length - 1];
    const remaining = past.slice(0, -1);
    const current = cloneLogicState(getCurrentLogicState());

    setHistoryFuture((future) => [current, ...future].slice(0, 80));
    restoreLogicState(previous);

    return remaining;
  });
}

function redo() {
  setHistoryFuture((future) => {
    if (future.length === 0) return future;

    const next = future[0];
    const remaining = future.slice(1);
    const current = cloneLogicState(getCurrentLogicState());

    setHistoryPast((past) => [...past, current].slice(-80));
    restoreLogicState(next);

    return remaining;
  });
}useEffect(() => {
  function handleKeyDown(e) {
    const tag = e.target?.tagName?.toLowerCase();
    const isTyping =
      tag === "input" ||
      tag === "textarea" ||
      e.target?.isContentEditable;

    if (isTyping) return;

    const key = e.key.toLowerCase();

    if (e.ctrlKey && key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    if ((e.ctrlKey && key === "y") || (e.ctrlKey && e.shiftKey && key === "z")) {
      e.preventDefault();
      redo();
      return;
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [historyPast, historyFuture, gates, wires, cam, selectedId, selectedWireId, mode]);









  return (
    <div className="h-screen overflow-hidden bg-[#0b0f17] text-white">
      <Topbar
  mode={mode}
  setMode={(m) => {
    setMode(m);
    setActivePin(null);
  }}
  onClear={clearLab}
  status={status}
  getLogicSnapshot={getLogicSnapshot}
  loadLogicSnapshot={loadLogicSnapshot}
/>
    
      <div className="flex h-full pt-[73px]">
        <Sidebar onAdd={addGate} />

        <Canvas
          gates={gates}
          wires={wires}
          values={values}
          mode={mode}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onMove={updateGate}
            selectedWireId={selectedWireId}
  setSelectedWireId={setSelectedWireId}
          onPinClick={onPinClick}
          activePin={activePin}
          onToggleInput={(id) =>
            updateGate(id, {
              value: !gates.find((g) => g.id === id)?.value,
            })
          }
   onDeleteWire={(id) => {
  pushHistory();
  setWires((old) => old.filter((w) => w.id !== id));
  setSelectedWireId(null);
}}
          onDropGate={addGate}
          cam={cam}
          setCam={setCam}
        />

        <Inspector
          selected={selected}
          values={values}
          updateGate={updateGate}
          gates={gates}
          wires={wires}
          onDeleteSelected={deleteSelectedGate}
        />
      </div>

    
    </div>
  );
}