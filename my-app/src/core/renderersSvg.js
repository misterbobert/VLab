import { formatSI } from "./formatting";

const DIGIT_BANDS = {
  0: { name: "black", color: "#111827" },
  1: { name: "brown", color: "#7c2d12" },
  2: { name: "red", color: "#dc2626" },
  3: { name: "orange", color: "#f97316" },
  4: { name: "yellow", color: "#facc15" },
  5: { name: "green", color: "#16a34a" },
  6: { name: "blue", color: "#2563eb" },
  7: { name: "violet", color: "#7c3aed" },
  8: { name: "gray", color: "#9ca3af" },
  9: { name: "white", color: "#f8fafc" },
};

const MULTIPLIER_BANDS = {
  "-2": { name: "silver", color: "#c0c0c0" },
  "-1": { name: "gold", color: "#d4af37" },
  0: DIGIT_BANDS[0],
  1: DIGIT_BANDS[1],
  2: DIGIT_BANDS[2],
  3: DIGIT_BANDS[3],
  4: DIGIT_BANDS[4],
  5: DIGIT_BANDS[5],
  6: DIGIT_BANDS[6],
  7: DIGIT_BANDS[7],
  8: DIGIT_BANDS[8],
  9: DIGIT_BANDS[9],
};

function parseResistanceValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 100;
  }

  if (value == null) return 100;

  const s = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[Ω]/gi, "");

  const m = s.match(/^(-?\d+(?:\.\d+)?)([pnumkMGTµu])?$/);

  if (!m) {
    const n = Number(s);
    return Number.isFinite(n) ? n : 100;
  }

  const num = Number(m[1]);
  const prefix = m[2] || "";

  const mult =
    prefix === "p"
      ? 1e-12
      : prefix === "n"
      ? 1e-9
      : prefix === "u" || prefix === "µ"
      ? 1e-6
      : prefix === "m"
      ? 1e-3
      : prefix === "k"
      ? 1e3
      : prefix === "M"
      ? 1e6
      : prefix === "G"
      ? 1e9
      : prefix === "T"
      ? 1e12
      : 1;

  return num * mult;
}

function getResistorBands(R) {
  const value = Math.abs(parseResistanceValue(R));

  if (!Number.isFinite(value) || value <= 0) {
    return [
      DIGIT_BANDS[0],
      DIGIT_BANDS[0],
      DIGIT_BANDS[0],
      { name: "gold", color: "#d4af37" },
    ];
  }

  let exp = Math.floor(Math.log10(value));
  let firstTwo = Math.round(value / Math.pow(10, exp - 1));

  if (firstTwo >= 100) {
    firstTwo = 10;
    exp += 1;
  }

  const d1 = Math.floor(firstTwo / 10);
  const d2 = firstTwo % 10;
  const multiplierExp = exp - 1;

  const digit1 = DIGIT_BANDS[d1] || DIGIT_BANDS[0];
  const digit2 = DIGIT_BANDS[d2] || DIGIT_BANDS[0];
  const multiplier =
    MULTIPLIER_BANDS[multiplierExp] || { name: "unknown", color: "#64748b" };

  const tolerance = { name: "gold", color: "#d4af37" };

  return [digit1, digit2, multiplier, tolerance];
}

function resistorBandRects(R) {
  const bands = getResistorBands(R);
  const xPositions = [64, 82, 100, 126];

  return bands
    .map((band, index) => {
      const x = xPositions[index];

      return `
        <rect
          x="${x}"
          y="23"
          width="10"
          height="22"
          rx="3"
          fill="${band.color}"
          stroke="rgba(255,255,255,0.35)"
          stroke-width="1"
        />
      `;
    })
    .join("");
}

