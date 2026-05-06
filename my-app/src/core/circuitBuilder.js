import { computeNets } from "./nets";
import { solveMNA } from "./mnaSolver";
import { formatSI } from "./formatting";

// Parse values that may come as numbers OR formatted SI strings
// exemple: "1.00MΩ", "200mΩ", "9V", "1000µF"
function parseSIValue(v) {
  if (typeof v === "number") return v;
  if (v == null) return NaN;

  const s = String(v).trim();

  const clean = s.replace(/\s+/g, "").replace(/[ΩVAWAhFJC%]/gi, "");

  const m = clean.match(/^(-?\d+(?:\.\d+)?)([pnumkMGTµu])?$/);

  if (!m) {
    const n = Number(clean);
    return Number.isFinite(n) ? n : NaN;
  }

  const num = Number(m[1]);
  const p = m[2] || "";

  const mult =
    p === "p"
      ? 1e-12
      : p === "n"
      ? 1e-9
      : p === "u" || p === "µ"
      ? 1e-6
      : p === "m"
      ? 1e-3
      : p === "k"
      ? 1e3
      : p === "M"
      ? 1e6
      : p === "G"
      ? 1e9
      : p === "T"
      ? 1e12
      : 1;

  return num * mult;
}

function safeNumber(value, fallback) {
  const raw = parseSIValue(value);
  return Number.isFinite(raw) ? raw : fallback;
}

function safeResistance(value, fallback) {
  const raw = parseSIValue(value);
  return Math.max(1e-6, Number.isFinite(raw) ? raw : fallback);
}

function formatOhms(value) {
  if (value == null || Number.isNaN(value)) return "—";
  if (!Number.isFinite(value)) return "∞ Ω";
  if (Math.abs(value) < 1e-6) return "0.00Ω";

  return formatSI(value, "Ω");
}

function formatValue(value, unit) {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return "—";
  }

  return formatSI(value, unit);
}

function formatSignedValue(value, unit) {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return "—";
  }

  const sign = value < 0 ? "-" : "";
  return sign + formatSI(Math.abs(value), unit);
}

function buildNodeToNet(nodes, wires) {
  const nets = computeNets(nodes, wires);
  const map = new Map();

  nets.forEach((arr, idx) => {
    for (const nodeId of arr) {
      map.set(nodeId, idx);
    }
  });

  return {
    nets,
    nodeToNet: map,
  };
}

function itemPins(nodes, itemId) {
  const pins = nodes.filter((n) => n.itemId === itemId);

  const a = pins.find((p) => p.name === "a") || pins[0];
  const b = pins.find((p) => p.name === "b") || pins[1];
  const base = pins.find((p) => p.name === "b") || null;
  const collector = pins.find((p) => p.name === "c") || null;
  const emitter = pins.find((p) => p.name === "e") || null;

  return { a, b, base, collector, emitter, pins };
}

// Rețea rezistivă pentru ohmmetru.
// Ohmmetrul NU trebuie să folosească sursele active.
// Bateria este tratată ca sursă oprită, deci rămâne doar Rint.
// Condensatorul este tratat ca circuit deschis.
function buildResistanceNetworkForOhmmeter(items, nodes, wires, targetOhmmeterId) {
  const { nodeToNet, nets } = buildNodeToNet(nodes, wires);

  const resistors = [];

  for (const it of items) {
    if (it.id === targetOhmmeterId) continue;

    const { a, b } = itemPins(nodes, it.id);
    if (!a || !b) continue;

    const na = nodeToNet.get(a.id);
    const nb = nodeToNet.get(b.id);

    if (na == null || nb == null) continue;

    if (it.type === "resistor" || it.type === "potentiometer") {
      resistors.push({
        a: na,
        b: nb,
        R: safeResistance(it.R ?? 100, 100),
      });
    }

    if (it.type === "switch") {
      if (it.closed) {
        resistors.push({
          a: na,
          b: nb,
          R: 1e-4,
        });
      }
    }

    if (it.type === "bulb") {
      resistors.push({
        a: na,
        b: nb,
        R: safeResistance(it.R ?? 30, 30),
      });
    }

    if (it.type === "battery") {
      resistors.push({
        a: na,
        b: nb,
        R: safeResistance(it.Rint ?? 0.2, 0.2),
      });
    }

    if (it.type === "ammeter") {
      resistors.push({
        a: na,
        b: nb,
        R: 1e-4,
      });
    }

    // capacitor / voltmeter / ohmmeter = open circuit
  }

  return { nodeToNet, nets, resistors };
}

