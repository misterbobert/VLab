import React, { useMemo, useState } from "react";

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nearly(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.0001;
}

function wireKey(a, b) {
  return [a, b].sort().join("__");
}

function hasWire(wires, a, b) {
  return wires.some((w) => wireKey(w.a, w.b) === wireKey(a, b));
}

function formatPct(value) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

const THEORY_TASKS = [
  {
    id: "ohm-formula",
    kind: "quiz",
    difficulty: "Bază",
    title: "Legea lui Ohm",
    prompt: "Care este forma corectă a legii lui Ohm?",
    options: ["U = R · I", "P = U / I", "R = U · I", "I = R / U"],
    correct: 0,
    explain: "Legea lui Ohm leagă tensiunea, curentul și rezistența: U = R · I.",
  },
  {
    id: "power-formula",
    kind: "quiz",
    difficulty: "Bază",
    title: "Puterea electrică",
    prompt: "Ce formulă exprimă puterea electrică într-un circuit DC?",
    options: ["P = U · I", "P = R / U", "P = I / U", "P = U + I"],
    correct: 0,
    explain: "Puterea arată cât de repede se consumă energia: P = U · I.",
  },
  {
    id: "voltmeter-position",
    kind: "quiz",
    difficulty: "Măsurători",
    title: "Conectarea voltmetrului",
    prompt: "Cum se conectează voltmetrul pentru a măsura tensiunea pe un bec?",
    options: ["În paralel cu becul", "În serie cu becul", "Direct peste baterie, mereu", "În locul becului"],
    correct: 0,
    explain: "Voltmetrul măsoară diferența de potențial între două puncte, deci se conectează în paralel.",
  },
  {
    id: "ammeter-position",
    kind: "quiz",
    difficulty: "Măsurători",
    title: "Conectarea ampermetrului",
    prompt: "Cum se conectează ampermetrul pentru a măsura curentul printr-un bec?",
    options: ["În serie cu becul", "În paralel cu becul", "Doar la bornele bateriei", "Nu contează"],
    correct: 0,
    explain: "Ampermetrul trebuie pus în serie, astfel încât același curent să treacă prin el.",
  },
  {
    id: "diode-direction",
    kind: "quiz",
    difficulty: "Semiconductori",
    title: "Sensul diodei",
    prompt: "Ce se întâmplă cu o diodă polarizată invers într-un circuit simplu?",
    options: ["Blochează curentul", "Devine baterie", "Scade rezistența la zero", "Măsoară tensiunea"],
    correct: 0,
    explain: "În modelul didactic, dioda conduce într-un singur sens și blochează curentul când este inversată.",
  },
  {
    id: "npn-switch",
    kind: "quiz",
    difficulty: "Tranzistori",
    title: "Tranzistor NPN",
    prompt: "Într-un NPN folosit ca switch, ce terminal controlează trecerea curentului C-E?",
    options: ["Baza", "Colectorul", "Emitorul", "Firul de masă"],
    correct: 0,
    explain: "Baza controlează curentul dintre colector și emitor.",
  },
  {
    id: "series-resistors",
    kind: "quiz",
    difficulty: "Rezistori",
    title: "Rezistori în serie",
    prompt: "Doi rezistori de 100Ω și 220Ω sunt legați în serie. Ce rezistență echivalentă au?",
    options: ["320Ω", "68.75Ω", "120Ω", "22000Ω"],
    correct: 0,
    explain: "În serie, rezistențele se adună: 100Ω + 220Ω = 320Ω.",
  },
  {
    id: "short-circuit",
    kind: "quiz",
    difficulty: "Siguranță",
    title: "Scurtcircuit",
    prompt: "Ce este greșit la legarea directă a plusului bateriei cu minusul printr-un fir?",
    options: ["Curentul poate deveni foarte mare", "Bateria se încarcă instant", "Tensiunea devine mereu zero peste tot", "Becul luminează mai eficient"],
    correct: 0,
    explain: "Un fir ideal are rezistență foarte mică, deci curentul poate crește periculos.",
  },
];

