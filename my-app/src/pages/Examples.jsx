import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOAD_KEY = "voltlab:loadExample";

function component(id, type, x, y, props = {}) {
  const item = {
    id,
    type,
    x,
    y,
    sizePct: 100,
    rot: 0,
    ...props,
  };

  const nodes =
    type === "transistor_npn" || type === "transistor_pnp"
      ? [
          { id: `${id}_b`, itemId: id, name: "b", lx: -80, ly: 0, x: x - 80, y },
          { id: `${id}_c`, itemId: id, name: "c", lx: 72, ly: -36, x: x + 72, y: y - 36 },
          { id: `${id}_e`, itemId: id, name: "e", lx: 72, ly: 36, x: x + 72, y: y + 36 },
        ]
      : [
          { id: `${id}_a`, itemId: id, name: "a", lx: -80, ly: 0, x: x - 80, y },
          { id: `${id}_b`, itemId: id, name: "b", lx: 80, ly: 0, x: x + 80, y },
        ];

  return { item, nodes };
}

function wire(id, aNodeId, bNodeId, points = []) {
  return { id, aNodeId, bNodeId, points };
}

function makeCircuit(parts, wires, zoom = 0.58) {
  return {
    items: parts.map((p) => p.item),
    nodes: parts.flatMap((p) => p.nodes),
    wires,
    selectedId: null,
    autoCenter: true,
    cam: { x: 0, y: 0, z: zoom },
    mode: "select",
  };
}

const commonBattery = {
  V: 9,
  effectiveV: 9,
  Rint: 0.2,
  capacityMah: 2000,
  socPct: 100,
  dischargeEnabled: true,
  displayCurrent: "—",
  displayPower: "—",
  displayRuntime: "—",
};

const battery45 = {
  ...commonBattery,
  V: 4.5,
  effectiveV: 4.5,
};

const battery12 = {
  ...commonBattery,
  V: 12,
  effectiveV: 12,
};

const commonBulb = {
  R: 30,
  Vnom: 6,
  Pnom: 2.7,
  ratedPowerW: 2.7,
  polaritySensitive: true,
  brightness: 0,
  displayVoltage: "—",
  displayCurrent: "—",
  displayPower: "—",
};

const smallBulb = {
  ...commonBulb,
  R: 72,
  Vnom: 6,
  Pnom: 0.5,
  ratedPowerW: 0.5,
};

const commonCapacitor = {
  C: 0.001,
  Vmax: 12,
  capVoltage: 0,
  ESR: 0.5,
  chargeTimeSec: 2.5,
  dischargeTimeSec: 8,
  leakageEnabled: false,
  polaritySensitive: true,
  displayVoltage: "—",
  displayCharge: "—",
  displayEnergy: "—",
  displayPercent: "0%",
  displayCurrent: "—",
};

const commonDiode = {
  Vf: 0.7,
  Ron: 1,
  Roff: 1000000000,
  displayState: "—",
  displayVoltage: "—",
  displayCurrent: "—",
};

const commonNpn = {
  kind: "NPN",
  // valori calibrate pentru exemplele din pagină: tranzistorul nu mai pornește instant,
  // iar potențiometrul 0–100kΩ poate comuta vizibil între oprit și pornit.
  beta: 8,
  Vbe: 0.9,
  RonCE: 100,
  RoffCE: 1000000000,
  Rbe: 4700,
  displayState: "—",
  displayVbe: "—",
  displayVce: "—",
  displayIc: "—",
};

const commonPnp = {
  ...commonNpn,
  kind: "PNP",
};

const commonPot = {
  Rmin: 0,
  Rmax: 100000,
  positionPct: 35,
  R: 35000,
  displayVoltage: "—",
  displayCurrent: "—",
  displayPower: "—",
};

const CATEGORIES = [
  { id: "all", label: "Toate" },
  { id: "basic", label: "Bază" },
  { id: "measure", label: "Măsurători" },
  { id: "resistors", label: "Rezistori" },
  { id: "capacitors", label: "Condensatori" },
  { id: "diodes", label: "Diode" },
  { id: "transistors", label: "Tranzistori" },
  { id: "control", label: "Control" },
  { id: "kirchhoff", label: "Kirchhoff" },
  { id: "debug", label: "DEBUG" },
  { id: "errors", label: "Greșeli simple" },
];