function getConnectedResistiveComponent(startNet, resistors, netCount) {
  const adj = new Map();

  for (let i = 0; i < netCount; i++) {
    adj.set(i, []);
  }

  for (const r of resistors) {
    if (!adj.has(r.a)) adj.set(r.a, []);
    if (!adj.has(r.b)) adj.set(r.b, []);

    adj.get(r.a).push(r.b);
    adj.get(r.b).push(r.a);
  }

  const seen = new Set();
  const stack = [startNet];

  seen.add(startNet);

  while (stack.length) {
    const cur = stack.pop();

    for (const nx of adj.get(cur) || []) {
      if (!seen.has(nx)) {
        seen.add(nx);
        stack.push(nx);
      }
    }
  }

  return seen;
}

function measureOhmmeterResistance(items, nodes, wires, ohmmeterItem) {
  try {
    const { nodeToNet, nets, resistors } = buildResistanceNetworkForOhmmeter(
      items,
      nodes,
      wires,
      ohmmeterItem.id
    );

    const { a, b } = itemPins(nodes, ohmmeterItem.id);
    if (!a || !b) return null;

    const na = nodeToNet.get(a.id);
    const nb = nodeToNet.get(b.id);

    if (na == null || nb == null) return null;

    if (na === nb) return 0;

    const component = getConnectedResistiveComponent(
      na,
      resistors,
      nets.length
    );

    if (!component.has(nb)) {
      return Infinity;
    }

    const componentNets = Array.from(component);
    const oldToNew = new Map();

    componentNets.forEach((oldNet, idx) => {
      oldToNew.set(oldNet, idx);
    });

    const compactResistors = resistors
      .filter((r) => oldToNew.has(r.a) && oldToNew.has(r.b))
      .map((r) => ({
        a: oldToNew.get(r.a),
        b: oldToNew.get(r.b),
        R: r.R,
      }));

    const testA = oldToNew.get(na);
    const testB = oldToNew.get(nb);

    if (testA == null || testB == null) return null;

    const nodeCount = componentNets.length;
    const ground = testB;

    const mna = solveMNA({
      nodeCount,
      ground,
      resistors: compactResistors,
      currentSources: [
        {
          a: testA,
          b: testB,
          I: 1,
        },
      ],
      voltageSources: [],
    });

    if (!mna) return null;

    const Va = mna.V[testA] ?? 0;
    const Vb = mna.V[testB] ?? 0;

    return Math.abs(Va - Vb);
  } catch {
    return null;
  }
}