const LAB_TASKS = [
  {
    id: "lab-light-circuit",
    kind: "lab",
    labType: "lightCircuit",
    difficulty: "Laborator",
    title: "Aprinde becul",
    prompt: "Leagă bateria și becul astfel încât circuitul să fie închis și becul să lumineze.",
    facts: [
      "Baterie: U = 9V",
      "Bec: Rbec = 36Ω",
      "Circuit închis = două fire: dus și întors",
      "Țintă: becul trebuie să primească alimentare pe ambele borne",
    ],
    explain: "Ai nevoie de două legături: plusul bateriei spre un capăt al becului și celălalt capăt înapoi la minus.",
  },
  {
    id: "lab-voltmeter",
    kind: "lab",
    labType: "voltmeterParallel",
    difficulty: "Laborator",
    title: "Măsoară tensiunea pe bec",
    prompt: "Conectează voltmetrul în paralel cu becul, fără să întrerupi circuitul principal.",
    facts: [
      "Baterie: U = 9V",
      "Bec: Rbec = 36Ω",
      "Circuitul principal este deja închis",
      "Voltmetrul se pune pe cele două borne ale becului",
    ],
    explain: "Voltmetrul se pune pe cele două borne ale becului, nu pe traseul serie.",
  },
  {
    id: "lab-resistor-target",
    kind: "lab",
    labType: "resistorTarget",
    difficulty: "Workshop",
    title: "Reglează luminozitatea",
    prompt: "Modifică rezistența serie astfel încât becul să ajungă la cel puțin 90% luminozitate. Folosește datele de mai jos, nu ghici.",
    facts: [
      "Baterie: U = 9V",
      "Bec: Rbec = 36Ω",
      "Rezistență reglabilă: Rserie = 0Ω ... 500Ω",
      "Model luminos: procent ≈ Rbec / (Rbec + Rserie)",
      "Țintă: procent ≥ 90%",
      "Rezultă: Rserie ≤ 4Ω, deci setează aproape de 0Ω",
    ],
    explain: "O rezistență serie mare limitează curentul. Cu Rbec = 36Ω, pentru minim 90% trebuie Rserie foarte mică: Rserie ≤ 4Ω.",
  },
  {
    id: "lab-diode",
    kind: "lab",
    labType: "diodeDirection",
    difficulty: "Semiconductori",
    title: "Dioda corect orientată",
    prompt: "Schimbă orientarea diodei astfel încât LED-ul/becul să primească curent.",
    facts: [
      "Baterie: U = 9V",
      "Rezistor de protecție: 220Ω",
      "Dioda conduce doar în polarizare directă",
      "Dacă este inversată, curentul este blocat și becul rămâne stins",
    ],
    explain: "Dioda trebuie polarizată direct ca să conducă.",
  },
  {
    id: "lab-transistor-pot",
    kind: "lab",
    labType: "transistorPot",
    difficulty: "Tranzistori",
    title: "Controlează un bec cu NPN",
    prompt: "Reglează potențiometrul astfel încât tranzistorul NPN să pornească becul controlat, fără să fie complet saturat.",
    facts: [
      "Baterie: U = 9V",
      "Tranzistor: NPN folosit ca switch controlat",
      "Baza B primește semnal prin potențiometru",
      "Sub 25%: becul este aproape stins",
      "Zona corectă: 35% ... 75%",
      "Peste 80%: tranzistorul intră prea aproape de saturație",
    ],
    explain: "Potențiometrul controlează curentul de bază. Când baza primește suficient semnal, C-E conduce.",
  },
];

