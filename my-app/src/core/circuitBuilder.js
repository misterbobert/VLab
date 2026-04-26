import { computeNets } from "./nets";
import { solveMNA } from "./mnaSolver";
import { formatSI } from "./formatting";

// Parse values that may come as numbers OR formatted SI strings
// exemple: "1.00MΩ", "200mΩ", "9V"
function parseSIValue(v) {
  if (typeof v === "number") return v;
  if (v == null) return NaN;

  const s = String(v).trim();

  // remove spaces + common units
  const clean = s.replace(/\s+/g, "").replace(/[ΩVAWAh%]/gi, "");

  // number + optional SI prefix
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

// Build a net index for each node by connectivity through wires
function buildNodeToNet(nodes, wires) {
  const nets = computeNets(nodes, wires);

  const map = new Map();

  nets.forEach((arr, idx) => {
    for (const nodeId of arr) {
      map.set(nodeId, idx);
    }
  });

  return { nets, nodeToNet: map };
}

// For each item, we assume 2 pins: node name a / b
function itemPins(nodes, itemId) {
  const pins = nodes.filter((n) => n.itemId === itemId);

  const a = pins.find((p) => p.name === "a") || pins[0];
  const b = pins.find((p) => p.name === "b") || pins[1];

  return { a, b };
}

// Rețea rezistivă pentru ohmmetru.
// Ohmmetrul NU trebuie să folosească sursele active.
// De aceea bateria este tratată ca sursă oprită, adică rămâne doar Rint.
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

    if (it.type === "resistor") {
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

    // voltmeter / ohmmeter = open circuit
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

// Calculează rezistența echivalentă între pinii ohmmetrului.
// Metodă:
// 1. injectăm un curent de test de 1A
// 2. calculăm tensiunea rezultată
// 3. R = U / I
// Cum I = 1A, rezultă R = U
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

    // pinii sunt legați direct pe același nod electric
    if (na === nb) return 0;

    const component = getConnectedResistiveComponent(
      na,
      resistors,
      nets.length
    );

    // nu există drum rezistiv între pinii ohmmetrului
    if (!component.has(nb)) {
      return Infinity;
    }

    // Compactăm doar bucata relevantă de circuit.
    // Asta evită probleme cu matrici singulare din alte circuite neconectate.
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

    const resistors = [];
    const currentSources = [];
    const voltageSources = [];

    // Ca să putem afișa curentul prin baterie după solve.
    const batterySourceByItemId = new Map();

    // stamps by components
    for (const it of items) {
      const { a, b } = itemPins(nodes, it.id);
      if (!a || !b) continue;

      const na = nodeToNet.get(a.id);
      const nb = nodeToNet.get(b.id);

      if (na == null || nb == null) continue;

      if (it.type === "resistor") {
        const R = safeResistance(it.R ?? 100, 100);
        resistors.push({ a: na, b: nb, R });
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
        const Rb = safeResistance(it.R ?? 30, 30);

        resistors.push({
          a: na,
          b: nb,
          R: Rb,
        });
      }

      if (it.type === "battery") {
        // model: ideal V source in series with Rint
        const Vraw = parseSIValue(it.V ?? 9);
        const V = Number.isFinite(Vraw) ? Vraw : 9;

        const Rint = safeResistance(it.Rint ?? 0.2, 0.2);

        const sourceIndex = voltageSources.length;
        const internal = nodeCount + sourceIndex;

        voltageSources.push({
          a: na,
          b: internal,
          V,
        });

        resistors.push({
          a: internal,
          b: nb,
          R: Rint,
        });

        batterySourceByItemId.set(it.id, {
          sourceIndex,
          V,
          Rint,
          aNet: na,
          bNet: nb,
          internalNet: internal,
        });
      }

      if (it.type === "ammeter") {
        // ammeter = nearly short circuit
        resistors.push({
          a: na,
          b: nb,
          R: 1e-4,
        });
      }

      // voltmeter / ohmmeter don't affect circuit
    }

    const maxNodeIndex =
      Math.max(
        nodeCount - 1,
        ...resistors.map((r) => Math.max(r.a, r.b)),
        ...voltageSources.map((v) => Math.max(v.a, v.b))
      ) + 1;

    // GMIN: tie all nodes weakly to ground to avoid singular matrices
    const GMIN_R = 1e12;

    for (let i = 0; i < maxNodeIndex; i++) {
      if (i === ground) continue;

      resistors.push({
        a: i,
        b: ground,
        R: GMIN_R,
      });
    }

    const mna = solveMNA({
      nodeCount: maxNodeIndex,
      ground,
      resistors,
      currentSources,
      voltageSources,
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
      voltageSources,
      resistors,
      wires,
      batterySourceByItemId,
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

      if (copy.type === "bulb") {
        copy.brightness = 0;
        copy.displayVoltage = "—";
        copy.displayCurrent = "—";
        copy.displayPower = "—";
      }

      if (copy.type === "battery") {
        copy.displayCurrent = "—";
        copy.displayPower = "—";
      }

      return copy;
    });
  }

  const { nodeToNet, mna, wires, batterySourceByItemId } = sol;

  function V(net) {
    return mna?.V?.[net] ?? 0;
  }

  return items.map((it) => {
    const copy = { ...it };

    const { a, b } = itemPins(nodes, it.id);
    if (!a || !b) return copy;

    const na = nodeToNet.get(a.id);
    const nb = nodeToNet.get(b.id);

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