export function solveNormalDC(items, nodes, wires) {
  try {
    const { nodeToNet, nets } = buildNodeToNet(nodes, wires);
    const nodeCount = nets.length;

    if (nodeCount <= 0) {
      return {
        ok: false,
        reason: "empty circuit",
        wires,
      };
    }

    const ground = 0;

    function netOf(node) {
      if (!node) return null;
      const n = nodeToNet.get(node.id);
      return n == null ? null : n;
    }

    function buildModel(bias = {}) {
      const resistors = [];
      const currentSources = [];
      const voltageSources = [];
      const batterySourceByItemId = new Map();
      const capacitorSourceByItemId = new Map();
      const diodeMetaByItemId = new Map();
      const transistorMetaByItemId = new Map();

      function addResistor(a, b, R) {
        if (a == null || b == null) return;
        resistors.push({ a, b, R: safeResistance(R, 100) });
      }

      function addSeriesVoltageResistor(a, b, V, R) {
        const sourceIndex = voltageSources.length;
        const internal = nodeCount + sourceIndex;

        voltageSources.push({ a, b: internal, V });
        addResistor(internal, b, R);

        return { sourceIndex, internalNet: internal };
      }

      for (const it of items) {
        if (it.type === "transistor_npn" || it.type === "transistor_pnp") {
          const { base, collector, emitter } = itemPins(nodes, it.id);
          const nb = netOf(base);
          const nc = netOf(collector);
          const ne = netOf(emitter);

          if (nb == null || nc == null || ne == null) continue;

          const on = !!bias.transistorOn?.get(it.id);
          const Rce = on
            ? safeResistance(it.RonCE ?? 2, 2)
            : safeResistance(it.RoffCE ?? 1000000000, 1000000000);

          addResistor(nc, ne, Rce);

          let baseSourceIndex = null;
          if (on) {
            const Vbe = safeNumber(it.Vbe ?? 0.7, 0.7);
            const Rbe = safeResistance(it.Rbe ?? 100, 100);

            if (it.type === "transistor_pnp") {
              const meta = addSeriesVoltageResistor(ne, nb, Vbe, Rbe);
              baseSourceIndex = meta.sourceIndex;
            } else {
              const meta = addSeriesVoltageResistor(nb, ne, Vbe, Rbe);
              baseSourceIndex = meta.sourceIndex;
            }
          } else {
            addResistor(nb, ne, safeResistance(it.Rbe ?? 100, 100));
          }

          transistorMetaByItemId.set(it.id, {
            on,
            baseSourceIndex,
            baseNet: nb,
            collectorNet: nc,
            emitterNet: ne,
            kind: it.type === "transistor_pnp" ? "PNP" : "NPN",
            Rce,
          });

          continue;
        }

        const { a, b } = itemPins(nodes, it.id);
        if (!a || !b) continue;

        const na = netOf(a);
        const nb = netOf(b);

        if (na == null || nb == null) continue;

        if (it.type === "resistor" || it.type === "potentiometer") {
          addResistor(na, nb, it.R ?? 100);
        }

        if (it.type === "switch") {
          if (it.closed) addResistor(na, nb, 1e-4);
        }

        if (it.type === "bulb") {
          addResistor(na, nb, it.R ?? 30);
        }

        if (it.type === "battery") {
          const V = safeNumber(it.effectiveV ?? it.V ?? 9, 9);
          const Rint = safeResistance(it.Rint ?? 0.2, 0.2);
          const meta = addSeriesVoltageResistor(na, nb, V, Rint);

          batterySourceByItemId.set(it.id, {
            sourceIndex: meta.sourceIndex,
            V,
            Rint,
            aNet: na,
            bNet: nb,
            internalNet: meta.internalNet,
          });
        }

        if (it.type === "capacitor") {
          const Vcap = safeNumber(it.capVoltage ?? 0, 0);
          const ESR = safeResistance(it.ESR ?? 0.5, 0.5);

          if (Math.abs(Vcap) > 0.001) {
            const meta = addSeriesVoltageResistor(na, nb, Vcap, ESR);

            capacitorSourceByItemId.set(it.id, {
              sourceIndex: meta.sourceIndex,
              V: Vcap,
              ESR,
              aNet: na,
              bNet: nb,
              internalNet: meta.internalNet,
            });
          }
        }

        if (it.type === "diode") {
          const active = !!bias.diodeOn?.get(it.id);
          const Vf = safeNumber(it.Vf ?? 0.7, 0.7);
          const Ron = safeResistance(it.Ron ?? 1, 1);
          const Roff = safeResistance(it.Roff ?? 1000000000, 1000000000);
          let sourceIndex = null;

          if (active) {
            const meta = addSeriesVoltageResistor(na, nb, Vf, Ron);
            sourceIndex = meta.sourceIndex;
          } else {
            addResistor(na, nb, Roff);
          }

          diodeMetaByItemId.set(it.id, {
            active,
            sourceIndex,
            aNet: na,
            bNet: nb,
            Vf,
            Ron,
            Roff,
          });
        }

        if (it.type === "ammeter") {
          addResistor(na, nb, 1e-4);
        }
      }

      const maxNodeIndex =
        Math.max(
          nodeCount - 1,
          ...resistors.map((r) => Math.max(r.a, r.b)),
          ...voltageSources.map((v) => Math.max(v.a, v.b))
        ) + 1;

      const GMIN_R = 1e12;

      for (let i = 0; i < maxNodeIndex; i++) {
        if (i === ground) continue;

        resistors.push({
          a: i,
          b: ground,
          R: GMIN_R,
        });
      }

      return {
        resistors,
        currentSources,
        voltageSources,
        batterySourceByItemId,
        capacitorSourceByItemId,
        diodeMetaByItemId,
        transistorMetaByItemId,
        maxNodeIndex,
      };
    }

    const firstModel = buildModel();
    const firstMna = solveMNA({
      nodeCount: firstModel.maxNodeIndex,
      ground,
      resistors: firstModel.resistors,
      currentSources: firstModel.currentSources,
      voltageSources: firstModel.voltageSources,
    });

    const diodeOn = new Map();
    const transistorOn = new Map();

    function firstV(net) {
      return firstMna?.V?.[net] ?? 0;
    }

    if (firstMna) {
      for (const it of items) {
        if (it.type === "diode") {
          const { a, b } = itemPins(nodes, it.id);
          const na = netOf(a);
          const nb = netOf(b);
          if (na != null && nb != null) {
            const Vf = safeNumber(it.Vf ?? 0.7, 0.7);
            diodeOn.set(it.id, firstV(na) - firstV(nb) >= Vf);
          }
        }

        if (it.type === "transistor_npn" || it.type === "transistor_pnp") {
          const { base, emitter } = itemPins(nodes, it.id);
          const nb = netOf(base);
          const ne = netOf(emitter);
          if (nb != null && ne != null) {
            const Vbe = safeNumber(it.Vbe ?? 0.7, 0.7);
            const on = it.type === "transistor_pnp"
              ? firstV(ne) - firstV(nb) >= Vbe
              : firstV(nb) - firstV(ne) >= Vbe;
            transistorOn.set(it.id, on);
          }
        }
      }
    }

    const model = buildModel({ diodeOn, transistorOn });
    const mna = solveMNA({
      nodeCount: model.maxNodeIndex,
      ground,
      resistors: model.resistors,
      currentSources: model.currentSources,
      voltageSources: model.voltageSources,
    });

    if (!mna) {
      return {
        ok: false,
        reason: "singular",
        wires,
      };
    }

    return {
      ok: true,
      nodeToNet,
      nets,
      ground,
      mna,
      voltageSources: model.voltageSources,
      resistors: model.resistors,
      wires,
      batterySourceByItemId: model.batterySourceByItemId,
      capacitorSourceByItemId: model.capacitorSourceByItemId,
      diodeMetaByItemId: model.diodeMetaByItemId,
      transistorMetaByItemId: model.transistorMetaByItemId,
    };
  } catch (e) {
    return {
      ok: false,
      reason: String(e),
      wires,
    };
  }
}