const DEBUG_TASKS = [
  {
    id: "debug-voltmeter-series",
    kind: "debug",
    difficulty: "DEBUG",
    title: "Bec stins, deși există baterie",
    prompt: "Circuitul pare închis, dar becul nu se aprinde. Găsește problema.",
    facts: [
      "Baterie: U = 9V",
      "Bec: Rbec = 36Ω",
      "Voltmetrul are rezistență internă foarte mare",
      "Caută aparatul pus pe traseul curentului, nu în paralel",
    ],
    debugType: "voltmeterSeries",
    options: ["Voltmetrul este pus în serie", "Rezistorul are valoare prea mică", "Dioda este polarizată direct", "Bateria are tensiune prea mare"],
    correct: 0,
    explain: "Voltmetrul are rezistență foarte mare și nu se pune în serie cu becul. El blochează aproape complet curentul.",
  },
  {
    id: "debug-ammeter-parallel",
    kind: "debug",
    difficulty: "DEBUG",
    title: "Curent suspect de mare",
    prompt: "Circuitul pornește, dar apare risc de scurtcircuit. Ce observi greșit?",
    facts: [
      "Baterie: U = 9V",
      "Bec: Rbec = 36Ω",
      "Ampermetrul are rezistență internă foarte mică",
      "Caută aparatul pus direct peste bornele becului",
    ],
    debugType: "ammeterParallel",
    options: ["Ampermetrul este pus în paralel cu becul", "Becul este pus în serie", "Voltmetrul lipsește", "Rezistorul este prea mare"],
    correct: 0,
    explain: "Ampermetrul are rezistență foarte mică și trebuie pus în serie, nu în paralel.",
  },
  {
    id: "debug-diode-reversed",
    kind: "debug",
    difficulty: "DEBUG",
    title: "Dioda nu lasă circuitul să meargă",
    prompt: "Circuitul are baterie, rezistor și bec, dar curentul este blocat. De ce?",
    facts: [
      "Baterie: U = 9V",
      "Rezistor: R = 220Ω",
      "Becul este în serie cu dioda",
      "Dioda conduce într-un singur sens",
    ],
    debugType: "diodeReversed",
    options: ["Dioda este inversată", "Bateria nu are rezistență internă", "Becul este în paralel", "Circuitul are prea multe fire"],
    correct: 0,
    explain: "Dioda inversată blochează curentul, deci becul nu mai primește energie.",
  },
  {
    id: "debug-npn-emitter",
    kind: "debug",
    difficulty: "DEBUG",
    title: "NPN legat ciudat",
    prompt: "Baza primește semnal, dar becul nu se comportă corect. Ce este greșit?",
    facts: [
      "Baterie: U = 9V",
      "Rezistor bază: 1kΩ",
      "La un NPN simplu, emitorul E merge de obicei spre minus",
      "Sarcina, adică becul, stă pe colector C",
    ],
    debugType: "npnEmitterWrong",
    options: ["Emitorul NPN nu este dus spre minus", "Baza trebuie legată direct la plus fără rezistor", "Colectorul trebuie la minus mereu", "Becul trebuie scos din circuit"],
    correct: 0,
    explain: "Într-un switch NPN simplu, emitorul se leagă de obicei spre minus, iar sarcina stă pe colector.",
  },
  {
    id: "debug-capacitor-overvoltage",
    kind: "debug",
    difficulty: "DEBUG",
    title: "Condensator în pericol",
    prompt: "Circuitul funcționează aparent, dar o componentă este folosită peste limita ei. Care este problema?",
    facts: [
      "Baterie: U = 9V",
      "Condensator: Vmax = 3V",
      "Becul este doar consumator în circuit",
      "Întreabă-te ce componentă primește tensiune peste limita admisă",
    ],
    debugType: "capacitorOvervoltage",
    options: ["Condensatorul are Vmax prea mic", "Becul este prea departe", "Voltmetrul este în paralel", "Bateria este orientată corect"],
    correct: 0,
    explain: "Dacă bateria are 9V și condensatorul suportă doar 3V, acesta este supratensionat.",
  },
  {
    id: "debug-pot-base",
    kind: "debug",
    difficulty: "DEBUG",
    title: "Tranzistor pornit brutal",
    prompt: "Becul sare aproape instant la maxim și controlul fin dispare. Ce trebuie investigat?",
    facts: [
      "Baterie: U = 9V",
      "Tranzistor: NPN",
      "Potențiometrul controlează baza B",
      "Dacă baza primește prea mult curent, C-E conduce aproape complet",
    ],
    debugType: "potBaseTooLow",
    options: ["Potențiometrul lasă prea mult curent în bază", "Becul are două borne", "Bateria este prea departe", "Dioda lipsește din circuit"],
    correct: 0,
    explain: "Dacă rezistența de bază este prea mică, NPN-ul intră rapid în saturație și nu mai vezi reglaj fin.",
  },
];

const TASK_BANK = [...THEORY_TASKS, ...LAB_TASKS, ...DEBUG_TASKS];

function Badge({ children, tone = "cyan" }) {
  const classes = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${classes[tone] || classes.cyan}`}>
      {children}
    </span>
  );
}

function OptionButton({ active, correct, wrong, children, onClick }) {
  let cls = "border-white/10 bg-black/20 text-white/70 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-50";
  if (active) cls = "border-cyan-300/40 bg-cyan-300/15 text-cyan-50";
  if (correct) cls = "border-emerald-300/45 bg-emerald-300/15 text-emerald-50";
  if (wrong) cls = "border-rose-300/45 bg-rose-300/15 text-rose-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${cls}`}
    >
      {children}
    </button>
  );
}

function FactsBox({ facts }) {
  if (!facts || facts.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
      <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-amber-100/75">
        Date cunoscute / pentru calcul
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold leading-6 text-white/75"
          >
            {fact}
          </div>
        ))}
      </div>
    </div>
  );
}

function useWireLab(initialWires = []) {
  const [wires, setWires] = useState(initialWires);
  const [selected, setSelected] = useState(null);

  function clickNode(nodeId) {
    if (!selected) {
      setSelected(nodeId);
      return;
    }

    if (selected === nodeId) {
      setSelected(null);
      return;
    }

    const key = wireKey(selected, nodeId);
    setWires((old) => {
      if (old.some((w) => wireKey(w.a, w.b) === key)) return old;
      return [...old, { a: selected, b: nodeId }];
    });
    setSelected(null);
  }

  function clear() {
    setWires(initialWires);
    setSelected(null);
  }

  return { wires, selected, clickNode, clear };
}

function componentNodePositions(components) {
  const nodes = {};
  for (const c of components) {
    if (c.type === "battery") {
      nodes[`${c.id}.plus`] = { x: c.x + 40, y: c.y };
      nodes[`${c.id}.minus`] = { x: c.x - 40, y: c.y };
    } else if (c.type === "transistor") {
      nodes[`${c.id}.B`] = { x: c.x - 52, y: c.y };
      nodes[`${c.id}.C`] = { x: c.x + 42, y: c.y - 44 };
      nodes[`${c.id}.E`] = { x: c.x + 42, y: c.y + 44 };
    } else {
      nodes[`${c.id}.a`] = { x: c.x - 45, y: c.y };
      nodes[`${c.id}.b`] = { x: c.x + 45, y: c.y };
    }
  }
  return nodes;
}


