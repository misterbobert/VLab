import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOAD_KEY = "voltlab:loadExample";

function component(id, type, x, y, props = {}) {
  return {
    item: {
      id,
      type,
      x,
      y,
      sizePct: 100,
      rot: 0,
      ...props,
    },
    nodes: [
      {
        id: `${id}_a`,
        itemId: id,
        name: "a",
        lx: -80,
        ly: 0,
        x: x - 80,
        y,
      },
      {
        id: `${id}_b`,
        itemId: id,
        name: "b",
        lx: 80,
        ly: 0,
        x: x + 80,
        y,
      },
    ],
  };
}

function wire(id, aNodeId, bNodeId, points = []) {
  return {
    id,
    aNodeId,
    bNodeId,
    points,
  };
}

function makeCircuit(parts, wires, zoom = 0.64) {
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

const CATEGORIES = [
  { id: "all", label: "Toate" },
  { id: "basic", label: "Bază" },
  { id: "measure", label: "Măsurători" },
  { id: "resistors", label: "Rezistori" },
  { id: "capacitors", label: "Condensatori" },
  { id: "kirchhoff", label: "Kirchhoff" },
  { id: "errors", label: "Greșeli" },
];

const EXAMPLES = [
  {
    id: "bec-simplu",
    categoryId: "basic",
    title: "Bec simplu alimentat de baterie",
    level: "Începător",
    badge: "Bază",
    description:
      "Circuit simplu cu o baterie și un bec. Plusul bateriei este conectat la plusul becului, iar minusul la minus.",
    learns: [
      "ce înseamnă circuit închis",
      "cum bateria alimentează un consumator",
      "cum apare luminozitatea becului",
    ],
    components: ["Baterie", "Bec"],
    circuit: makeCircuit(
      [
        component("bat1", "battery", -260, -90, { ...commonBattery }),
        component("bulb1", "bulb", 260, -90, { ...commonBulb }),
      ],
      [
        wire("w1", "bat1_a", "bulb1_a", [{ x: 0, y: -220 }]),
        wire("w2", "bulb1_b", "bat1_b", [{ x: 0, y: 130 }]),
      ],
      0.75
    ),
  },
  {
    id: "rezistor-bec-serie",
    categoryId: "resistors",
    title: "Rezistor în serie cu bec",
    level: "Începător",
    badge: "Rezistor",
    description:
      "Rezistorul limitează curentul prin bec. Cu cât rezistența este mai mare, cu atât becul luminează mai slab.",
    learns: [
      "legea lui Ohm",
      "rolul rezistorului",
      "scăderea curentului într-un circuit serie",
    ],
    components: ["Baterie", "Rezistor", "Bec"],
    circuit: makeCircuit(
      [
        component("bat2", "battery", -420, -110, { ...commonBattery }),
        component("res2", "resistor", -80, -110, { R: 100 }),
        component("bulb2", "bulb", 300, -110, {
          ...commonBulb,
          Pnom: 1,
          ratedPowerW: 1,
        }),
      ],
      [
        wire("w1", "bat2_a", "res2_a", [{ x: -250, y: -240 }]),
        wire("w2", "res2_b", "bulb2_a", [{ x: 110, y: -110 }]),
        wire("w3", "bulb2_b", "bat2_b", [
          { x: 470, y: 150 },
          { x: -250, y: 150 },
        ]),
      ],
      0.68
    ),
  },
  {
    id: "intrerupator",
    categoryId: "basic",
    title: "Circuit controlat cu întrerupător",
    level: "Începător",
    badge: "Control",
    description:
      "Întrerupătorul controlează dacă circuitul este închis sau deschis. Poți schimba starea lui din Inspector.",
    learns: ["circuit deschis", "circuit închis", "controlul curentului"],
    components: ["Baterie", "Întrerupător", "Bec"],
    circuit: makeCircuit(
      [
        component("bat3", "battery", -430, -110, { ...commonBattery }),
        component("sw3", "switch", -80, -110, { closed: true }),
        component("bulb3", "bulb", 300, -110, { ...commonBulb }),
      ],
      [
        wire("w1", "bat3_a", "sw3_a", [{ x: -255, y: -240 }]),
        wire("w2", "sw3_b", "bulb3_a", [{ x: 110, y: -110 }]),
        wire("w3", "bulb3_b", "bat3_b", [
          { x: 470, y: 150 },
          { x: -255, y: 150 },
        ]),
      ],
      0.68
    ),
  },
  {
    id: "voltmetru-paralel",
    categoryId: "measure",
    title: "Voltmetru conectat corect pe bec",
    level: "Mediu",
    badge: "Măsurători",
    description:
      "Voltmetrul este conectat în paralel cu becul. Așa se măsoară tensiunea pe un element.",
    learns: [
      "voltmetrul se conectează în paralel",
      "măsurarea tensiunii",
      "diferența dintre serie și paralel",
    ],
    components: ["Baterie", "Rezistor", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat4", "battery", -470, -120, { ...commonBattery }),
        component("res4", "resistor", -130, -120, { R: 50 }),
        component("bulb4", "bulb", 260, -120, {
          ...commonBulb,
          Pnom: 1.5,
          ratedPowerW: 1.5,
        }),
        component("volt4", "voltmeter", 260, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat4_a", "res4_a", [{ x: -300, y: -250 }]),
        wire("w2", "res4_b", "bulb4_a", [{ x: 70, y: -120 }]),
        wire("w3", "bulb4_b", "bat4_b", [
          { x: 450, y: 260 },
          { x: -300, y: 260 },
        ]),
        wire("w4", "volt4_a", "bulb4_a", [
          { x: 70, y: 120 },
          { x: 70, y: -120 },
        ]),
        wire("w5", "volt4_b", "bulb4_b", [
          { x: 450, y: 120 },
          { x: 450, y: -120 },
        ]),
      ],
      0.62
    ),
  },
  {
    id: "ampermetru-serie",
    categoryId: "measure",
    title: "Ampermetru conectat corect în serie",
    level: "Mediu",
    badge: "Măsurători",
    description:
      "Ampermetrul este conectat în serie, astfel încât tot curentul circuitului trece prin el.",
    learns: [
      "ampermetrul se conectează în serie",
      "curentul este același într-o ramură serie",
      "de ce ampermetrul nu se pune în paralel",
    ],
    components: ["Baterie", "Ampermetru", "Rezistor", "Bec"],
    circuit: makeCircuit(
      [
        component("bat5", "battery", -520, -120, { ...commonBattery }),
        component("amp5", "ammeter", -230, -120, { display: "—" }),
        component("res5", "resistor", 80, -120, { R: 100 }),
        component("bulb5", "bulb", 410, -120, {
          ...commonBulb,
          Pnom: 1,
          ratedPowerW: 1,
        }),
      ],
      [
        wire("w1", "bat5_a", "amp5_a", [{ x: -375, y: -250 }]),
        wire("w2", "amp5_b", "res5_a", [{ x: -75, y: -120 }]),
        wire("w3", "res5_b", "bulb5_a", [{ x: 245, y: -120 }]),
        wire("w4", "bulb5_b", "bat5_b", [
          { x: 590, y: 170 },
          { x: -375, y: 170 },
        ]),
      ],
      0.58
    ),
  },
  {
    id: "ohmmetru-serie",
    categoryId: "measure",
    title: "Ohmmetru pe rezistori în serie",
    level: "Mediu",
    badge: "Ohmmetru",
    description:
      "Ohmmetrul măsoară rezistența echivalentă a doi rezistori în serie. Rezistențele se adună.",
    learns: [
      "folosirea ohmmetrului",
      "rezistență echivalentă în serie",
      "Rtotal = R1 + R2",
    ],
    components: ["Ohmmetru", "Rezistor 100Ω", "Rezistor 220Ω"],
    circuit: makeCircuit(
      [
        component("ohm1", "ohmmeter", -380, -100, { display: "—" }),
        component("rs1", "resistor", -40, -100, { R: 100 }),
        component("rs2", "resistor", 300, -100, { R: 220 }),
      ],
      [
        wire("w1", "ohm1_a", "rs1_a", [{ x: -210, y: -220 }]),
        wire("w2", "rs1_b", "rs2_a", [{ x: 130, y: -100 }]),
        wire("w3", "rs2_b", "ohm1_b", [
          { x: 470, y: 150 },
          { x: -210, y: 150 },
        ]),
      ],
      0.68
    ),
  },
  {
    id: "ohmmetru-paralel",
    categoryId: "measure",
    title: "Ohmmetru pe rezistori în paralel",
    level: "Avansat",
    badge: "Ohmmetru",
    description:
      "Ohmmetrul măsoară rezistența echivalentă a doi rezistori în paralel. Rezistența totală este mai mică decât fiecare rezistență individuală.",
    learns: [
      "rezistență echivalentă în paralel",
      "măsurare cu ohmmetrul",
      "ramuri multiple",
    ],
    components: ["Ohmmetru", "Rezistor 100Ω", "Rezistor 220Ω"],
    circuit: makeCircuit(
      [
        component("ohm2", "ohmmeter", -450, 0, { display: "—" }),
        component("rp1", "resistor", 130, -140, { R: 100 }),
        component("rp2", "resistor", 130, 140, { R: 220 }),
      ],
      [
        wire("w1", "ohm2_a", "rp1_a", [
          { x: -160, y: -140 },
        ]),
        wire("w2", "ohm2_a", "rp2_a", [
          { x: -160, y: 140 },
        ]),
        wire("w3", "rp1_b", "ohm2_b", [
          { x: 420, y: -140 },
          { x: 420, y: 0 },
        ]),
        wire("w4", "rp2_b", "ohm2_b", [
          { x: 420, y: 140 },
          { x: 420, y: 0 },
        ]),
      ],
      0.62
    ),
  },
  {
    id: "serie-paralel-rezistori",
    categoryId: "resistors",
    title: "Rețea serie-paralel de rezistori",
    level: "Avansat",
    badge: "Rezistori",
    description:
      "Un rezistor este în serie cu două rezistențe aflate în paralel. Este un exemplu bun pentru echivalență serie-paralel.",
    learns: [
      "rezistență serie",
      "rezistență paralel",
      "cum se împarte curentul pe ramuri",
    ],
    components: ["Baterie", "Ampermetru", "R1", "R2", "R3", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_sp", "battery", -650, -60, { ...commonBattery }),
        component("amp_sp", "ammeter", -390, -60, { display: "—" }),
        component("r1_sp", "resistor", -120, -60, { R: 100 }),
        component("r2_sp", "resistor", 250, -190, { R: 220 }),
        component("r3_sp", "resistor", 250, 90, { R: 330 }),
        component("volt_sp", "voltmeter", 620, -60, { display: "—" }),
      ],
      [
        wire("w1", "bat_sp_a", "amp_sp_a", [{ x: -520, y: -210 }]),
        wire("w2", "amp_sp_b", "r1_sp_a", [{ x: -255, y: -60 }]),
        wire("w3", "r1_sp_b", "r2_sp_a", [
          { x: 80, y: -190 },
        ]),
        wire("w4", "r1_sp_b", "r3_sp_a", [
          { x: 80, y: 90 },
        ]),
        wire("w5", "r2_sp_b", "bat_sp_b", [
          { x: 520, y: -190 },
          { x: 520, y: 240 },
          { x: -520, y: 240 },
        ]),
        wire("w6", "r3_sp_b", "bat_sp_b", [
          { x: 520, y: 90 },
          { x: 520, y: 240 },
          { x: -520, y: 240 },
        ]),
        wire("w7", "volt_sp_a", "r1_sp_b", [
          { x: 80, y: -60 },
        ]),
        wire("w8", "volt_sp_b", "bat_sp_b", [
          { x: 520, y: -60 },
          { x: 520, y: 240 },
          { x: -520, y: 240 },
        ]),
      ],
      0.52
    ),
  },
  {
    id: "divizor-tensiune",
    categoryId: "resistors",
    title: "Divizor de tensiune cu două voltmetre",
    level: "Avansat",
    badge: "Rezistori",
    description:
      "Două rezistențe în serie împart tensiunea bateriei. Voltmetrele măsoară tensiunea pe fiecare rezistor.",
    learns: [
      "divizor de tensiune",
      "tensiuni parțiale",
      "suma tensiunilor pe rezistori",
    ],
    components: ["Baterie", "R1", "R2", "Voltmetru R1", "Voltmetru R2"],
    circuit: makeCircuit(
      [
        component("bat_div", "battery", -560, -120, { ...commonBattery }),
        component("r1_div", "resistor", -160, -120, { R: 100 }),
        component("r2_div", "resistor", 250, -120, { R: 200 }),
        component("v1_div", "voltmeter", -160, 120, { display: "—" }),
        component("v2_div", "voltmeter", 250, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat_div_a", "r1_div_a", [{ x: -360, y: -250 }]),
        wire("w2", "r1_div_b", "r2_div_a", [{ x: 45, y: -120 }]),
        wire("w3", "r2_div_b", "bat_div_b", [
          { x: 450, y: 260 },
          { x: -360, y: 260 },
        ]),
        wire("w4", "v1_div_a", "r1_div_a", [
          { x: -340, y: 120 },
          { x: -340, y: -120 },
        ]),
        wire("w5", "v1_div_b", "r1_div_b", [
          { x: 20, y: 120 },
          { x: 20, y: -120 },
        ]),
        wire("w6", "v2_div_a", "r2_div_a", [
          { x: 70, y: 120 },
          { x: 70, y: -120 },
        ]),
        wire("w7", "v2_div_b", "r2_div_b", [
          { x: 430, y: 120 },
          { x: 430, y: -120 },
        ]),
      ],
      0.56
    ),
  },
  {
    id: "kirchhoff-curenti",
    categoryId: "kirchhoff",
    title: "Kirchhoff: curent total și curenți pe ramuri",
    level: "Avansat",
    badge: "Kirchhoff",
    description:
      "Circuit cu două ramuri paralele, fiecare cu ampermetru propriu. Curentul total se împarte pe ramuri.",
    learns: [
      "legea nodurilor Kirchhoff",
      "curent total = suma curenților pe ramuri",
      "ramuri paralele cu rezistențe diferite",
    ],
    components: [
      "Baterie",
      "Ampermetru total",
      "Ampermetru ramură 1",
      "Ampermetru ramură 2",
      "R1",
      "R2",
      "Voltmetru",
    ],
    circuit: makeCircuit(
      [
        component("bat_k1", "battery", -720, -40, { ...commonBattery }),
        component("amp_total_k1", "ammeter", -470, -40, { display: "—" }),
        component("amp_a_k1", "ammeter", -120, -200, { display: "—" }),
        component("r_a_k1", "resistor", 220, -200, { R: 100 }),
        component("amp_b_k1", "ammeter", -120, 140, { display: "—" }),
        component("r_b_k1", "resistor", 220, 140, { R: 220 }),
        component("volt_k1", "voltmeter", 610, -40, { display: "—" }),
      ],
      [
        wire("w1", "bat_k1_a", "amp_total_k1_a", [{ x: -595, y: -210 }]),
        wire("w2", "amp_total_k1_b", "amp_a_k1_a", [
          { x: -300, y: -200 },
        ]),
        wire("w3", "amp_total_k1_b", "amp_b_k1_a", [
          { x: -300, y: 140 },
        ]),
        wire("w4", "amp_a_k1_b", "r_a_k1_a", [{ x: 50, y: -200 }]),
        wire("w5", "amp_b_k1_b", "r_b_k1_a", [{ x: 50, y: 140 }]),
        wire("w6", "r_a_k1_b", "bat_k1_b", [
          { x: 500, y: -200 },
          { x: 500, y: 300 },
          { x: -595, y: 300 },
        ]),
        wire("w7", "r_b_k1_b", "bat_k1_b", [
          { x: 500, y: 140 },
          { x: 500, y: 300 },
          { x: -595, y: 300 },
        ]),
        wire("w8", "volt_k1_a", "amp_total_k1_b", [
          { x: -300, y: -40 },
        ]),
        wire("w9", "volt_k1_b", "bat_k1_b", [
          { x: 500, y: -40 },
          { x: 500, y: 300 },
          { x: -595, y: 300 },
        ]),
      ],
      0.48
    ),
  },
  {
    id: "kirchhoff-tensiuni",
    categoryId: "kirchhoff",
    title: "Kirchhoff: suma tensiunilor în buclă",
    level: "Avansat",
    badge: "Kirchhoff",
    description:
      "Trei rezistori în serie cu voltmetre pe fiecare. Suma tensiunilor pe rezistori trebuie să fie apropiată de tensiunea sursei.",
    learns: [
      "legea tensiunilor Kirchhoff",
      "căderi de tensiune în serie",
      "suma tensiunilor pe componente",
    ],
    components: ["Baterie", "R1", "R2", "R3", "3 voltmetre"],
    circuit: makeCircuit(
      [
        component("bat_k2", "battery", -760, -130, { ...commonBattery }),
        component("r1_k2", "resistor", -360, -130, { R: 100 }),
        component("r2_k2", "resistor", 30, -130, { R: 150 }),
        component("r3_k2", "resistor", 420, -130, { R: 220 }),
        component("v1_k2", "voltmeter", -360, 120, { display: "—" }),
        component("v2_k2", "voltmeter", 30, 120, { display: "—" }),
        component("v3_k2", "voltmeter", 420, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat_k2_a", "r1_k2_a", [{ x: -560, y: -270 }]),
        wire("w2", "r1_k2_b", "r2_k2_a", [{ x: -165, y: -130 }]),
        wire("w3", "r2_k2_b", "r3_k2_a", [{ x: 225, y: -130 }]),
        wire("w4", "r3_k2_b", "bat_k2_b", [
          { x: 620, y: 290 },
          { x: -560, y: 290 },
        ]),
        wire("w5", "v1_k2_a", "r1_k2_a", [
          { x: -540, y: 120 },
          { x: -540, y: -130 },
        ]),
        wire("w6", "v1_k2_b", "r1_k2_b", [
          { x: -180, y: 120 },
          { x: -180, y: -130 },
        ]),
        wire("w7", "v2_k2_a", "r2_k2_a", [
          { x: -150, y: 120 },
          { x: -150, y: -130 },
        ]),
        wire("w8", "v2_k2_b", "r2_k2_b", [
          { x: 210, y: 120 },
          { x: 210, y: -130 },
        ]),
        wire("w9", "v3_k2_a", "r3_k2_a", [
          { x: 240, y: 120 },
          { x: 240, y: -130 },
        ]),
        wire("w10", "v3_k2_b", "r3_k2_b", [
          { x: 600, y: 120 },
          { x: 600, y: -130 },
        ]),
      ],
      0.45
    ),
  },
  {
    id: "doua-surse-serie",
    categoryId: "kirchhoff",
    title: "Două surse în serie cu consumatori",
    level: "Avansat",
    badge: "Surse",
    description:
      "Două baterii sunt conectate în serie și alimentează un rezistor și un bec. Poți observa efectul tensiunii totale mai mari.",
    learns: [
      "surse în serie",
      "creșterea tensiunii totale",
      "efectul asupra consumatorilor",
    ],
    components: ["2 baterii", "Rezistor", "Bec", "Voltmetru", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_s1", "battery", -760, -120, {
          ...commonBattery,
          V: 4.5,
          effectiveV: 4.5,
        }),
        component("bat_s2", "battery", -440, -120, {
          ...commonBattery,
          V: 4.5,
          effectiveV: 4.5,
        }),
        component("amp_s", "ammeter", -120, -120, { display: "—" }),
        component("res_s", "resistor", 200, -120, { R: 100 }),
        component("bulb_s", "bulb", 540, -120, {
          ...commonBulb,
          Pnom: 2.7,
          ratedPowerW: 2.7,
        }),
        component("volt_s", "voltmeter", 540, 130, { display: "—" }),
      ],
      [
        wire("w1", "bat_s1_b", "bat_s2_a", [{ x: -600, y: -120 }]),
        wire("w2", "bat_s2_b", "amp_s_a", [{ x: -280, y: -120 }]),
        wire("w3", "amp_s_b", "res_s_a", [{ x: 40, y: -120 }]),
        wire("w4", "res_s_b", "bulb_s_a", [{ x: 370, y: -120 }]),
        wire("w5", "bulb_s_b", "bat_s1_a", [
          { x: 720, y: 280 },
          { x: -940, y: 280 },
        ]),
        wire("w6", "volt_s_a", "bulb_s_a", [
          { x: 370, y: 130 },
          { x: 370, y: -120 },
        ]),
        wire("w7", "volt_s_b", "bulb_s_b", [
          { x: 720, y: 130 },
          { x: 720, y: -120 },
        ]),
      ],
      0.44
    ),
  },
  {
    id: "doua-becuri-serie",
    categoryId: "kirchhoff",
    title: "Două becuri în serie",
    level: "Mediu",
    badge: "Serie",
    description:
      "Două becuri sunt conectate unul după altul. Curentul este același prin ambele, iar tensiunea se împarte.",
    learns: ["conexiune în serie", "același curent", "tensiune împărțită"],
    components: ["Baterie", "Bec 1", "Bec 2", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_ser", "battery", -530, -130, { ...commonBattery }),
        component("bulb_ser1", "bulb", -110, -130, {
          ...commonBulb,
          Pnom: 1.2,
          ratedPowerW: 1.2,
        }),
        component("bulb_ser2", "bulb", 320, -130, {
          ...commonBulb,
          Pnom: 1.2,
          ratedPowerW: 1.2,
        }),
        component("volt_ser", "voltmeter", -110, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat_ser_a", "bulb_ser1_a", [{ x: -320, y: -260 }]),
        wire("w2", "bulb_ser1_b", "bulb_ser2_a", [{ x: 105, y: -130 }]),
        wire("w3", "bulb_ser2_b", "bat_ser_b", [
          { x: 520, y: 260 },
          { x: -320, y: 260 },
        ]),
        wire("w4", "volt_ser_a", "bulb_ser1_a", [
          { x: -290, y: 120 },
          { x: -290, y: -130 },
        ]),
        wire("w5", "volt_ser_b", "bulb_ser1_b", [
          { x: 70, y: 120 },
          { x: 70, y: -130 },
        ]),
      ],
      0.56
    ),
  },
  {
    id: "doua-becuri-paralel",
    categoryId: "kirchhoff",
    title: "Două becuri în paralel cu măsurători",
    level: "Avansat",
    badge: "Paralel",
    description:
      "Două becuri sunt conectate în paralel. Fiecare primește aproximativ aceeași tensiune, iar curentul total crește.",
    learns: ["paralel", "tensiune comună", "curent total mai mare"],
    components: ["Baterie", "Bec 1", "Bec 2", "Ampermetru", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_par", "battery", -560, -40, { ...commonBattery }),
        component("amp_par", "ammeter", -270, -40, { display: "—" }),
        component("bulb_par1", "bulb", 220, -180, {
          ...commonBulb,
          Pnom: 2.7,
          ratedPowerW: 2.7,
        }),
        component("bulb_par2", "bulb", 220, 120, {
          ...commonBulb,
          Pnom: 2.7,
          ratedPowerW: 2.7,
        }),
        component("volt_par", "voltmeter", 580, -30, { display: "—" }),
      ],
      [
        wire("w1", "bat_par_a", "amp_par_a", [{ x: -415, y: -180 }]),
        wire("w2", "amp_par_b", "bulb_par1_a", [{ x: -80, y: -180 }]),
        wire("w3", "amp_par_b", "bulb_par2_a", [{ x: -80, y: 120 }]),
        wire("w4", "bulb_par1_b", "bat_par_b", [
          { x: 420, y: -300 },
          { x: -415, y: -300 },
        ]),
        wire("w5", "bulb_par2_b", "bat_par_b", [
          { x: 420, y: 260 },
          { x: -415, y: 260 },
        ]),
        wire("w6", "volt_par_a", "bulb_par1_a", [
          { x: 30, y: -30 },
          { x: 30, y: -180 },
        ]),
        wire("w7", "volt_par_b", "bulb_par1_b", [
          { x: 420, y: -30 },
          { x: 420, y: -180 },
        ]),
      ],
      0.52
    ),
  },
  {
    id: "condensator-incarcare",
    categoryId: "capacitors",
    title: "Condensator care se încarcă",
    level: "Mediu",
    badge: "Condensator",
    description:
      "Condensatorul este conectat corect la baterie. După Start, se încarcă progresiv.",
    learns: [
      "încărcarea condensatorului",
      "tensiune pe condensator",
      "energie stocată",
    ],
    components: ["Baterie", "Condensator", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("bat_cap1", "battery", -330, -80, { ...commonBattery }),
        component("cap1", "capacitor", 220, -80, {
          ...commonCapacitor,
          Vmax: 12,
          capVoltage: 0,
          chargeTimeSec: 3,
          dischargeTimeSec: 8,
          leakageEnabled: false,
        }),
        component("volt_cap1", "voltmeter", 220, 150, { display: "—" }),
      ],
      [
        wire("w1", "bat_cap1_a", "cap1_a", [{ x: -55, y: -220 }]),
        wire("w2", "cap1_b", "bat_cap1_b", [
          { x: 400, y: 260 },
          { x: -55, y: 260 },
        ]),
        wire("w3", "volt_cap1_a", "cap1_a", [
          { x: 40, y: 150 },
          { x: 40, y: -80 },
        ]),
        wire("w4", "volt_cap1_b", "cap1_b", [
          { x: 400, y: 150 },
          { x: 400, y: -80 },
        ]),
      ],
      0.6
    ),
  },
  {
    id: "condensator-descarcare",
    categoryId: "capacitors",
    title: "Condensator care alimentează un bec",
    level: "Mediu",
    badge: "Condensator",
    description:
      "Condensatorul pornește încărcat și alimentează becul. Luminozitatea scade treptat.",
    learns: [
      "descărcarea condensatorului",
      "condensator ca sursă temporară",
      "scădere progresivă a tensiunii",
    ],
    components: ["Condensator", "Bec", "Voltmetru"],
    circuit: makeCircuit(
      [
        component("cap2", "capacitor", -260, -90, {
          ...commonCapacitor,
          Vmax: 9,
          capVoltage: 9,
          dischargeTimeSec: 10,
          leakageEnabled: true,
        }),
        component("bulb_cap2", "bulb", 260, -90, { ...commonBulb }),
        component("volt_cap2", "voltmeter", -260, 140, { display: "—" }),
      ],
      [
        wire("w1", "cap2_a", "bulb_cap2_a", [{ x: 0, y: -220 }]),
        wire("w2", "bulb_cap2_b", "cap2_b", [
          { x: 420, y: 250 },
          { x: -420, y: 250 },
        ]),
        wire("w3", "volt_cap2_a", "cap2_a", [
          { x: -440, y: 140 },
          { x: -440, y: -90 },
        ]),
        wire("w4", "volt_cap2_b", "cap2_b", [
          { x: -80, y: 140 },
          { x: -80, y: -90 },
        ]),
      ],
      0.62
    ),
  },
  {
    id: "eroare-ampermetru",
    categoryId: "errors",
    title: "Greșeală: ampermetru pus în paralel",
    level: "Avertizare",
    badge: "Greșeli",
    description:
      "Exemplu intenționat greșit. Ampermetrul este pus în paralel cu becul și va apărea dialogul de avertizare.",
    learns: [
      "de ce ampermetrul se pune în serie",
      "ce înseamnă scurtcircuit",
      "cum ajută popup-ul",
    ],
    components: ["Baterie", "Bec", "Ampermetru"],
    circuit: makeCircuit(
      [
        component("bat_err1", "battery", -340, -100, { ...commonBattery }),
        component("bulb_err1", "bulb", 240, -100, { ...commonBulb }),
        component("amp_err1", "ammeter", 240, 120, { display: "—" }),
      ],
      [
        wire("w1", "bat_err1_a", "bulb_err1_a", [{ x: -50, y: -230 }]),
        wire("w2", "bulb_err1_b", "bat_err1_b", [
          { x: 420, y: 260 },
          { x: -180, y: 260 },
        ]),
        wire("w3", "amp_err1_a", "bulb_err1_a", [
          { x: 60, y: 120 },
          { x: 60, y: -100 },
        ]),
        wire("w4", "amp_err1_b", "bulb_err1_b", [
          { x: 420, y: 120 },
          { x: 420, y: -100 },
        ]),
      ],
      0.62
    ),
  },
  {
    id: "eroare-condensator",
    categoryId: "errors",
    title: "Greșeală: condensator supratensionat",
    level: "Avertizare",
    badge: "Greșeli",
    description:
      "Condensatorul are Vmax mic, dar este conectat la o baterie mai mare. Ar trebui să apară avertizarea de supratensiune.",
    learns: [
      "tensiune maximă la condensator",
      "protecția componentelor",
      "de ce contează Vmax",
    ],
    components: ["Baterie 9V", "Condensator Vmax 3V"],
    circuit: makeCircuit(
      [
        component("bat_err2", "battery", -300, -90, { ...commonBattery }),
        component("cap_err2", "capacitor", 260, -90, {
          ...commonCapacitor,
          Vmax: 3,
          capVoltage: 0,
          chargeTimeSec: 1.5,
        }),
      ],
      [
        wire("w1", "bat_err2_a", "cap_err2_a", [{ x: -20, y: -220 }]),
        wire("w2", "cap_err2_b", "bat_err2_b", [
          { x: 430, y: 150 },
          { x: -140, y: 150 },
        ]),
      ],
      0.65
    ),
  },
];