const EXAMPLES = [
  {
    id: "bec-simplu-curat",
    categoryId: "basic",
    title: "Bec simplu alimentat de baterie",
    level: "Începător",
    badge: "Bază",
    description:
      "Cel mai simplu circuit închis: bateria alimentează un bec. Este bun pentru a arăta imediat ideea de plus, minus și consumator.",
    learns: ["circuit închis", "rolul bateriei", "luminozitatea becului"],
    components: ["Baterie", "Bec"],
    circuit: makeCircuit(
      [
        component("bat_basic", "battery", -300, -80, { ...commonBattery }),
        component("bulb_basic", "bulb", 300, -80, { ...commonBulb }),
      ],
      [
        wire("w1", "bat_basic_a", "bulb_basic_a", [
          { x: -300, y: -260 },
          { x: 300, y: -260 },
        ]),
        wire("w2", "bulb_basic_b", "bat_basic_b", [
          { x: 300, y: 120 },
          { x: -300, y: 120 },
        ]),
      ],
      0.72
    ),
  },
  {
    id: "switch-control-bec",
    categoryId: "basic",
    title: "Bec controlat cu întrerupător",
    level: "Începător",
    badge: "Control",
    description:
      "Un circuit simplu cu întrerupător. Schimbă starea întrerupătorului din Inspector și pornește/oprește becul.",
    learns: ["circuit deschis", "circuit închis", "control manual"],
    components: ["Baterie", "Întrerupător", "Bec"],
    circuit: makeCircuit(
      [
        component("bat_sw", "battery", -520, -90, { ...commonBattery }),
        component("sw_main", "switch", -140, -90, { closed: true }),
        component("bulb_sw", "bulb", 300, -90, { ...commonBulb }),
      ],
      [
        wire("w1", "bat_sw_a", "sw_main_a", [
          { x: -520, y: -260 },
          { x: -140, y: -260 },
        ]),
        wire("w2", "sw_main_b", "bulb_sw_a"),
        wire("w3", "bulb_sw_b", "bat_sw_b", [
          { x: 500, y: 140 },
          { x: -520, y: 140 },
        ]),
      ],
      0.62
    ),
  },
  {
    id: "rezistor-serie-bec",
    categoryId: "resistors",
    title: "Rezistor în serie cu bec",
    level: "Începător",
    badge: "Rezistor",
    description:
      "Rezistorul limitează curentul prin bec. Selectează rezistorul și modifică valoarea lui pentru a vedea efectul.",
    learns: ["legea lui Ohm", "curent limitat", "puterea pe bec"],
    components: ["Baterie", "Rezistor", "Bec"],
    circuit: makeCircuit(
      [
        component("bat_res", "battery", -620, -100, { ...commonBattery }),
        component("r_res", "resistor", -220, -100, { R: 100 }),
        component("bulb_res", "bulb", 260, -100, { ...smallBulb }),
      ],
      [
        wire("w1", "bat_res_a", "r_res_a", [
          { x: -620, y: -280 },
          { x: -220, y: -280 },
        ]),
        wire("w2", "r_res_b", "bulb_res_a"),
        wire("w3", "bulb_res_b", "bat_res_b", [
          { x: 500, y: 150 },
          { x: -620, y: 150 },
        ]),
      ],
      0.58
    ),
  },
  {
    id: "potentiometru-dimmer",
    categoryId: "resistors",
    title: "Dimmer cu potențiometru",
    level: "Mediu",
    badge: "Potențiometru",
    description:
      "Potențiometrul funcționează ca un rezistor variabil. Mută sliderul din Inspector și vezi cum se schimbă luminozitatea becului.",
    learns: ["rezistență variabilă", "control analogic", "curent mai mic sau mai mare"],
    components: ["Baterie", "Potențiometru", "Bec", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_pot", "battery", -760, -100, { ...commonBattery }),
        component("amp_pot", "ammeter", -470, -100, { display: "—" }),
        component("pot_dim", "potentiometer", -120, -100, {
          ...commonPot,
          Rmin: 50,
          Rmax: 1000,
          positionPct: 35,
          R: 382.5,
        }),
        component("bulb_pot", "bulb", 330, -100, { ...smallBulb }),
      ],
      [
        wire("w1", "bat_pot_a", "amp_pot_a", [
          { x: -760, y: -285 },
          { x: -470, y: -285 },
        ]),
        wire("w2", "amp_pot_b", "pot_dim_a"),
        wire("w3", "pot_dim_b", "bulb_pot_a"),
        wire("w4", "bulb_pot_b", "bat_pot_b", [
          { x: 540, y: 160 },
          { x: -760, y: 160 },
        ]),
      ],
      0.5
    ),
  },
  {
    id: "divizor-tensiune-curat",
    categoryId: "resistors",
    title: "Divizor de tensiune cu două voltmetre",
    level: "Avansat",
    badge: "Divizor",
    description:
      "Două rezistențe în serie împart tensiunea bateriei. Voltmetrele măsoară căderile de tensiune separat.",
    learns: ["tensiuni parțiale", "serie", "suma tensiunilor"],
    components: ["Baterie", "R1", "R2", "Voltmetru R1", "Voltmetru R2"],
    circuit: makeCircuit(
      [
        component("bat_div", "battery", -760, -160, { ...commonBattery }),
        component("r1_div", "resistor", -320, -160, { R: 100 }),
        component("r2_div", "resistor", 140, -160, { R: 220 }),
        component("v1_div", "voltmeter", -320, 120, { display: "—" }),
        component("v2_div", "voltmeter", 140, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat_div_a", "r1_div_a", [
          { x: -760, y: -330 },
          { x: -320, y: -330 },
        ]),
        wire("w2", "r1_div_b", "r2_div_a"),
        wire("w3", "r2_div_b", "bat_div_b", [
          { x: 390, y: 310 },
          { x: -760, y: 310 },
        ]),
        wire("w4", "v1_div_a", "r1_div_a", [
          { x: -500, y: 120 },
          { x: -500, y: -160 },
        ]),
        wire("w5", "v1_div_b", "r1_div_b", [
          { x: -140, y: 120 },
          { x: -140, y: -160 },
        ]),
        wire("w6", "v2_div_a", "r2_div_a", [
          { x: -40, y: 120 },
          { x: -40, y: -160 },
        ]),
        wire("w7", "v2_div_b", "r2_div_b", [
          { x: 320, y: 120 },
          { x: 320, y: -160 },
        ]),
      ],
      0.48
    ),
  },
  {
    id: "voltmetru-ampermetru-corect",
    categoryId: "measure",
    title: "Măsurare completă: voltmetru + ampermetru",
    level: "Mediu",
    badge: "Măsurători",
    description:
      "Ampermetrul este în serie, iar voltmetrul este în paralel pe bec. Exemplu bun pentru demonstrație la clasă.",
    learns: ["ampermetru în serie", "voltmetru în paralel", "citiri simultane"],
    components: ["Baterie", "Ampermetru", "Rezistor", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_m", "battery", -780, -130, { ...commonBattery }),
        component("amp_m", "ammeter", -500, -130, { display: "—" }),
        component("r_m", "resistor", -190, -130, { R: 120 }),
        component("bulb_m", "bulb", 240, -130, { ...smallBulb }),
        component("volt_m", "voltmeter", 240, 150, { display: "—" }),
      ],
      [
        wire("w1", "bat_m_a", "amp_m_a", [
          { x: -780, y: -320 },
          { x: -500, y: -320 },
        ]),
        wire("w2", "amp_m_b", "r_m_a"),
        wire("w3", "r_m_b", "bulb_m_a"),
        wire("w4", "bulb_m_b", "bat_m_b", [
          { x: 500, y: 290 },
          { x: -780, y: 290 },
        ]),
        wire("w5", "volt_m_a", "bulb_m_a", [
          { x: 60, y: 150 },
          { x: 60, y: -130 },
        ]),
        wire("w6", "volt_m_b", "bulb_m_b", [
          { x: 420, y: 150 },
          { x: 420, y: -130 },
        ]),
      ],
      0.48
    ),
  },
  {
    id: "ohmmetru-serie-paralel",
    categoryId: "measure",
    title: "Ohmmetru pe rețea serie-paralel",
    level: "Avansat",
    badge: "Ohmmetru",
    description:
      "Ohmmetrul citește rezistența echivalentă a unei rețele mixte. Nu are baterie, ca să fie cât mai apropiat de utilizarea reală.",
    learns: ["rezistență echivalentă", "serie-paralel", "măsurare fără sursă"],
    components: ["Ohmmetru", "R1", "R2", "R3", "R4"],
    circuit: makeCircuit(
      [
        component("ohm_mix", "ohmmeter", -700, 0, { display: "—" }),
        component("r1_mix", "resistor", -300, 0, { R: 100 }),
        component("r2_mix", "resistor", 120, -160, { R: 220 }),
        component("r3_mix", "resistor", 120, 160, { R: 330 }),
        component("r4_mix", "resistor", 520, 0, { R: 150 }),
      ],
      [
        wire("w1", "ohm_mix_a", "r1_mix_a"),
        wire("w2", "r1_mix_b", "r2_mix_a", [{ x: -80, y: -160 }]),
        wire("w3", "r1_mix_b", "r3_mix_a", [{ x: -80, y: 160 }]),
        wire("w4", "r2_mix_b", "r4_mix_a", [{ x: 330, y: -160 }]),
        wire("w5", "r3_mix_b", "r4_mix_a", [{ x: 330, y: 160 }]),
        wire("w6", "r4_mix_b", "ohm_mix_b", [
          { x: 760, y: 280 },
          { x: -700, y: 280 },
        ]),
      ],
      0.48
    ),
  },
  {
    id: "condensator-incarcare-curat",
    categoryId: "capacitors",
    title: "Condensator care se încarcă prin rezistor",
    level: "Mediu",
    badge: "RC",
    description:
      "Condensatorul se încarcă progresiv printr-un rezistor. Voltmetrul urmărește tensiunea de pe condensator.",
    learns: ["încărcare RC", "tensiune pe condensator", "energie stocată"],
    components: ["Baterie", "Rezistor", "Condensator", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_rc", "battery", -700, -120, { ...commonBattery }),
        component("r_rc", "resistor", -250, -120, { R: 1000 }),
        component("cap_rc", "capacitor", 240, -120, {
          ...commonCapacitor,
          C: 0.0022,
          Vmax: 12,
          chargeTimeSec: 4,
          dischargeTimeSec: 10,
        }),
        component("volt_rc", "voltmeter", 240, 150, { display: "—" }),
      ],
      [
        wire("w1", "bat_rc_a", "r_rc_a", [
          { x: -700, y: -300 },
          { x: -250, y: -300 },
        ]),
        wire("w2", "r_rc_b", "cap_rc_a"),
        wire("w3", "cap_rc_b", "bat_rc_b", [
          { x: 490, y: 300 },
          { x: -700, y: 300 },
        ]),
        wire("w4", "volt_rc_a", "cap_rc_a", [
          { x: 60, y: 150 },
          { x: 60, y: -120 },
        ]),
        wire("w5", "volt_rc_b", "cap_rc_b", [
          { x: 420, y: 150 },
          { x: 420, y: -120 },
        ]),
      ],
      0.5
    ),
  },
  {
    id: "condensator-descarcare-bec",
    categoryId: "capacitors",
    title: "Condensator încărcat care aprinde un bec",
    level: "Mediu",
    badge: "Descărcare",
    description:
      "Condensatorul pornește încărcat și se descarcă prin bec. Lumina ar trebui să scadă treptat.",
    learns: ["descărcare", "sursă temporară", "scădere progresivă"],
    components: ["Condensator", "Rezistor", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("cap_dis", "capacitor", -480, -100, {
          ...commonCapacitor,
          C: 0.0047,
          Vmax: 12,
          capVoltage: 9,
          dischargeTimeSec: 12,
          leakageEnabled: true,
        }),
        component("r_dis", "resistor", -80, -100, { R: 50 }),
        component("bulb_dis", "bulb", 320, -100, { ...smallBulb }),
        component("volt_dis", "voltmeter", -480, 160, { display: "—" }),
      ],
      [
        wire("w1", "cap_dis_a", "r_dis_a", [
          { x: -480, y: -280 },
          { x: -80, y: -280 },
        ]),
        wire("w2", "r_dis_b", "bulb_dis_a"),
        wire("w3", "bulb_dis_b", "cap_dis_b", [
          { x: 540, y: 300 },
          { x: -480, y: 300 },
        ]),
        wire("w4", "volt_dis_a", "cap_dis_a", [
          { x: -660, y: 160 },
          { x: -660, y: -100 },
        ]),
        wire("w5", "volt_dis_b", "cap_dis_b", [
          { x: -300, y: 160 },
          { x: -300, y: -100 },
        ]),
      ],
      0.55
    ),
  },
  {
    id: "dioda-sens-direct",
    categoryId: "diodes",
    title: "Diodă în sens direct",
    level: "Mediu",
    badge: "Diodă",
    description:
      "Dioda este conectată pe sensul în care conduce. În Inspector ar trebui să apară starea de conducție.",
    learns: ["sens direct", "cădere Vf", "curent într-un singur sens"],
    components: ["Baterie", "Diodă", "Rezistor", "Bec"],
    circuit: makeCircuit(
      [
        component("bat_d", "battery", -760, -100, { ...commonBattery }),
        component("d_forward", "diode", -390, -100, { ...commonDiode }),
        component("r_d", "resistor", -30, -100, { R: 150 }),
        component("bulb_d", "bulb", 340, -100, { ...smallBulb }),
      ],
      [
        wire("w1", "bat_d_a", "d_forward_a", [
          { x: -760, y: -280 },
          { x: -390, y: -280 },
        ]),
        wire("w2", "d_forward_b", "r_d_a"),
        wire("w3", "r_d_b", "bulb_d_a"),
        wire("w4", "bulb_d_b", "bat_d_b", [
          { x: 560, y: 160 },
          { x: -760, y: 160 },
        ]),
      ],
      0.52
    ),
  },
  {
    id: "dioda-blocare",
    categoryId: "diodes",
    title: "Diodă inversată: bec stins",
    level: "Mediu",
    badge: "Diodă",
    description:
      "Aceeași idee, dar dioda este întoarsă. Curentul este blocat și circuitul devine un exemplu foarte clar de polaritate.",
    learns: ["sens invers", "blocare", "polaritate"],
    components: ["Baterie", "Diodă inversată", "Rezistor", "Bec"],
    circuit: makeCircuit(
      [
        component("bat_dr", "battery", -760, -100, { ...commonBattery }),
        component("d_reverse", "diode", -390, -100, { ...commonDiode, rot: 180 }),
        component("r_dr", "resistor", -30, -100, { R: 150 }),
        component("bulb_dr", "bulb", 340, -100, { ...smallBulb }),
      ],
      [
        wire("w1", "bat_dr_a", "d_reverse_b", [
          { x: -760, y: -280 },
          { x: -390, y: -280 },
        ]),
        wire("w2", "d_reverse_a", "r_dr_a"),
        wire("w3", "r_dr_b", "bulb_dr_a"),
        wire("w4", "bulb_dr_b", "bat_dr_b", [
          { x: 560, y: 160 },
          { x: -760, y: 160 },
        ]),
      ],
      0.52
    ),
  },
  {
    id: "redresor-jumatate-unda-didactic",
    categoryId: "diodes",
    title: "Redresor didactic cu două ramuri",
    level: "Avansat",
    badge: "Diode",
    description:
      "Două diode sunt așezate pe ramuri diferite: una conduce, cealaltă blochează. Este o demonstrație vizuală bună pentru sensul curentului.",
    learns: ["diode pe ramuri", "curent selectat", "sens unic"],
    components: ["Baterie", "D1", "D2", "R1", "R2", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_rd", "battery", -820, 0, { ...commonBattery }),
        component("amp_rd", "ammeter", -520, 0, { display: "—" }),
        component("d1_rd", "diode", -130, -170, { ...commonDiode }),
        component("r1_rd", "resistor", 250, -170, { R: 220 }),
        component("d2_rd", "diode", -130, 170, { ...commonDiode, rot: 180 }),
        component("r2_rd", "resistor", 250, 170, { R: 220 }),
      ],
      [
        wire("w1", "bat_rd_a", "amp_rd_a", [{ x: -670, y: -210 }]),
        wire("w2", "amp_rd_b", "d1_rd_a", [{ x: -330, y: -170 }]),
        wire("w3", "amp_rd_b", "d2_rd_b", [{ x: -330, y: 170 }]),
        wire("w4", "d1_rd_b", "r1_rd_a"),
        wire("w5", "d2_rd_a", "r2_rd_a"),
        wire("w6", "r1_rd_b", "bat_rd_b", [
          { x: 520, y: -170 },
          { x: 520, y: 320 },
          { x: -820, y: 320 },
        ]),
        wire("w7", "r2_rd_b", "bat_rd_b", [
          { x: 520, y: 170 },
          { x: 520, y: 320 },
          { x: -820, y: 320 },
        ]),
      ],
      0.45
    ),
  },
  {
    id: "npn-switch-bec",
    categoryId: "transistors",
    title: "NPN ca întrerupător pentru bec",
    level: "Avansat",
    badge: "NPN",
    description:
      "Curentul mic din bază pornește curentul mai mare prin bec. Este primul circuit pe care merită să-l testezi cu tranzistor.",
    learns: ["bază", "colector", "emitor", "comandă cu curent mic"],
    components: ["Baterie", "Bec", "NPN", "Rezistor bază"],
    circuit: makeCircuit(
      [
        component("bat_npn", "battery", -760, -120, { ...commonBattery }),
        component("bulb_npn", "bulb", -220, -220, { ...smallBulb }),
        component("q_npn", "transistor_npn", 220, -120, { ...commonNpn }),
        component("rb_npn", "resistor", -180, 130, { R: 10000 }),
      ],
      [
        wire("w1", "bat_npn_a", "bulb_npn_a", [
          { x: -760, y: -360 },
          { x: -220, y: -360 },
        ]),
        wire("w2", "bulb_npn_b", "q_npn_c", [
          { x: 20, y: -220 },
          { x: 20, y: -156 },
        ]),
        wire("w3", "q_npn_e", "bat_npn_b", [
          { x: 480, y: 260 },
          { x: -760, y: 260 },
        ]),
        wire("w4", "bat_npn_a", "rb_npn_a", [
          { x: -760, y: 130 },
        ]),
        wire("w5", "rb_npn_b", "q_npn_b"),
      ],
      0.5
    ),
  },
  {
    id: "npn-pot-control",
    categoryId: "transistors",
    title: "NPN controlat prin potențiometru",
    level: "Complex",
    badge: "NPN + Pot",
    description:
      "Potențiometrul schimbă rezistența de bază. Exemplul este calibrat ca la valori mici tranzistorul să pornească, iar spre valori mari să se oprească vizibil.",
    learns: ["control variabil", "polarizare bază", "tranzistor ca amplificator simplificat"],
    components: ["Baterie", "Potențiometru", "NPN", "Bec", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_np", "battery", -900, -140, { ...commonBattery }),
        component("amp_np", "ammeter", -570, -240, { display: "—" }),
        component("bulb_np", "bulb", -240, -240, { ...smallBulb }),
        component("q_np", "transistor_npn", 240, -140, { ...commonNpn }),
        component("pot_np", "potentiometer", -300, 160, {
          ...commonPot,
          Rmin: 0,
          Rmax: 100000,
          positionPct: 35,
          R: 35000,
        }),
      ],
      [
        wire("w1", "bat_np_a", "amp_np_a", [
          { x: -900, y: -400 },
          { x: -570, y: -400 },
        ]),
        wire("w2", "amp_np_b", "bulb_np_a"),
        wire("w3", "bulb_np_b", "q_np_c", [
          { x: 0, y: -240 },
          { x: 0, y: -176 },
        ]),
        wire("w4", "q_np_e", "bat_np_b", [
          { x: 520, y: 320 },
          { x: -900, y: 320 },
        ]),
        wire("w5", "bat_np_a", "pot_np_a", [
          { x: -900, y: 160 },
        ]),
        wire("w6", "pot_np_b", "q_np_b"),
      ],
      0.42
    ),
  },
  {
    id: "pnp-high-side-switch",
    categoryId: "transistors",
    title: "PNP ca întrerupător pe partea de plus",
    level: "Complex",
    badge: "PNP",
    description:
      "PNP-ul se pornește când baza este trasă spre minus prin rezistor. E invers față de NPN și ajută mult la înțelegere.",
    learns: ["PNP", "emitor spre plus", "bază trasă spre minus"],
    components: ["Baterie", "PNP", "Bec", "Rezistor bază"],
    circuit: makeCircuit(
      [
        component("bat_pnp", "battery", -760, -90, { ...commonBattery }),
        component("q_pnp", "transistor_pnp", -180, -90, { ...commonPnp }),
        component("bulb_pnp", "bulb", 330, -190, { ...smallBulb }),
        component("rb_pnp", "resistor", -180, 170, { R: 10000 }),
      ],
      [
        wire("w1", "bat_pnp_a", "q_pnp_e", [
          { x: -760, y: -300 },
          { x: 100, y: -300 },
          { x: -108, y: -54 },
        ]),
        wire("w2", "q_pnp_c", "bulb_pnp_a", [
          { x: -108, y: -126 },
          { x: 80, y: -190 },
        ]),
        wire("w3", "bulb_pnp_b", "bat_pnp_b", [
          { x: 560, y: 300 },
          { x: -760, y: 300 },
        ]),
        wire("w4", "q_pnp_b", "rb_pnp_a"),
        wire("w5", "rb_pnp_b", "bat_pnp_b", [
          { x: 80, y: 170 },
          { x: 80, y: 300 },
          { x: -760, y: 300 },
        ]),
      ],
      0.48
    ),
  },
  {
    id: "doua-surse-serie-curat",
    categoryId: "kirchhoff",
    title: "Două baterii în serie",
    level: "Avansat",
    badge: "Surse",
    description:
      "Două surse de 4.5V sunt puse în serie pentru a obține o tensiune totală mai mare pe circuit.",
    learns: ["surse în serie", "tensiune totală", "curent comun"],
    components: ["2 baterii", "Ampermetru", "Rezistor", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_s1", "battery", -880, -140, { ...battery45 }),
        component("bat_s2", "battery", -560, -140, { ...battery45 }),
        component("amp_s", "ammeter", -240, -140, { display: "—" }),
        component("r_s", "resistor", 90, -140, { R: 100 }),
        component("bulb_s", "bulb", 430, -140, { ...smallBulb }),
        component("volt_s", "voltmeter", 430, 140, { display: "—" }),
      ],
      [
        wire("w1", "bat_s1_b", "bat_s2_a"),
        wire("w2", "bat_s2_b", "amp_s_a"),
        wire("w3", "amp_s_b", "r_s_a"),
        wire("w4", "r_s_b", "bulb_s_a"),
        wire("w5", "bulb_s_b", "bat_s1_a", [
          { x: 660, y: 330 },
          { x: -1080, y: 330 },
        ]),
        wire("w6", "volt_s_a", "bulb_s_a", [
          { x: 250, y: 140 },
          { x: 250, y: -140 },
        ]),
        wire("w7", "volt_s_b", "bulb_s_b", [
          { x: 610, y: 140 },
          { x: 610, y: -140 },
        ]),
      ],
      0.42
    ),
  },
  {
    id: "kirchhoff-curenti-ramuri",
    categoryId: "kirchhoff",
    title: "Kirchhoff: curent total și curenți pe ramuri",
    level: "Complex",
    badge: "Kirchhoff",
    description:
      "Curentul total se împarte pe două ramuri paralele. Fiecare ramură are ampermetrul ei, ca să vezi diferența.",
    learns: ["legea nodurilor", "ramuri paralele", "curent total"],
    components: ["Baterie", "A total", "A ramură 1", "A ramură 2", "R1", "R2"],
    circuit: makeCircuit(
      [
        component("bat_kc", "battery", -900, 0, { ...battery12 }),
        component("amp_total", "ammeter", -620, 0, { display: "—" }),
        component("amp_top", "ammeter", -220, -210, { display: "—" }),
        component("r_top", "resistor", 180, -210, { R: 120 }),
        component("amp_bot", "ammeter", -220, 190, { display: "—" }),
        component("r_bot", "resistor", 180, 190, { R: 330 }),
        component("volt_kc", "voltmeter", 640, 0, { display: "—" }),
      ],
      [
        wire("w1", "bat_kc_a", "amp_total_a", [{ x: -760, y: -260 }]),
        wire("w2", "amp_total_b", "amp_top_a", [{ x: -420, y: -210 }]),
        wire("w3", "amp_total_b", "amp_bot_a", [{ x: -420, y: 190 }]),
        wire("w4", "amp_top_b", "r_top_a"),
        wire("w5", "amp_bot_b", "r_bot_a"),
        wire("w6", "r_top_b", "bat_kc_b", [
          { x: 450, y: -210 },
          { x: 450, y: 360 },
          { x: -900, y: 360 },
        ]),
        wire("w7", "r_bot_b", "bat_kc_b", [
          { x: 450, y: 190 },
          { x: 450, y: 360 },
          { x: -900, y: 360 },
        ]),
        wire("w8", "volt_kc_a", "amp_total_b", [
          { x: -420, y: 0 },
        ]),
        wire("w9", "volt_kc_b", "bat_kc_b", [
          { x: 450, y: 0 },
          { x: 450, y: 360 },
          { x: -900, y: 360 },
        ]),
      ],
      0.4
    ),
  },
  {
    id: "complex-lab-semiconductori",
    categoryId: "semiconductors",
    title: "Mini-laborator: diodă + potențiometru + NPN",
    level: "Foarte complex",
    badge: "Showcase",
    description:
      "Un circuit demonstrativ mai mare: dioda protejează sensul, potențiometrul comandă baza, iar NPN-ul controlează becul.",
    learns: ["protecție cu diodă", "polarizare variabilă", "tranzistor controlat"],
    components: ["Baterie", "Diodă", "Potențiometru", "NPN", "Bec", "A", "V"],
    circuit: makeCircuit(
      [
        component("bat_lab", "battery", -1080, -120, { ...battery12 }),
        component("d_lab", "diode", -760, -250, { ...commonDiode }),
        component("amp_lab", "ammeter", -430, -250, { display: "—" }),
        component("bulb_lab", "bulb", -80, -250, { ...smallBulb }),
        component("q_lab", "transistor_npn", 360, -120, { ...commonNpn }),
        component("pot_lab", "potentiometer", -520, 180, {
          ...commonPot,
          Rmin: 0,
          Rmax: 100000,
          positionPct: 35,
          R: 35000,
        }),
        component("volt_lab", "voltmeter", 360, 180, { display: "—" }),
      ],
      [
        wire("w1", "bat_lab_a", "d_lab_a", [
          { x: -1080, y: -430 },
          { x: -760, y: -430 },
        ]),
        wire("w2", "d_lab_b", "amp_lab_a"),
        wire("w3", "amp_lab_b", "bulb_lab_a"),
        wire("w4", "bulb_lab_b", "q_lab_c", [
          { x: 150, y: -250 },
          { x: 150, y: -156 },
        ]),
        wire("w5", "q_lab_e", "bat_lab_b", [
          { x: 650, y: 380 },
          { x: -1080, y: 380 },
        ]),
        wire("w6", "bat_lab_a", "pot_lab_a", [
          { x: -1080, y: 180 },
        ]),
        wire("w7", "pot_lab_b", "q_lab_b", [
          { x: -210, y: 180 },
          { x: -210, y: -120 },
        ]),
        wire("w8", "volt_lab_a", "q_lab_c", [
          { x: 150, y: 180 },
          { x: 150, y: -156 },
        ]),
        wire("w9", "volt_lab_b", "q_lab_e", [
          { x: 650, y: 180 },
          { x: 650, y: -84 },
        ]),
      ],
      0.36
    ),
  },
  {
    id: "eroare-ampermetru-paralel",
    categoryId: "debug",
    title: "Greșeală: ampermetru în paralel",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Exemplu intenționat greșit. Ampermetrul este pus în paralel pe bec și poate produce scurtcircuit.",
    diagnostic: "Ampermetrul are rezistență foarte mică și este pus în paralel cu becul. Practic creează o cale ușoară pentru curent, deci trebuie mutat în serie.",
    learns: ["de ce ampermetrul se pune în serie", "scurtcircuit", "avertizări inteligente"],
    components: ["Baterie", "Bec", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_err_a", "battery", -430, -100, { ...commonBattery }),
        component("bulb_err_a", "bulb", 230, -100, { ...smallBulb }),
        component("amp_err_a", "ammeter", 230, 160, { display: "—" }),
      ],
      [
        wire("w1", "bat_err_a_a", "bulb_err_a_a", [
          { x: -430, y: -280 },
          { x: 230, y: -280 },
        ]),
        wire("w2", "bulb_err_a_b", "bat_err_a_b", [
          { x: 480, y: 320 },
          { x: -430, y: 320 },
        ]),
        wire("w3", "amp_err_a_a", "bulb_err_a_a", [
          { x: 50, y: 160 },
          { x: 50, y: -100 },
        ]),
        wire("w4", "amp_err_a_b", "bulb_err_a_b", [
          { x: 410, y: 160 },
          { x: 410, y: -100 },
        ]),
      ],
      0.58
    ),
  },
  {
    id: "eroare-dioda-inversa-controlata",
    categoryId: "debug",
    title: "Debug: de ce nu se aprinde becul?",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Circuitul pare corect la prima vedere, dar dioda este inversată. E util pentru a explica depanarea circuitelor.",
    diagnostic: "Dioda este montată invers față de sensul curentului. În Inspector, dioda va rămâne blocată, iar becul nu primește curent.",
    learns: ["depanare", "polaritate", "citirea diodei"],
    components: ["Baterie", "Diodă inversată", "Rezistor", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_dbg", "battery", -780, -120, { ...commonBattery }),
        component("d_dbg", "diode", -420, -120, { ...commonDiode, rot: 180 }),
        component("r_dbg", "resistor", -60, -120, { R: 100 }),
        component("bulb_dbg", "bulb", 300, -120, { ...smallBulb }),
        component("volt_dbg", "voltmeter", -420, 150, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_a", "d_dbg_b", [
          { x: -780, y: -300 },
          { x: -420, y: -300 },
        ]),
        wire("w2", "d_dbg_a", "r_dbg_a"),
        wire("w3", "r_dbg_b", "bulb_dbg_a"),
        wire("w4", "bulb_dbg_b", "bat_dbg_b", [
          { x: 540, y: 310 },
          { x: -780, y: 310 },
        ]),
        wire("w5", "volt_dbg_a", "d_dbg_a", [
          { x: -600, y: 150 },
          { x: -600, y: -120 },
        ]),
        wire("w6", "volt_dbg_b", "d_dbg_b", [
          { x: -240, y: 150 },
          { x: -240, y: -120 },
        ]),
      ],
      0.5
    ),
  },,
  {
    id: "debug-voltmetru-serie-alambicat",
    categoryId: "debug",
    title: "DEBUG 01: voltmetrul omoară circuitul",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Circuitul pare sofisticat, are două becuri și măsurare, dar unul dintre aparate este pus greșit și circuitul nu se comportă cum ai aștepta.",
    diagnostic:
      "Voltmetrul este introdus în serie pe ramura principală. Un voltmetru trebuie pus în paralel, fiindcă are rezistență foarte mare și blochează curentul.",
    learns: ["voltmetru în serie", "circuit aproape întrerupt", "măsurare corectă"],
    components: ["Baterie", "Voltmetru", "Rezistor", "2 becuri", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_dbg_v", "battery", -1050, -120, { ...commonBattery }),
        component("volt_dbg_v", "voltmeter", -720, -260, { display: "—" }),
        component("r_dbg_v", "resistor", -380, -260, { R: 220 }),
        component("bulb_dbg_v1", "bulb", -20, -260, { ...smallBulb }),
        component("bulb_dbg_v2", "bulb", 340, -40, { ...smallBulb }),
        component("amp_dbg_v", "ammeter", -380, 160, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_v_a", "volt_dbg_v_a", [
          { x: -1050, y: -430 },
          { x: -720, y: -430 },
        ]),
        wire("w2", "volt_dbg_v_b", "r_dbg_v_a"),
        wire("w3", "r_dbg_v_b", "bulb_dbg_v1_a"),
        wire("w4", "bulb_dbg_v1_b", "bulb_dbg_v2_a", [
          { x: 180, y: -260 },
          { x: 180, y: -40 },
        ]),
        wire("w5", "bulb_dbg_v2_b", "amp_dbg_v_a", [
          { x: 560, y: 160 },
          { x: -560, y: 160 },
        ]),
        wire("w6", "amp_dbg_v_b", "bat_dbg_v_b", [
          { x: -560, y: 320 },
          { x: -1050, y: 320 },
        ]),
      ],
      0.39
    ),
  },
  {
    id: "debug-npn-fara-rezistor-baza",
    categoryId: "debug",
    title: "DEBUG 02: NPN comandat brutal",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Becul este comandat de un tranzistor, dar baza este legată direct la baterie. În practică e o greșeală gravă; în simulator trebuie observată lipsa rezistorului de bază.",
    diagnostic:
      "Baza tranzistorului NPN trebuie alimentată printr-un rezistor. Fără rezistor, curentul de bază nu este limitat și schema nu este corectă didactic.",
    learns: ["rezistor de bază", "limitarea curentului", "tranzistor NPN"],
    components: ["Baterie", "NPN", "Bec", "Ampermetru", "fir direct spre bază"],
    circuit: makeCircuit(
      [
        component("bat_dbg_npn0", "battery", -900, -120, { ...commonBattery }),
        component("amp_dbg_npn0", "ammeter", -590, -260, { display: "—" }),
        component("bulb_dbg_npn0", "bulb", -250, -260, { ...smallBulb }),
        component("q_dbg_npn0", "transistor_npn", 240, -120, { ...commonNpn, RonCE: 25 }),
        component("volt_dbg_npn0", "voltmeter", 240, 180, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_npn0_a", "amp_dbg_npn0_a", [
          { x: -900, y: -430 },
          { x: -590, y: -430 },
        ]),
        wire("w2", "amp_dbg_npn0_b", "bulb_dbg_npn0_a"),
        wire("w3", "bulb_dbg_npn0_b", "q_dbg_npn0_c", [
          { x: 0, y: -260 },
          { x: 0, y: -156 },
        ]),
        wire("w4", "q_dbg_npn0_e", "bat_dbg_npn0_b", [
          { x: 540, y: 350 },
          { x: -900, y: 350 },
        ]),
        wire("w5", "bat_dbg_npn0_a", "q_dbg_npn0_b", [
          { x: -900, y: 110 },
          { x: -40, y: 110 },
          { x: -40, y: -120 },
        ]),
        wire("w6", "volt_dbg_npn0_a", "q_dbg_npn0_c", [
          { x: 0, y: 180 },
          { x: 0, y: -156 },
        ]),
        wire("w7", "volt_dbg_npn0_b", "q_dbg_npn0_e", [
          { x: 540, y: 180 },
          { x: 540, y: -84 },
        ]),
      ],
      0.4
    ),
  },
  {
    id: "debug-pnp-baza-la-plus",
    categoryId: "debug",
    title: "DEBUG 03: PNP care nu pornește",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Schema folosește PNP pe partea de plus, dar baza este dusă tot spre plus. Pare logic la început, dar PNP-ul nu se deschide așa.",
    diagnostic:
      "La PNP, emitorul stă spre plus, iar baza trebuie trasă mai jos decât emitorul, adică spre minus prin rezistor. Aici baza este ținută la plus, deci tranzistorul rămâne blocat.",
    learns: ["PNP", "bază trasă spre minus", "comandă high-side"],
    components: ["Baterie", "PNP", "Bec", "Rezistor bază", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_dbg_pnp", "battery", -900, -90, { ...commonBattery }),
        component("q_dbg_pnp", "transistor_pnp", -280, -90, { ...commonPnp }),
        component("bulb_dbg_pnp", "bulb", 280, -210, { ...smallBulb }),
        component("rb_dbg_pnp", "resistor", -280, 180, { R: 1000 }),
        component("volt_dbg_pnp", "voltmeter", 280, 130, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_pnp_a", "q_dbg_pnp_e", [
          { x: -900, y: -350 },
          { x: 40, y: -350 },
          { x: -208, y: -54 },
        ]),
        wire("w2", "q_dbg_pnp_c", "bulb_dbg_pnp_a", [
          { x: -208, y: -126 },
          { x: 40, y: -210 },
        ]),
        wire("w3", "bulb_dbg_pnp_b", "bat_dbg_pnp_b", [
          { x: 520, y: 350 },
          { x: -900, y: 350 },
        ]),
        wire("w4", "q_dbg_pnp_b", "rb_dbg_pnp_a"),
        wire("w5", "rb_dbg_pnp_b", "bat_dbg_pnp_a", [
          { x: 40, y: 180 },
          { x: 40, y: -350 },
          { x: -900, y: -350 },
        ]),
        wire("w6", "volt_dbg_pnp_a", "bulb_dbg_pnp_a", [
          { x: 80, y: 130 },
          { x: 80, y: -210 },
        ]),
        wire("w7", "volt_dbg_pnp_b", "bulb_dbg_pnp_b", [
          { x: 520, y: 130 },
          { x: 520, y: -210 },
        ]),
      ],
      0.39
    ),
  },
  {
    id: "debug-condensator-supratensionat-complex",
    categoryId: "debug",
    title: "DEBUG 04: condensator supratensionat",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Circuitul are rezistor, diodă și voltmetru, dar condensatorul are tensiune maximă prea mică pentru bateria folosită.",
    diagnostic:
      "Condensatorul este setat la Vmax = 3V, dar este pus într-un circuit alimentat la 12V. Trebuie ales un condensator cu Vmax mai mare sau redusă tensiunea sursei.",
    learns: ["Vmax condensator", "protecția componentelor", "citire voltmetru"],
    components: ["Baterie 12V", "Diodă", "Rezistor", "Condensator Vmax 3V", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_dbg_cap", "battery", -980, -100, { ...battery12 }),
        component("d_dbg_cap", "diode", -650, -250, { ...commonDiode }),
        component("r_dbg_cap", "resistor", -300, -250, { R: 120 }),
        component("cap_dbg_cap", "capacitor", 120, -250, {
          ...commonCapacitor,
          Vmax: 3,
          C: 0.001,
          capVoltage: 0,
          chargeTimeSec: 1.5,
        }),
        component("volt_dbg_cap", "voltmeter", 120, 120, { display: "—" }),
        component("bulb_dbg_cap", "bulb", 540, -250, { ...smallBulb }),
      ],
      [
        wire("w1", "bat_dbg_cap_a", "d_dbg_cap_a", [
          { x: -980, y: -430 },
          { x: -650, y: -430 },
        ]),
        wire("w2", "d_dbg_cap_b", "r_dbg_cap_a"),
        wire("w3", "r_dbg_cap_b", "cap_dbg_cap_a"),
        wire("w4", "cap_dbg_cap_b", "bulb_dbg_cap_a"),
        wire("w5", "bulb_dbg_cap_b", "bat_dbg_cap_b", [
          { x: 760, y: 330 },
          { x: -980, y: 330 },
        ]),
        wire("w6", "volt_dbg_cap_a", "cap_dbg_cap_a", [
          { x: -60, y: 120 },
          { x: -60, y: -250 },
        ]),
        wire("w7", "volt_dbg_cap_b", "cap_dbg_cap_b", [
          { x: 300, y: 120 },
          { x: 300, y: -250 },
        ]),
      ],
      0.36
    ),
  },
  {
    id: "debug-scurtcircuit-baterie-ascuns",
    categoryId: "debug",
    title: "DEBUG 05: scurtcircuit ascuns într-o ramură",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Pe lângă ramura cu bec există o ramură de fir aproape directă între bornele bateriei. La prima vedere circuitul pare doar paralel.",
    diagnostic:
      "Ramura de jos ocolește consumatorii și leagă aproape direct plusul cu minusul bateriei. Curentul preferă drumul cu rezistență foarte mică, deci apare scurtcircuit.",
    learns: ["scurtcircuit", "ramură paralelă greșită", "depanare vizuală"],
    components: ["Baterie", "Bec", "Rezistor", "Ampermetru", "fir de bypass"],
    circuit: makeCircuit(
      [
        component("bat_dbg_short", "battery", -860, -80, { ...commonBattery }),
        component("amp_dbg_short", "ammeter", -520, -230, { display: "—" }),
        component("r_dbg_short", "resistor", -160, -230, { R: 330 }),
        component("bulb_dbg_short", "bulb", 220, -230, { ...smallBulb }),
        component("volt_dbg_short", "voltmeter", 220, 110, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_short_a", "amp_dbg_short_a", [
          { x: -860, y: -390 },
          { x: -520, y: -390 },
        ]),
        wire("w2", "amp_dbg_short_b", "r_dbg_short_a"),
        wire("w3", "r_dbg_short_b", "bulb_dbg_short_a"),
        wire("w4", "bulb_dbg_short_b", "bat_dbg_short_b", [
          { x: 480, y: 300 },
          { x: -860, y: 300 },
        ]),
        wire("w5", "bat_dbg_short_a", "bat_dbg_short_b", [
          { x: -860, y: 110 },
          { x: -520, y: 110 },
          { x: -520, y: 300 },
        ]),
        wire("w6", "volt_dbg_short_a", "bulb_dbg_short_a", [
          { x: 40, y: 110 },
          { x: 40, y: -230 },
        ]),
        wire("w7", "volt_dbg_short_b", "bulb_dbg_short_b", [
          { x: 400, y: 110 },
          { x: 400, y: -230 },
        ]),
      ],
      0.42
    ),
  },
  {
    id: "debug-potentiometru-la-minim-prea-mic",
    categoryId: "debug",
    title: "DEBUG 06: potențiometru lăsat prea jos",
    level: "Debug",
    badge: "DEBUG",
    description:
      "Potențiometrul controlează baza unui NPN, dar valoarea curentă este aproape minimă. Circuitul funcționează, însă poate suprasolicita comanda bazei.",
    diagnostic:
      "Sliderul potențiometrului este aproape de minim, deci rezistența de bază este prea mică. Mută sliderul spre valori mai mari și compară curentul prin circuit.",
    learns: ["potențiometru", "rezistență de bază", "control gradual"],
    components: ["Baterie", "Potențiometru", "NPN", "Bec", "A", "V"],
    circuit: makeCircuit(
      [
        component("bat_dbg_pot", "battery", -980, -120, { ...commonBattery }),
        component("amp_dbg_pot", "ammeter", -660, -260, { display: "—" }),
        component("bulb_dbg_pot", "bulb", -300, -260, { ...smallBulb }),
        component("q_dbg_pot", "transistor_npn", 220, -120, { ...commonNpn }),
        component("pot_dbg_pot", "potentiometer", -360, 190, {
          ...commonPot,
          Rmin: 0,
          Rmax: 100000,
          positionPct: 1,
          R: 1000,
        }),
        component("volt_dbg_pot", "voltmeter", 220, 190, { display: "—" }),
      ],
      [
        wire("w1", "bat_dbg_pot_a", "amp_dbg_pot_a", [
          { x: -980, y: -430 },
          { x: -660, y: -430 },
        ]),
        wire("w2", "amp_dbg_pot_b", "bulb_dbg_pot_a"),
        wire("w3", "bulb_dbg_pot_b", "q_dbg_pot_c", [
          { x: -30, y: -260 },
          { x: -30, y: -156 },
        ]),
        wire("w4", "q_dbg_pot_e", "bat_dbg_pot_b", [
          { x: 520, y: 360 },
          { x: -980, y: 360 },
        ]),
        wire("w5", "bat_dbg_pot_a", "pot_dbg_pot_a", [
          { x: -980, y: 190 },
        ]),
        wire("w6", "pot_dbg_pot_b", "q_dbg_pot_b"),
        wire("w7", "volt_dbg_pot_a", "q_dbg_pot_c", [
          { x: -30, y: 190 },
          { x: -30, y: -156 },
        ]),
        wire("w8", "volt_dbg_pot_b", "q_dbg_pot_e", [
          { x: 520, y: 190 },
          { x: 520, y: -84 },
        ]),
      ],
      0.38
    ),
  }
];