function wirePath(a, b, wire = {}, idx = 0) {
  const pts = [a, ...(wire.points || wire.via || []), b];
  if (pts.length > 2) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const sameRow = Math.abs(dy) < 5;
  const sameCol = Math.abs(dx) < 5;

  if (sameRow) {
    const longOrReturn = dx < 0 || Math.abs(dx) > 260;
    if (longOrReturn) {
      const lane = a.y >= 165 ? 302 - (idx % 3) * 18 : 48 + (idx % 3) * 18;
      return `M ${a.x} ${a.y} L ${a.x} ${lane} L ${b.x} ${lane} L ${b.x} ${b.y}`;
    }

    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  if (sameCol) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  const preferredX = wire.elbowX ?? Math.round((a.x + b.x) / 2);
  return `M ${a.x} ${a.y} L ${preferredX} ${a.y} L ${preferredX} ${b.y} L ${b.x} ${b.y}`;
}

function MiniSchematicCanvas({ components, wires, selectedNode, onNodeClick, glow = {}, note }) {
  const nodes = componentNodePositions(components);

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#07111d] shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
      <svg viewBox="0 0 760 340" className="h-[260px] w-full">
        <defs>
          <pattern id="test-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
          </pattern>
          <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="760" height="340" fill="url(#test-grid)" />
        <rect width="760" height="340" fill="rgba(34,211,238,0.025)" />

        {wires.map((w, idx) => {
          const a = nodes[w.a];
          const b = nodes[w.b];
          if (!a || !b) return null;
          const path = wirePath(a, b, w, idx);
          return <path key={`${w.a}-${w.b}-${idx}`} d={path} fill="none" stroke="rgba(125,211,252,0.88)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />;
        })}

        {components.map((c) => (
          <MiniComponent key={c.id} component={c} glow={glow[c.id]} />
        ))}

        {Object.entries(nodes).map(([id, p]) => {
          const active = selectedNode === id;
          return (
            <g key={id} onClick={() => onNodeClick?.(id)} className={onNodeClick ? "cursor-pointer" : ""}>
              <circle cx={p.x} cy={p.y} r={active ? 10 : 8} fill={active ? "#22d3ee" : "#0b1220"} stroke={active ? "#a5f3fc" : "rgba(255,255,255,0.75)"} strokeWidth="3" />
              <text x={p.x} y={p.y - 13} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontWeight="700">
                {id.split(".").at(-1)}
              </text>
            </g>
          );
        })}

        {note && (
          <text x="24" y="318" fill="rgba(255,255,255,0.55)" fontSize="13" fontWeight="700">
            {note}
          </text>
        )}
      </svg>
    </div>
  );
}