export function applySolutionToItems(items, nodes, sol) {
  if (!sol?.ok) {
    return items.map((it) => {
      const copy = { ...it };

      if (
        copy.type === "voltmeter" ||
        copy.type === "ammeter" ||
        copy.type === "ohmmeter"
      ) {
        copy.display = "—";
      }

      if (copy.type === "bulb" || copy.type === "potentiometer") {
        if (copy.type === "bulb") copy.brightness = 0;
        copy.displayVoltage = "—";
        copy.displayCurrent = "—";
        copy.displayPower = "—";
      }

      if (copy.type === "battery") {
        copy.displayCurrent = "—";
        copy.displayPower = "—";
        copy.displayRuntime = "—";
      }

      if (copy.type === "capacitor") {
        copy.displayCurrent = "—";
        copy.displayVoltage = "—";
        copy.displayCharge = "—";
        copy.displayEnergy = "—";
        copy.displayPercent = "0%";
      }

      if (copy.type === "diode") {
        copy.displayState = "—";
        copy.displayVoltage = "—";
        copy.displayCurrent = "—";
      }

      if (copy.type === "transistor_npn" || copy.type === "transistor_pnp") {
        copy.displayState = "—";
        copy.displayVbe = "—";
        copy.displayVce = "—";
        copy.displayIc = "—";
      }

      return copy;
    });
  }

  const {
    nodeToNet,
    mna,
    wires,
    batterySourceByItemId,
    capacitorSourceByItemId,
    diodeMetaByItemId,
    transistorMetaByItemId,
  } = sol;

  function V(net) {
    return mna?.V?.[net] ?? 0;
  }

  function netOf(node) {
    if (!node) return null;
    const n = nodeToNet.get(node.id);
    return n == null ? null : n;
  }

  return items.map((it) => {
    const copy = { ...it };

    if (copy.type === "transistor_npn" || copy.type === "transistor_pnp") {
      const { base, collector, emitter } = itemPins(nodes, copy.id);
      const nb = netOf(base);
      const nc = netOf(collector);
      const ne = netOf(emitter);
      if (nb == null || nc == null || ne == null) return copy;

      const meta = transistorMetaByItemId?.get(copy.id);
      const isPnp = copy.type === "transistor_pnp";
      const Vbe = isPnp ? V(ne) - V(nb) : V(nb) - V(ne);
      const Vce = V(nc) - V(ne);
      const Rce = meta?.Rce ?? safeResistance(copy.RoffCE ?? 1000000000, 1000000000);
      const Ic = (V(nc) - V(ne)) / Rce;

      copy.displayState = meta?.on ? "pornit" : "oprit";
      copy.displayVbe = formatSignedValue(Vbe, "V");
      copy.displayVce = formatSignedValue(Vce, "V");
      copy.displayIc = formatSignedValue(Ic, "A");

      return copy;
    }

    const { a, b } = itemPins(nodes, it.id);
    if (!a || !b) return copy;

    const na = netOf(a);
    const nb = netOf(b);

    if (na == null || nb == null) return copy;

    const Va = V(na);
    const Vb = V(nb);
    const dV = Va - Vb;

    if (copy.type === "bulb") {
      const Rb = safeResistance(copy.R ?? 30, 30);
      const voltage = Math.abs(dV);
      const current = voltage / Rb;
      const power = voltage * current;

      const PnomRaw = safeNumber(copy.Pnom ?? copy.ratedPowerW ?? 0.5, 0.5);
      const Pnom = Math.max(1e-6, PnomRaw);

      copy.displayVoltage = formatValue(voltage, "V");
      copy.displayCurrent = formatValue(current, "A");
      copy.displayPower = formatValue(power, "W");

      copy.brightness = Math.max(0, Math.min(1, power / Pnom));
    }

    if (copy.type === "potentiometer") {
      const R = safeResistance(copy.R ?? 5000, 5000);
      const voltage = Math.abs(dV);
      const current = voltage / R;
      const power = voltage * current;

      copy.displayVoltage = formatValue(voltage, "V");
      copy.displayCurrent = formatValue(current, "A");
      copy.displayPower = formatValue(power, "W");
    }

    if (copy.type === "battery") {
      const meta = batterySourceByItemId?.get(copy.id);

      if (meta) {
        const current = Math.abs(mna.Ivs?.[meta.sourceIndex] ?? 0);
        const power = current * Math.abs(meta.V);

        copy.displayCurrent = formatValue(current, "A");
        copy.displayPower = formatValue(power, "W");
      } else {
        copy.displayCurrent = "—";
        copy.displayPower = "—";
      }
    }

    if (copy.type === "capacitor") {
      const meta = capacitorSourceByItemId?.get(copy.id);

      if (meta) {
        const current = Math.abs(mna.Ivs?.[meta.sourceIndex] ?? 0);
        copy.displayCurrent = formatValue(current, "A");
      } else {
        copy.displayCurrent = "0.00A";
      }
    }

    if (copy.type === "diode") {
      const meta = diodeMetaByItemId?.get(copy.id);
      const active = !!meta?.active;
      const current = active && meta?.sourceIndex != null
        ? Math.abs(mna.Ivs?.[meta.sourceIndex] ?? 0)
        : Math.abs(dV / safeResistance(copy.Roff ?? 1000000000, 1000000000));

      copy.displayState = active ? "conduce" : "blocată";
      copy.displayVoltage = formatSignedValue(dV, "V");
      copy.displayCurrent = formatValue(current, "A");
    }

    if (copy.type === "voltmeter") {
      copy.display = formatSignedValue(dV, "V");
    }

    if (copy.type === "ammeter") {
      const Rsh = 1e-4;
      const current = dV / Rsh;

      copy.display = formatSignedValue(current, "A");
    }

    if (copy.type === "ohmmeter") {
      const req = measureOhmmeterResistance(items, nodes, wires ?? [], copy);

      copy.display = formatOhms(req);
    }

    return copy;
  });
}