function categoryColor(categoryId) {
  if (categoryId === "errors") {
    return "text-rose-200 bg-rose-300/10 border-rose-300/20";
  }

  if (categoryId === "capacitors") {
    return "text-cyan-100 bg-cyan-300/10 border-cyan-300/20";
  }

  if (categoryId === "measure") {
    return "text-emerald-100 bg-emerald-300/10 border-emerald-300/20";
  }

  if (categoryId === "resistors") {
    return "text-amber-100 bg-amber-300/10 border-amber-300/20";
  }

  if (categoryId === "kirchhoff") {
    return "text-violet-100 bg-violet-300/10 border-violet-300/20";
  }

  return "text-white/70 bg-white/5 border-white/10";
}

export default function Examples() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState("all");

  const visibleExamples = useMemo(() => {
    if (categoryId === "all") return EXAMPLES;
    return EXAMPLES.filter((example) => example.categoryId === categoryId);
  }, [categoryId]);

  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);

  const selected = useMemo(() => {
    const stillVisible = visibleExamples.find((x) => x.id === selectedId);

    if (stillVisible) return stillVisible;

    return visibleExamples[0] ?? EXAMPLES[0];
  }, [selectedId, visibleExamples]);

  function selectCategory(id) {
    setCategoryId(id);

    const first =
      id === "all" ? EXAMPLES[0] : EXAMPLES.find((x) => x.categoryId === id);

    if (first) {
      setSelectedId(first.id);
    }
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
      </div>

      <main className="relative mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.45)] lg:p-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                Exemple VoltLab
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/65">
                categorii · circuite complexe · testează
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Exemple de circuite gata făcute.
            </h1>

            <p className="mt-5 text-base leading-8 text-white/70">
              Alege categoria, selectează un exemplu și apasă <b>TESTEAZĂ</b>.
              Exemplele complexe includ rezistori serie/paralel, măsurători
              multiple, ohmmetru și verificări pentru legile lui Kirchhoff.
            </p>
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[410px_1fr]">
          <aside className="voltlab-scroll max-h-[calc(100vh-230px)] overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                Exemple
              </div>

              <div className="text-xs text-white/40">
                {visibleExamples.length}
              </div>
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
                      <div>
                        <div className="text-sm font-bold text-white">
                          {example.title}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          {example.level}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${categoryColor(
                          example.categoryId
                        )}`}
                      >
                        {example.badge}
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
                <div
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryColor(
                    selected.categoryId
                  )}`}
                >
                  {selected.badge} · {selected.level}
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                  {selected.title}
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
                  {selected.description}
                </p>
              </div>

              <button
                onClick={() => testExample(selected)}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              >
                TESTEAZĂ
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-bold text-white">
                  Ce înveți din exemplul acesta
                </div>

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
                <div className="text-sm font-bold text-white">
                  Componente folosite
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.components.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-5 text-sm leading-7 text-cyan-50/80">
              După ce apeși <b>TESTEAZĂ</b>, circuitul se încarcă în laborator.
              Apasă <b>Start</b>, apoi selectează instrumentele pentru a vedea
              valorile în Inspector.
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}