function MiniComponent({ component, glow }) {
  const c = component;
  const stroke = "rgba(255,255,255,0.9)";
  const muted = "rgba(255,255,255,0.62)";
  const cyan = "#22d3ee";

  if (c.type === "battery") {
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <path d="M-88 0H-42" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-25 -28V28" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        <path d="M22 -42V42" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        <text x="-28" y="-36" fill={muted} fontSize="15" fontWeight="900">−</text>
        <text x="19" y="-50" fill={muted} fontSize="15" fontWeight="900">+</text>
        <text x="0" y="74" textAnchor="middle" fill={cyan} fontSize="14" fontWeight="900">9V</text>
      </g>
    );
  }

  if (c.type === "bulb") {
    const intensity = Math.max(0, Math.min(1, Number(glow ?? 0)));
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <path d="M-88 0H-34" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M34 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        {intensity > 0.02 && <circle cx="0" cy="0" r={32 + intensity * 20} fill={`rgba(250,204,21,${0.10 + intensity * 0.25})`} filter="url(#soft-glow)" />}
        <circle cx="0" cy="0" r="34" fill="rgba(255,255,255,0.025)" stroke={stroke} strokeWidth="4" />
        <path d="M-19 -19L19 19M19 -19L-19 19" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <text x="0" y="68" textAnchor="middle" fill={intensity > 0.02 ? "#fde68a" : muted} fontSize="14" fontWeight="900">Bec {formatPct(intensity)}</text>
      </g>
    );
  }

  if (c.type === "resistor" || c.type === "potentiometer") {
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <path d="M-88 0H-45" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M45 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <rect x="-45" y="-18" width="90" height="36" rx="5" fill="rgba(255,255,255,0.025)" stroke={stroke} strokeWidth="4" />
        {c.type === "potentiometer" && <path d="M-6 42L28 -28M28 -28L18 -24M28 -28L24 -16" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
        <text x="0" y="70" textAnchor="middle" fill={c.type === "potentiometer" ? "#fbbf24" : cyan} fontSize="14" fontWeight="900">{c.label || (c.type === "potentiometer" ? "POT" : "R")}</text>
      </g>
    );
  }

  if (c.type === "voltmeter" || c.type === "ammeter") {
    const symbol = c.type === "voltmeter" ? "V" : "A";
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <path d="M-88 0H-39" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M39 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="0" cy="0" r="38" fill="rgba(255,255,255,0.025)" stroke={stroke} strokeWidth="4" />
        <text x="0" y="11" textAnchor="middle" fill={stroke} fontSize="31" fontWeight="900">{symbol}</text>
      </g>
    );
  }

  if (c.type === "diode") {
    return (
      <g transform={`translate(${c.x} ${c.y}) scale(${c.forward === false ? -1 : 1} 1)`}>
        <path d="M-88 0H-38" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M36 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-34 -31L25 0L-34 31Z" fill="rgba(34,211,238,0.12)" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
        <path d="M31 -34V34" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <text x="0" y="72" textAnchor="middle" fill={c.forward === false ? "#fb7185" : "#67e8f9"} fontSize="14" fontWeight="900" transform={`scale(${c.forward === false ? -1 : 1} 1)`}>Diodă</text>
      </g>
    );
  }

  if (c.type === "transistor") {
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <circle cx="0" cy="0" r="48" fill="rgba(255,255,255,0.025)" stroke={stroke} strokeWidth="4" />
        <path d="M-88 0H-18" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-18 -36V36" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-18 -24L42 -58" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-18 24L42 58" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 -58V-88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 58V88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d={c.variant === "PNP" ? "M-4 17L-18 24L-8 35" : "M21 45L42 58L31 36"} stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="-100" y="-10" fill={muted} fontSize="13" fontWeight="900">B</text>
        <text x="52" y="-78" fill={muted} fontSize="13" fontWeight="900">C</text>
        <text x="52" y="86" fill={muted} fontSize="13" fontWeight="900">E</text>
        <text x="0" y="118" textAnchor="middle" fill={cyan} fontSize="14" fontWeight="900">{c.variant || "NPN"}</text>
      </g>
    );
  }

  if (c.type === "capacitor") {
    return (
      <g transform={`translate(${c.x} ${c.y})`}>
        <path d="M-88 0H-25" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M25 0H88" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d="M-12 -38V38" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        <path d="M13 -38V38" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        <text x="0" y="72" textAnchor="middle" fill={cyan} fontSize="14" fontWeight="900">C</text>
      </g>
    );
  }

  return null;
}

function QuizTask({ task, index, answer, setAnswer, checked }) {
  return (
    <TaskCard task={task} index={index} checked={checked}>
      <div className="grid gap-2">
        {task.options.map((option, i) => (
          <OptionButton
            key={option}
            active={answer === i}
            correct={checked && i === task.correct}
            wrong={checked && answer === i && answer !== task.correct}
            onClick={() => setAnswer(i)}
          >
            {option}
          </OptionButton>
        ))}
      </div>
    </TaskCard>
  );
}

function DebugTask({ task, index, answer, setAnswer, checked }) {
  const data = debugCanvasData(task.debugType);

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas components={data.components} wires={data.wires} glow={data.glow} note="Circuit DEBUG: observă conexiunile și alege problema." />
      <div className="mt-4 grid gap-2">
        {task.options.map((option, i) => (
          <OptionButton
            key={option}
            active={answer === i}
            correct={checked && i === task.correct}
            wrong={checked && answer === i && answer !== task.correct}
            onClick={() => setAnswer(i)}
          >
            {option}
          </OptionButton>
        ))}
      </div>
    </TaskCard>
  );
}

function TaskCard({ task, index, checked, children }) {
  const tone = task.difficulty === "DEBUG" ? "rose" : task.kind === "lab" ? "emerald" : task.difficulty === "Tranzistori" ? "violet" : "cyan";

  return (
    <article className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone}>#{index + 1}</Badge>
            <Badge tone={tone}>{task.difficulty}</Badge>
            {checked && <Badge tone="emerald">verificat</Badge>}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{task.title}</h2>
          <p className="mt-2 text-sm leading-7 text-white/68">{task.prompt}</p>
        </div>
      </div>

      <FactsBox facts={task.facts} />

      <div className="mt-5">{children}</div>

      {checked && (
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50/80">
          {task.explain}
        </div>
      )}
    </article>
  );
}

function LightCircuitLab({ task, index, checked, setAnswer }) {
  const lab = useWireLab([]);
  const ok = hasWire(lab.wires, "bat.plus", "bulb.a") && hasWire(lab.wires, "bat.minus", "bulb.b");
  const altOk = hasWire(lab.wires, "bat.plus", "bulb.b") && hasWire(lab.wires, "bat.minus", "bulb.a");
  const correct = ok || altOk;
  const glow = { bulb: correct ? 1 : 0 };

  function verify() {
    setAnswer(correct);
  }

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas
        components={[
          { id: "bat", type: "battery", x: 170, y: 160 },
          { id: "bulb", type: "bulb", x: 570, y: 160 },
        ]}
        wires={lab.wires}
        selectedNode={lab.selected}
        onNodeClick={lab.clickNode}
        glow={glow}
        note="Click pe două borne ca să trasezi un fir."
      />
      <LabButtons onVerify={verify} onReset={lab.clear} success={checked && correct} />
    </TaskCard>
  );
}