export function resistorSVG(R) {
  const txt = formatSI(R, "Ω");
  const bands = resistorBandRects(R);

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    <rect x="52" y="18" width="96" height="34" rx="14"
      fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.12)"/>

    ${bands}

    <path d="M30 68 H60 L70 48 L90 88 L110 48 L130 88 L140 68 H170"
      fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="6"
      stroke-linecap="round" stroke-linejoin="round"/>

    <text x="100" y="105" text-anchor="middle" font-size="14"
      fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif,system-ui">${txt}</text>
  </svg>`;
}

export function capacitorSVG(
  voltage = 0,
  vmax = 9,
  capacitance = 0.001,
  polaritySensitive = true
) {
  const safeVmax = Math.max(0.000001, Number(vmax) || 9);
  const v = Number(voltage) || 0;
  const fill01 = Math.max(0, Math.min(1, Math.abs(v) / safeVmax));

  const fillH = 62 * fill01;
  const fillY = 84 - fillH;

  const cText = formatSI(capacitance, "F");
  const vText = `${v.toFixed(2)}V`;
  const pctText = `${Math.round(fill01 * 100)}%`;

  const fillColor =
    fill01 >= 0.95
      ? "rgba(34,211,238,0.92)"
      : fill01 >= 0.55
      ? "rgba(56,189,248,0.78)"
      : "rgba(125,211,252,0.58)";

  const reverseWarning =
    polaritySensitive && v < -0.01
      ? `<text x="100" y="18" text-anchor="middle" font-size="10"
          fill="rgba(251,113,133,0.95)" font-family="ui-sans-serif,system-ui">polaritate inversă</text>`
      : "";

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    ${reverseWarning}

    <path d="M28 60 H67" stroke="rgba(255,255,255,0.80)"
      stroke-width="6" stroke-linecap="round"/>
    <path d="M133 60 H172" stroke="rgba(255,255,255,0.80)"
      stroke-width="6" stroke-linecap="round"/>

    <rect x="72" y="20" width="56" height="68" rx="12"
      fill="rgba(0,0,0,0.26)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>

    <clipPath id="capFillClip">
      <rect x="76" y="24" width="48" height="60" rx="9"/>
    </clipPath>

    <rect x="76" y="${fillY}" width="48" height="${fillH}" rx="9"
      fill="${fillColor}" clip-path="url(#capFillClip)"/>

    <path d="M86 36 H114" stroke="rgba(255,255,255,0.78)"
      stroke-width="5" stroke-linecap="round"/>
    <path d="M86 72 H114" stroke="rgba(255,255,255,0.78)"
      stroke-width="5" stroke-linecap="round"/>

    <text x="62" y="40" text-anchor="middle" font-size="12"
      fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif,system-ui">${polaritySensitive ? "+" : "~"}</text>

    <text x="138" y="40" text-anchor="middle" font-size="12"
      fill="rgba(255,255,255,0.75)" font-family="ui-sans-serif,system-ui">${polaritySensitive ? "−" : "~"}</text>

    <text x="100" y="101" text-anchor="middle" font-size="12"
      fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">${cText} · ${pctText}</text>

    <text x="100" y="114" text-anchor="middle" font-size="10"
      fill="rgba(255,255,255,0.50)" font-family="ui-sans-serif,system-ui">${vText}</text>
  </svg>`;
}

export function meterSVG(kind, display) {
  const label = kind === "voltmeter" ? "V" : kind === "ammeter" ? "A" : "Ω";

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="70" cy="60" r="26" fill="rgba(0,0,0,0.25)"
      stroke="rgba(255,255,255,0.20)"/>
    <text x="70" y="66" text-anchor="middle" font-size="18"
      fill="rgba(255,255,255,0.85)" font-family="ui-sans-serif,system-ui">${label}</text>
    <text x="128" y="66" text-anchor="middle" font-size="18"
      fill="rgba(255,255,255,0.90)" font-family="ui-sans-serif,system-ui">${display}</text>
  </svg>`;
}

export function switchSVG(closed) {
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
    <path d="M35 60 H80" stroke="rgba(255,255,255,0.88)"
      stroke-width="6" stroke-linecap="round"/>
    <path d="M120 60 H165" stroke="rgba(255,255,255,0.88)"
      stroke-width="6" stroke-linecap="round"/>
    ${
      closed
        ? `<path d="M80 60 H120" stroke="rgba(120,255,180,0.95)" stroke-width="6" stroke-linecap="round"/>`
        : `<path d="M80 60 L120 40" stroke="rgba(255,255,255,0.88)" stroke-width="6" stroke-linecap="round"/>`
    }
    <text x="100" y="102" text-anchor="middle" font-size="14"
      fill="rgba(255,255,255,0.65)" font-family="ui-sans-serif,system-ui">${closed ? "închis" : "deschis"}</text>
  </svg>`;
}