function categoryColor(categoryId) {
  if (categoryId === "debug") return "text-rose-100 bg-rose-400/15 border-rose-300/25";
  if (categoryId === "errors") return "text-rose-200 bg-rose-300/10 border-rose-300/20";
  if (categoryId === "capacitors") return "text-cyan-100 bg-cyan-300/10 border-cyan-300/20";
  if (categoryId === "measure") return "text-emerald-100 bg-emerald-300/10 border-emerald-300/20";
  if (categoryId === "resistors") return "text-amber-100 bg-amber-300/10 border-amber-300/20";
  if (categoryId === "diodes") return "text-pink-100 bg-pink-300/10 border-pink-300/20";
  if (categoryId === "transistors") return "text-fuchsia-100 bg-fuchsia-300/10 border-fuchsia-300/20";
  if (categoryId === "semiconductors") return "text-fuchsia-100 bg-fuchsia-300/10 border-fuchsia-300/20";
  if (categoryId === "control") return "text-blue-100 bg-blue-300/10 border-blue-300/20";
  if (categoryId === "kirchhoff") return "text-violet-100 bg-violet-300/10 border-violet-300/20";
  return "text-white/70 bg-white/5 border-white/10";
}

function levelColor(level) {
  if (level === "Debug") return "border-rose-300/25 bg-rose-400/15 text-rose-100";
  if (level === "Foarte complex") return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
  if (level === "Complex") return "border-violet-300/20 bg-violet-300/10 text-violet-100";
  if (level === "Avansat") return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  if (level === "Avertizare") return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  if (level === "Mediu") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function miniType(type) {
  if (type === "battery") return "B";
  if (type === "resistor") return "R";
  if (type === "potentiometer") return "P";
  if (type === "capacitor") return "C";
  if (type === "diode") return "D";
  if (type === "transistor_npn") return "NPN";
  if (type === "transistor_pnp") return "PNP";
  if (type === "bulb") return "L";
  if (type === "switch") return "K";
  if (type === "voltmeter") return "V";
  if (type === "ammeter") return "A";
  if (type === "ohmmeter") return "Ω";
  return type.slice(0, 2).toUpperCase();
}

function itemAccent(type) {
  if (type === "battery") return "#22d3ee";
  if (type === "bulb") return "#facc15";
  if (type === "diode") return "#f0abfc";
  if (type === "transistor_npn" || type === "transistor_pnp") return "#c084fc";
  if (type === "potentiometer") return "#60a5fa";
  if (type === "capacitor") return "#67e8f9";
  if (type === "voltmeter" || type === "ammeter" || type === "ohmmeter") return "#86efac";
  return "#e5e7eb";
}

function nodeMapFor(circuit) {
  return new Map(circuit.nodes.map((node) => [node.id, node]));
}

function previewBounds(circuit) {
  const xs = [];
  const ys = [];

  circuit.items.forEach((item) => {
    xs.push(item.x - 110, item.x + 110);
    ys.push(item.y - 85, item.y + 85);
  });

  circuit.nodes.forEach((node) => {
    xs.push(node.x);
    ys.push(node.y);
  });

  circuit.wires.forEach((wire) => {
    (wire.points ?? []).forEach((point) => {
      xs.push(point.x);
      ys.push(point.y);
    });
  });

  if (!xs.length || !ys.length) {
    return { minX: -500, minY: -250, maxX: 500, maxY: 250 };
  }

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function makeProjector(circuit) {
  const box = previewBounds(circuit);
  const viewW = 840;
  const viewH = 320;
  const pad = 34;
  const spanX = Math.max(1, box.maxX - box.minX);
  const spanY = Math.max(1, box.maxY - box.minY);
  const scale = Math.min((viewW - pad * 2) / spanX, (viewH - pad * 2) / spanY);
  const usedW = spanX * scale;
  const usedH = spanY * scale;
  const offsetX = (viewW - usedW) / 2;
  const offsetY = (viewH - usedH) / 2;

  return {
    viewW,
    viewH,
    map(point) {
      return {
        x: offsetX + (point.x - box.minX) * scale,
        y: offsetY + (point.y - box.minY) * scale,
      };
    },
  };
}

function wirePolyline(wire, nodes, project) {
  const a = nodes.get(wire.aNodeId);
  const b = nodes.get(wire.bNodeId);
  if (!a || !b) return "";

  const points = [a, ...(wire.points ?? []), b].map(project.map);
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function PreviewSymbol({ item, project }) {
  const p = project.map({ x: item.x, y: item.y });
  const rot = Number(item.rot ?? 0);
  const accent = itemAccent(item.type);
  const stroke = "rgba(255,255,255,0.88)";
  const muted = "rgba(255,255,255,0.55)";
  const label = miniType(item.type);

  const commonProps = {
    transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rot})`,
  };

  if (item.type === "battery") {
    return (
      <g {...commonProps}>
        <line x1="-36" y1="0" x2="-12" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="0" x2="42" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="-10" y1="-18" x2="-10" y2="18" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="-26" x2="14" y2="26" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <text x="22" y="-24" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">+</text>
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={muted} fontWeight="800">B</text>
      </g>
    );
  }

  if (item.type === "resistor" || item.type === "potentiometer") {
    return (
      <g {...commonProps}>
        <line x1="-48" y1="0" x2="-28" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="0" x2="48" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <rect x="-28" y="-13" width="56" height="26" rx="4" fill="rgba(255,255,255,0.05)" stroke={stroke} strokeWidth="2.5" />
        {item.type === "potentiometer" && (
          <g>
            <line x1="-5" y1="30" x2="18" y2="7" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <path d="M18 7 L10 9 L16 15 Z" fill={accent} />
          </g>
        )}
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">{label}</text>
      </g>
    );
  }

  if (item.type === "capacitor") {
    return (
      <g {...commonProps}>
        <line x1="-46" y1="0" x2="-12" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="0" x2="46" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="-8" y1="-24" x2="-8" y2="24" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="-24" x2="8" y2="24" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">C</text>
      </g>
    );
  }

  if (item.type === "diode") {
    return (
      <g {...commonProps}>
        <line x1="-48" y1="0" x2="-21" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="0" x2="48" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M-20 -20 L-20 20 L17 0 Z" fill="rgba(240,171,252,0.16)" stroke={accent} strokeWidth="2.5" />
        <line x1="21" y1="-22" x2="21" y2="22" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">D</text>
      </g>
    );
  }

  if (item.type === "bulb") {
    return (
      <g {...commonProps}>
        <line x1="-50" y1="0" x2="-27" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="27" y1="0" x2="50" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="0" r="27" fill="rgba(250,204,21,0.08)" stroke={accent} strokeWidth="2.5" />
        <path d="M-16 -15 L16 15 M16 -15 L-16 15" stroke={accent} strokeWidth="2.3" strokeLinecap="round" />
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">L</text>
      </g>
    );
  }

  if (item.type === "switch") {
    return (
      <g {...commonProps}>
        <line x1="-48" y1="0" x2="-15" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="0" x2="48" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="-14" cy="0" r="4" fill={stroke} />
        <circle cx="18" cy="0" r="4" fill={stroke} />
        <line x1="-14" y1="0" x2={item.closed ? "18" : "16"} y2={item.closed ? "0" : "-22"} stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <text x="0" y="45" textAnchor="middle" fontSize="11" fill={accent} fontWeight="800">K</text>
      </g>
    );
  }

  if (item.type === "transistor_npn" || item.type === "transistor_pnp") {
    const pnp = item.type === "transistor_pnp";
    return (
      <g {...commonProps}>
        <circle cx="0" cy="0" r="34" fill="rgba(192,132,252,0.08)" stroke={accent} strokeWidth="2.3" />
        <line x1="-45" y1="0" x2="-12" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="-12" y1="-26" x2="-12" y2="26" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="-12" y1="-16" x2="36" y2="-40" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="-12" y1="16" x2="36" y2="40" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d={pnp ? "M4 8 L-7 13 L-2 2 Z" : "M25 30 L36 40 L21 39 Z"} fill={accent} />
        <text x="0" y="52" textAnchor="middle" fontSize="10" fill={accent} fontWeight="800">{pnp ? "PNP" : "NPN"}</text>
      </g>
    );
  }

  if (item.type === "voltmeter" || item.type === "ammeter" || item.type === "ohmmeter") {
    return (
      <g {...commonProps}>
        <line x1="-48" y1="0" x2="-27" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <line x1="27" y1="0" x2="48" y2="0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="0" r="27" fill="rgba(134,239,172,0.07)" stroke={accent} strokeWidth="2.5" />
        <text x="0" y="8" textAnchor="middle" fontSize="21" fill={accent} fontWeight="900">{label}</text>
      </g>
    );
  }

  return (
    <g {...commonProps}>
      <rect x="-30" y="-20" width="60" height="40" rx="10" fill="rgba(255,255,255,0.06)" stroke={stroke} />
      <text x="0" y="5" textAnchor="middle" fontSize="12" fill={accent} fontWeight="900">{label}</text>
    </g>
  );
}

function ExamplePreview({ example }) {
  const circuit = example.circuit;
  const nodes = nodeMapFor(circuit);
  const project = makeProjector(circuit);

  return (
    <div className="relative h-56 overflow-hidden rounded-3xl border border-white/10 bg-[#07101b] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_45%)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${project.viewW} ${project.viewH}`} role="img" aria-label={`Preview circuit: ${example.title}`}>
        <defs>
          <pattern id={`grid-${example.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          </pattern>
          <filter id={`glow-${example.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={project.viewW} height={project.viewH} fill={`url(#grid-${example.id})`} />

        {circuit.wires.map((wire) => {
          const points = wirePolyline(wire, nodes, project);
          if (!points) return null;

          return (
            <g key={wire.id}>
              <polyline points={points} fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={points} fill="none" stroke="rgba(148,220,255,0.82)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        <g filter={`url(#glow-${example.id})`}>
          {circuit.items.map((item) => (
            <PreviewSymbol key={item.id} item={item} project={project} />
          ))}
        </g>
      </svg>

      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 backdrop-blur">
        {circuit.items.length} componente · {circuit.wires.length} fire
      </div>
    </div>
  );
}

export default function Examples() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);

  const visibleExamples = useMemo(() => {
    if (categoryId === "all") return EXAMPLES;
    return EXAMPLES.filter((example) => example.categoryId === categoryId);
  }, [categoryId]);

  const selected = useMemo(() => {
    const stillVisible = visibleExamples.find((x) => x.id === selectedId);
    if (stillVisible) return stillVisible;
    return visibleExamples[0] ?? EXAMPLES[0];
  }, [selectedId, visibleExamples]);

  const stats = useMemo(() => {
    const complex = EXAMPLES.filter((x) => x.level === "Complex" || x.level === "Foarte complex").length;
    const semiconductor = EXAMPLES.filter((x) => x.categoryId === "semiconductors" || x.categoryId === "control").length;
    return { total: EXAMPLES.length, complex, semiconductor };
  }, []);

  function selectCategory(id) {
    setCategoryId(id);

    const first = id === "all" ? EXAMPLES[0] : EXAMPLES.find((x) => x.categoryId === id);
    if (first) setSelectedId(first.id);
  }

  function testExample(example) {
    localStorage.setItem(LOAD_KEY, JSON.stringify(example.circuit));
    navigate("/");
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0b0f17] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute left-[35%] top-[20%] h-[360px] w-[360px] rounded-full bg-fuchsia-500/5 blur-[90px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
          <div className="grid gap-8 p-7 lg:grid-cols-[1.12fr_0.88fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Exemple VoltLab
                </span>
                <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                  semiconductori · potențiometru · circuite curate
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Circuite gata făcute, mai clare și mai spectaculoase.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                Exemplele sunt aranjate pe canvas cu spațiu între componente, fire ortogonale și categorii mai utile. Sunt incluse circuite simple pentru început, apoi exemple complexe cu diode, tranzistori și potențiometru.
              </p>

              <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-black text-cyan-100">{stats.total}</div>
                  <div className="mt-1 text-xs text-white/50">exemple totale</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-black text-violet-100">{stats.complex}</div>
                  <div className="mt-1 text-xs text-white/50">complexe</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-black text-fuchsia-100">{stats.semiconductor}</div>
                  <div className="mt-1 text-xs text-white/50">cu semiconductori</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
              <ExamplePreview example={selected} />
              <div className="mt-4 text-sm font-bold text-white">Previzualizare rapidă</div>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Previzualizarea desenează circuitul în miniatură, cu fire și simboluri apropiate de canvas. Apasă TESTEAZĂ pentru a-l încărca în laborator.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-3">
          <div className="voltlab-scroll flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const active = cat.id === categoryId;

              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={[
                    "shrink-0 rounded-2xl border px-4 py-2 text-sm font-bold transition",
                    active
                      ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-black/15 text-white/60 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[430px_1fr]">
          <aside className="voltlab-scroll max-h-[calc(100vh-230px)] overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Exemple</div>
              <div className="text-xs text-white/40">{visibleExamples.length}</div>
            </div>

            <div className="mt-2 grid gap-2">
              {visibleExamples.map((example) => {
                const active = example.id === selected.id;

                return (
                  <button
                    key={example.id}
                    onClick={() => setSelectedId(example.id)}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      active
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{example.title}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${levelColor(example.level)}`}>
                            {example.level}
                          </span>
                          <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${categoryColor(example.categoryId)}`}>
                            {example.badge}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/45">
                        {example.circuit.items.length} comp.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryColor(selected.categoryId)}`}>
                    {selected.badge}
                  </span>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${levelColor(selected.level)}`}>
                    {selected.level}
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white">{selected.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">{selected.description}</p>
              </div>

              <button
                onClick={() => testExample(selected)}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              >
                TESTEAZĂ
              </button>
            </div>

            <div className="mt-6">
              <ExamplePreview example={selected} />
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-bold text-white">Ce înveți din exemplul acesta</div>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {selected.learns.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-bold text-white">Componente folosite</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.components.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selected.diagnostic && (
              <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm leading-7 text-rose-50/85">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-rose-100/75">Ce nu e ok?</div>
                {selected.diagnostic}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5 text-sm leading-7 text-cyan-50/80">
              După ce apeși <b>TESTEAZĂ</b>, circuitul se încarcă în laborator. Pentru exemplele cu potențiometru, selectează potențiometrul și mișcă sliderul din Inspector.
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