function VoltmeterLab({ task, index, checked, setAnswer }) {
  const initial = [
    { a: "bat.plus", b: "bulb.a" },
    { a: "bat.minus", b: "bulb.b" },
  ];
  const lab = useWireLab(initial);
  const correct = hasWire(lab.wires, "volt.a", "bulb.a") && hasWire(lab.wires, "volt.b", "bulb.b");
  const altCorrect = hasWire(lab.wires, "volt.a", "bulb.b") && hasWire(lab.wires, "volt.b", "bulb.a");

  function verify() {
    setAnswer(correct || altCorrect);
  }

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas
        components={[
          { id: "bat", type: "battery", x: 120, y: 130 },
          { id: "bulb", type: "bulb", x: 390, y: 130 },
          { id: "volt", type: "voltmeter", x: 390, y: 250 },
        ]}
        wires={lab.wires}
        selectedNode={lab.selected}
        onNodeClick={lab.clickNode}
        glow={{ bulb: 0.8 }}
        note="Circuitul principal este deja închis. Tu conectezi voltmetrul pe bornele becului."
      />
      <LabButtons onVerify={verify} onReset={lab.clear} success={checked && (correct || altCorrect)} />
    </TaskCard>
  );
}

function ResistorTargetLab({ task, index, checked, setAnswer }) {
  const [r, setR] = useState(220);
  const bulbR = 36;
  const brightness = Math.max(0, Math.min(1, bulbR / (bulbR + Number(r))));
  const correct = brightness >= 0.9;

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas
        components={[
          { id: "bat", type: "battery", x: 105, y: 165 },
          { id: "res", type: "resistor", x: 335, y: 165, label: `${r}Ω` },
          { id: "bulb", type: "bulb", x: 585, y: 165 },
        ]}
        wires={[
          { a: "bat.plus", b: "res.a" },
          { a: "res.b", b: "bulb.a" },
          { a: "bulb.b", b: "bat.minus" },
        ]}
        glow={{ bulb: brightness }}
        note={`Luminozitate estimată: ${formatPct(brightness)}`}
      />
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-bold text-white">Rezistență serie</label>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{r}Ω</span>
        </div>
        <input className="mt-4 w-full accent-cyan-300" type="range" min="0" max="500" step="1" value={r} onChange={(e) => setR(Number(e.target.value))} />
        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-6 text-white/62">
          Calcul curent: procent ≈ 36 / (36 + {r}) = {formatPct(brightness)}. Pentru minim 90%, rezistența serie trebuie să fie între 0Ω și 4Ω.
        </div>
      </div>
      <LabButtons onVerify={() => setAnswer(correct)} success={checked && correct} />
    </TaskCard>
  );
}

function DiodeLab({ task, index, checked, setAnswer }) {
  const [forward, setForward] = useState(false);
  const correct = forward;

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas
        components={[
          { id: "bat", type: "battery", x: 100, y: 160 },
          { id: "dio", type: "diode", x: 315, y: 160, forward },
          { id: "res", type: "resistor", x: 500, y: 160, label: "220Ω" },
          { id: "bulb", type: "bulb", x: 660, y: 160 },
        ]}
        wires={[
          { a: "bat.plus", b: "dio.a" },
          { a: "dio.b", b: "res.a" },
          { a: "res.b", b: "bulb.a" },
          { a: "bulb.b", b: "bat.minus" },
        ]}
        glow={{ bulb: forward ? 0.85 : 0 }}
        note={forward ? "Diodă polarizată direct." : "Diodă inversată: curent blocat."}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setForward((x) => !x)} className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/15">
          Inversează dioda
        </button>
        <button type="button" onClick={() => setAnswer(correct)} className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
          Verifică
        </button>
      </div>
    </TaskCard>
  );
}