export function bulbSVG(brightness01) {
  const b = Math.max(0, Math.min(1, brightness01 || 0));
  const glow = 0.15 + b * 0.65;

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="100" cy="55" r="26" fill="rgba(255,220,120,${glow})"
      stroke="rgba(255,255,255,0.22)"/>
    <path d="M88 82 H112" stroke="rgba(255,255,255,0.75)"
      stroke-width="6" stroke-linecap="round"/>
    <text x="100" y="102" text-anchor="middle" font-size="14"
      fill="rgba(255,255,255,0.65)" font-family="ui-sans-serif,system-ui">${Math.round(b * 100)}%</text>
  </svg>`;
}

export function batterySVG(V, Rint, socPct = 100, capacityMah = 2000) {
  const a = formatSI(V, "V");
  const b = formatSI(Rint, "Ω");
  const pct = Math.max(0, Math.min(100, Number(socPct) || 0));
  const fillW = 82 * (pct / 100);
  const mahText = `${Math.round(Number(capacityMah) || 0)}mAh`;

  const fillColor =
    pct <= 15
      ? "rgba(248,113,113,0.88)"
      : pct <= 35
      ? "rgba(251,191,36,0.88)"
      : "rgba(74,222,128,0.82)";

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    <rect x="55" y="36" width="90" height="44" rx="10"
      fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.18)"/>
    <rect x="145" y="50" width="10" height="16" rx="3"
      fill="rgba(255,255,255,0.30)"/>

    <clipPath id="batClip">
      <rect x="59" y="40" width="82" height="36" rx="7"/>
    </clipPath>

    <rect x="59" y="40" width="${fillW}" height="36" rx="7"
      fill="${fillColor}" clip-path="url(#batClip)"/>

    <text x="100" y="62" text-anchor="middle" font-size="14"
      fill="rgba(255,255,255,0.92)" font-family="ui-sans-serif,system-ui">${a}</text>

    <text x="100" y="95" text-anchor="middle" font-size="11"
      fill="rgba(255,255,255,0.65)" font-family="ui-sans-serif,system-ui">${Math.round(pct)}% · ${mahText}</text>

    <text x="100" y="108" text-anchor="middle" font-size="10"
      fill="rgba(255,255,255,0.45)" font-family="ui-sans-serif,system-ui">Rint ${b}</text>
  </svg>`;
}

export function potentiometerSVG(R = 5000, Rmax = 10000, positionPct = 50) {
  const txt = `${formatSI(R, "Ω")} / ${formatSI(Rmax, "Ω")}`;
  const pos = Math.max(0, Math.min(100, Number(positionPct) || 0));
  const knobX = 58 + (84 * pos) / 100;

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    <path d="M30 64 H58" stroke="rgba(255,255,255,0.82)" stroke-width="6" stroke-linecap="round"/>
    <path d="M142 64 H170" stroke="rgba(255,255,255,0.82)" stroke-width="6" stroke-linecap="round"/>

    <rect x="58" y="47" width="84" height="34" rx="10"
      fill="rgba(0,0,0,0.26)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>

    <path d="M${knobX.toFixed(1)} 28 L${knobX.toFixed(1)} 46" stroke="rgba(34,211,238,0.96)" stroke-width="4" stroke-linecap="round"/>
    <path d="M${knobX.toFixed(1)} 28 L${(knobX - 12).toFixed(1)} 38 M${knobX.toFixed(1)} 28 L${(knobX + 12).toFixed(1)} 38"
      stroke="rgba(34,211,238,0.96)" stroke-width="4" stroke-linecap="round"/>

    <text x="100" y="103" text-anchor="middle" font-size="13"
      fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">${txt}</text>
  </svg>`;
}

export function diodeSVG(conducting = false, Vf = 0.7) {
  const state = conducting ? "conduce" : "blocată";
  const color = conducting ? "rgba(74,222,128,0.95)" : "rgba(255,255,255,0.84)";

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="100" rx="20"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    <path d="M28 60 H66" stroke="rgba(255,255,255,0.82)" stroke-width="6" stroke-linecap="round"/>
    <path d="M134 60 H172" stroke="rgba(255,255,255,0.82)" stroke-width="6" stroke-linecap="round"/>

    <path d="M70 35 L118 60 L70 85 Z" fill="rgba(34,211,238,0.13)" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M126 34 V86" stroke="${color}" stroke-width="5" stroke-linecap="round"/>

    <text x="100" y="103" text-anchor="middle" font-size="13"
      fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">${state} · Vf ${Number(Vf || 0.7).toFixed(2)}V</text>
  </svg>`;
}