function TransistorPotLab({ task, index, checked, setAnswer }) {
  const [pct, setPct] = useState(15);
  const brightness = pct < 25 ? 0 : Math.min(1, (pct - 25) / 55);
  const correct = pct >= 35 && pct <= 75;

  return (
    <TaskCard task={task} index={index} checked={checked}>
      <MiniSchematicCanvas
        components={[
          { id: "bat", type: "battery", x: 100, y: 120 },
          { id: "amp", type: "ammeter", x: 265, y: 120 },
          { id: "bulb", type: "bulb", x: 430, y: 120 },
          { id: "npn", type: "transistor", variant: "NPN", x: 620, y: 150 },
          { id: "pot", type: "potentiometer", x: 325, y: 270, label: `${pct}%` },
        ]}
        wires={[
          { a: "bat.plus", b: "amp.a" },
          { a: "amp.b", b: "bulb.a" },
          { a: "bulb.b", b: "npn.C" },
          { a: "npn.E", b: "bat.minus" },
          { a: "bat.plus", b: "pot.a" },
          { a: "pot.b", b: "npn.B" },
        ]}
        glow={{ bulb: brightness }}
        note={`Semnal bază: ${pct}% · luminozitate estimată: ${formatPct(brightness)}`}
      />
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-bold text-white">Poziție potențiometru</label>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">{pct}%</span>
        </div>
        <input className="mt-4 w-full accent-amber-300" type="range" min="0" max="100" step="1" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
        <p className="mt-3 text-xs leading-6 text-white/55">Ținta este o zonă controlată: becul aprins vizibil, dar nu blocat brutal la maxim.</p>
      </div>
      <LabButtons onVerify={() => setAnswer(correct)} success={checked && correct} />
    </TaskCard>
  );
}

function LabButtons({ onVerify, onReset, success }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" onClick={onVerify} className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
        Verifică laboratorul
      </button>
      {onReset && (
        <button type="button" onClick={onReset} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
          Resetează firele
        </button>
      )}
      {success && <span className="text-sm font-bold text-emerald-200">Corect! Circuitul îndeplinește cerința.</span>}
    </div>
  );
}

function LabTask({ task, index, checked, setAnswer }) {
  if (task.labType === "lightCircuit") return <LightCircuitLab task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  if (task.labType === "voltmeterParallel") return <VoltmeterLab task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  if (task.labType === "resistorTarget") return <ResistorTargetLab task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  if (task.labType === "diodeDirection") return <DiodeLab task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  if (task.labType === "transistorPot") return <TransistorPotLab task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  return null;
}

function debugCanvasData(type) {
  if (type === "voltmeterSeries") {
    return {
      components: [
        { id: "bat", type: "battery", x: 110, y: 160 },
        { id: "volt", type: "voltmeter", x: 300, y: 160 },
        { id: "bulb", type: "bulb", x: 520, y: 160 },
      ],
      wires: [
        { a: "bat.plus", b: "volt.a" },
        { a: "volt.b", b: "bulb.a" },
        { a: "bulb.b", b: "bat.minus" },
      ],
      glow: { bulb: 0 },
    };
  }

  if (type === "ammeterParallel") {
    return {
      components: [
        { id: "bat", type: "battery", x: 100, y: 120 },
        { id: "bulb", type: "bulb", x: 420, y: 120 },
        { id: "amp", type: "ammeter", x: 420, y: 255 },
      ],
      wires: [
        { a: "bat.plus", b: "bulb.a" },
        { a: "bulb.b", b: "bat.minus" },
        { a: "amp.a", b: "bulb.a" },
        { a: "amp.b", b: "bulb.b" },
      ],
      glow: { bulb: 0.15 },
    };
  }

  if (type === "diodeReversed") {
    return {
      components: [
        { id: "bat", type: "battery", x: 90, y: 160 },
        { id: "dio", type: "diode", x: 300, y: 160, forward: false },
        { id: "res", type: "resistor", x: 500, y: 160, label: "220Ω" },
        { id: "bulb", type: "bulb", x: 665, y: 160 },
      ],
      wires: [
        { a: "bat.plus", b: "dio.a" },
        { a: "dio.b", b: "res.a" },
        { a: "res.b", b: "bulb.a" },
        { a: "bulb.b", b: "bat.minus" },
      ],
      glow: { bulb: 0 },
    };
  }

  if (type === "npnEmitterWrong") {
    return {
      components: [
        { id: "bat", type: "battery", x: 90, y: 120 },
        { id: "bulb", type: "bulb", x: 345, y: 120 },
        { id: "npn", type: "transistor", variant: "NPN", x: 575, y: 155 },
        { id: "res", type: "resistor", x: 300, y: 270, label: "1kΩ" },
      ],
      wires: [
        { a: "bat.plus", b: "bulb.a" },
        { a: "bulb.b", b: "npn.E" },
        { a: "npn.C", b: "bat.minus" },
        { a: "bat.plus", b: "res.a" },
        { a: "res.b", b: "npn.B" },
      ],
      glow: { bulb: 0.1 },
    };
  }

  if (type === "capacitorOvervoltage") {
    return {
      components: [
        { id: "bat", type: "battery", x: 110, y: 160 },
        { id: "cap", type: "capacitor", x: 365, y: 160 },
        { id: "volt", type: "voltmeter", x: 365, y: 270 },
        { id: "bulb", type: "bulb", x: 610, y: 160 },
      ],
      wires: [
        { a: "bat.plus", b: "cap.a" },
        { a: "cap.b", b: "bulb.a" },
        { a: "bulb.b", b: "bat.minus" },
        { a: "volt.a", b: "cap.a" },
        { a: "volt.b", b: "cap.b" },
      ],
      glow: { bulb: 0.6 },
    };
  }

  return {
    components: [
      { id: "bat", type: "battery", x: 90, y: 120 },
      { id: "pot", type: "potentiometer", x: 300, y: 250, label: "0%" },
      { id: "npn", type: "transistor", variant: "NPN", x: 565, y: 150 },
      { id: "bulb", type: "bulb", x: 340, y: 120 },
    ],
    wires: [
      { a: "bat.plus", b: "bulb.a" },
      { a: "bulb.b", b: "npn.C" },
      { a: "npn.E", b: "bat.minus" },
      { a: "bat.plus", b: "pot.a" },
      { a: "pot.b", b: "npn.B" },
    ],
    glow: { bulb: 1 },
  };
}

function TaskRenderer({ task, index, answer, setAnswer, checked }) {
  if (task.kind === "quiz") return <QuizTask task={task} index={index} answer={answer} setAnswer={setAnswer} checked={checked} />;
  if (task.kind === "debug") return <DebugTask task={task} index={index} answer={answer} setAnswer={setAnswer} checked={checked} />;
  if (task.kind === "lab") return <LabTask task={task} index={index} checked={checked} setAnswer={setAnswer} />;
  return null;
}

function buildRandomTest() {
  const theory = shuffle(THEORY_TASKS).slice(0, 4);
  const labs = shuffle(LAB_TASKS).slice(0, 3);
  const debug = shuffle(DEBUG_TASKS).slice(0, 2);
  return shuffle([...theory, ...labs, ...debug]);
}

export default function Tests() {
  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [started, setStarted] = useState(false);

  const score = useMemo(() => {
    if (!checked || tasks.length === 0) return 0;
    return tasks.reduce((sum, task) => {
      if (task.kind === "quiz" || task.kind === "debug") return sum + (answers[task.id] === task.correct ? 1 : 0);
      return sum + (answers[task.id] === true ? 1 : 0);
    }, 0);
  }, [answers, checked, tasks]);

  function startTest() {
    setTasks(buildRandomTest());
    setAnswers({});
    setChecked(false);
    setStarted(true);
    window.setTimeout(() => document.getElementById("test-zone")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function checkTest() {
    setChecked(true);
    window.setTimeout(() => document.getElementById("score-zone")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  const answeredCount = tasks.filter((task) => answers[task.id] !== undefined).length;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0b0f17] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute right-[-10%] top-[18%] h-[440px] w-[440px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-[-16%] left-[30%] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 pt-24 pb-12 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] shadow-[0_28px_100px_rgba(0,0,0,0.48)]">
          <div className="grid gap-8 p-7 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>Teste VoltLab</Badge>
                <Badge tone="emerald">quiz + mini-lab</Badge>
                <Badge tone="rose">debug circuits</Badge>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Teste interactive, nu doar întrebări pe hârtie.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                Pagina generează un test random cu teorie, formule, semiconductori și mini-laboratoare. Unele exerciții cer să legi fire, altele să reglezi valori sau să găsești greșeala dintr-un circuit alambicat.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={startTest} className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_0_38px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200">
                  Vreau un test
                </button>
                {started && (
                  <button type="button" onClick={startTest} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white">
                    Generează altul
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-cyan-300/15 bg-cyan-300/10 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/70">Ce include</div>
              <div className="mt-4 grid gap-3">
                {[
                  ["Formule rapide", "Legea lui Ohm, putere, serie/paralel."],
                  ["Mini-canvas", "Click pe borne, fire desenate și verificare imediată."],
                  ["Workshopuri", "Reglaj de rezistență, diodă, potențiometru și NPN."],
                  ["Debug", "Circuite greșite intenționat: găsește cauza."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="font-bold text-white">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-white/60">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {started && (
          <section id="score-zone" className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">Progres</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {checked ? `Scor: ${score}/${tasks.length}` : `${answeredCount}/${tasks.length} rezolvate`}
                </div>
              </div>
              <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${tasks.length ? (answeredCount / tasks.length) * 100 : 0}%` }} />
              </div>
              <button type="button" onClick={checkTest} className="rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200">
                Verifică tot testul
              </button>
            </div>
          </section>
        )}

        <section id="test-zone" className="mt-6 grid gap-5">
          {!started && (
            <div className="rounded-[30px] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
              <div className="text-5xl">⚡</div>
              <h2 className="mt-4 text-2xl font-black text-white">Apasă „Vreau un test” ca să începi.</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Fiecare test este generat dintr-o bancă de întrebări și mini-laboratoare. Unele exerciții sunt simple, altele sunt gândite ca provocări de debugging.
              </p>
            </div>
          )}

          {tasks.map((task, index) => (
            <TaskRenderer
              key={task.id}
              task={task}
              index={index}
              answer={answers[task.id]}
              checked={checked}
              setAnswer={(value) => setAnswers((old) => ({ ...old, [task.id]: value }))}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