export function transistorSVG(kind = "NPN", on = false) {
  const k = String(kind).toUpperCase() === "PNP" ? "PNP" : "NPN";
  const accent = on ? "rgba(74,222,128,0.95)" : "rgba(34,211,238,0.82)";
  const arrow = k === "NPN"
    ? `<path d="M122 77 L144 92 M144 92 L139 77 M144 92 L128 88" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M144 92 L122 77 M122 77 L139 77 M122 77 L128 88" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="120" rx="22"
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>

    <circle cx="100" cy="70" r="42" fill="rgba(0,0,0,0.20)" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>
    <path d="M28 70 H74" stroke="rgba(255,255,255,0.84)" stroke-width="6" stroke-linecap="round"/>
    <path d="M126 47 L168 34" stroke="rgba(255,255,255,0.84)" stroke-width="6" stroke-linecap="round"/>
    <path d="M126 93 L168 106" stroke="rgba(255,255,255,0.84)" stroke-width="6" stroke-linecap="round"/>
    <path d="M76 42 V98" stroke="rgba(255,255,255,0.86)" stroke-width="5" stroke-linecap="round"/>
    <path d="M76 55 L126 47 M76 85 L126 93" stroke="rgba(255,255,255,0.86)" stroke-width="5" stroke-linecap="round"/>
    ${arrow}

    <text x="39" y="62" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">B</text>
    <text x="166" y="23" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">C</text>
    <text x="166" y="124" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">E</text>
    <text x="100" y="124" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.72)" font-family="ui-sans-serif,system-ui">${k} · ${on ? "pornit" : "oprit"}</text>
  </svg>`;
}

export function schematicSVG(item, label) {
  const type = item.type;

  const stroke = "rgba(255,255,255,0.92)";
  const muted = "rgba(255,255,255,0.68)";
  const accent = "rgba(34,211,238,0.95)";

  function valueText() {
    if (type === "battery") {
      return formatSI(item.effectiveV ?? item.V ?? 9, "V");
    }

    if (type === "resistor") {
      return formatSI(item.R ?? 100, "Ω");
    }

    if (type === "potentiometer") {
      return formatSI(item.R ?? 5000, "Ω");
    }

    if (type === "diode") {
      return item.displayState === "conduce" ? `ON · ${formatSI(item.Vf ?? 0.7, "V")}` : `OFF · ${formatSI(item.Vf ?? 0.7, "V")}`;
    }

    if (type === "transistor_npn" || type === "transistor_pnp") {
      return `${item.type === "transistor_pnp" ? "PNP" : "NPN"} · ${item.displayState ?? "—"}`;
    }

    if (type === "capacitor") {
      return formatSI(item.C ?? 0.001, "F");
    }

    if (type === "bulb") {
      const p = item.displayPower && item.displayPower !== "—" ? item.displayPower : null;
      return p ?? formatSI(item.R ?? 30, "Ω");
    }

    if (type === "switch") {
      return item.closed ? "închis" : "deschis";
    }

    if (type === "voltmeter" || type === "ammeter" || type === "ohmmeter") {
      return item.display ?? "—";
    }

    return "";
  }

  const value = valueText();

  const baseText = `
    <text x="100" y="22" text-anchor="middle" font-size="15"
      fill="${accent}" font-family="ui-sans-serif, system-ui" font-weight="800">${label}</text>

    <text x="100" y="109" text-anchor="middle" font-size="13"
      fill="${muted}" font-family="ui-sans-serif, system-ui">${value}</text>
  `;

  if (type === "battery") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H74" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M126 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <path d="M82 42 V82" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M118 32 V92" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <text x="77" y="38" text-anchor="middle" font-size="15"
        fill="${muted}" font-family="ui-sans-serif, system-ui">−</text>
      <text x="123" y="28" text-anchor="middle" font-size="15"
        fill="${muted}" font-family="ui-sans-serif, system-ui">+</text>
    </svg>`;
  }

  if (type === "resistor") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H58" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M142 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <rect x="58" y="45" width="84" height="34" rx="3"
        fill="rgba(255,255,255,0.03)" stroke="${stroke}" stroke-width="4"/>
    </svg>`;
  }

  if (type === "potentiometer") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H58" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M142 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <rect x="58" y="45" width="84" height="34" rx="3"
        fill="rgba(255,255,255,0.03)" stroke="${stroke}" stroke-width="4"/>

      <path d="M114 30 L84 58" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <path d="M114 30 L102 33 M114 30 L111 42" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }

  if (type === "diode") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H70" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M130 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M72 38 L118 62 L72 86 Z" fill="rgba(255,255,255,0.03)" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M126 36 V88" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  if (type === "transistor_npn" || type === "transistor_pnp") {
    const isPnp = type === "transistor_pnp";
    const arrow = isPnp
      ? `<path d="M142 92 L118 76 M118 76 L136 75 M118 76 L126 91" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M118 76 L142 92 M142 92 L136 75 M142 92 L126 91" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

    return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <text x="100" y="20" text-anchor="middle" font-size="15" fill="${accent}" font-family="ui-sans-serif, system-ui" font-weight="800">${label}</text>
      <text x="100" y="130" text-anchor="middle" font-size="13" fill="${muted}" font-family="ui-sans-serif, system-ui">${value}</text>

      <circle cx="100" cy="70" r="38" fill="rgba(255,255,255,0.02)" stroke="${stroke}" stroke-width="3"/>
      <path d="M25 70 H76" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M124 46 L175 34" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M124 94 L175 106" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M78 42 V98" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M78 56 L124 46 M78 84 L124 94" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      ${arrow}
      <text x="35" y="58" text-anchor="middle" font-size="12" fill="${muted}" font-family="ui-sans-serif, system-ui">B</text>
      <text x="169" y="24" text-anchor="middle" font-size="12" fill="${muted}" font-family="ui-sans-serif, system-ui">C</text>
      <text x="169" y="124" text-anchor="middle" font-size="12" fill="${muted}" font-family="ui-sans-serif, system-ui">E</text>
    </svg>`;
  }

  if (type === "capacitor") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H78" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M122 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <path d="M86 36 V88" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M114 36 V88" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <text x="80" y="36" text-anchor="middle" font-size="14"
        fill="${muted}" font-family="ui-sans-serif, system-ui">+</text>
    </svg>`;
  }

  if (type === "bulb") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H67" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M133 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <circle cx="100" cy="62" r="33"
        fill="rgba(255,255,255,0.02)" stroke="${stroke}" stroke-width="4"/>

      <path d="M78 40 L122 84 M122 40 L78 84"
        stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }

  if (type === "switch") {
    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H76" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M124 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <circle cx="78" cy="62" r="5" fill="${stroke}"/>
      <circle cx="122" cy="62" r="5" fill="${stroke}"/>

      ${
        item.closed
          ? `<path d="M78 62 H122" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>`
          : `<path d="M78 62 L122 42" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>`
      }
    </svg>`;
  }

  if (type === "voltmeter" || type === "ammeter" || type === "ohmmeter") {
    const symbol = type === "voltmeter" ? "V" : type === "ammeter" ? "A" : "Ω";

    return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      ${baseText}

      <path d="M25 62 H62" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M138 62 H175" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

      <circle cx="100" cy="62" r="36"
        fill="rgba(255,255,255,0.02)" stroke="${stroke}" stroke-width="4"/>

      <text x="100" y="71" text-anchor="middle" font-size="28"
        fill="${stroke}" font-family="ui-sans-serif, system-ui" font-weight="800">${symbol}</text>
    </svg>`;
  }

  return "";
}
