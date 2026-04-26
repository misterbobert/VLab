import { computeNets } from "./nets";

function parseSIValue(v, fallback = 0) {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : fallback;
  }

  if (v == null) return fallback;

  const s = String(v)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[ΩVAW]/gi, "");

  const m = s.match(/^(-?\d+(?:\.\d+)?)([pnumkMGTµu])?$/);

  if (!m) {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
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

function itemPins(nodes, itemId) {
  const pins = nodes.filter((n) => n.itemId === itemId);
  const a = pins.find((p) => p.name === "a") || pins[0];
  const b = pins.find((p) => p.name === "b") || pins[1];

  return { a, b };
}

function buildNodeToNet(nodes, wires) {
  const nets = computeNets(nodes, wires);
  const nodeToNet = new Map();

  nets.forEach((net, index) => {
    for (const nodeId of net) {
      nodeToNet.set(nodeId, index);
    }
  });

  return { nets, nodeToNet };
}

function pairKey(a, b) {
  return [a, b].sort((x, y) => x - y).join("-");
}

function getItemNets(item, nodes, nodeToNet) {
  const { a, b } = itemPins(nodes, item.id);
  if (!a || !b) return null;

  const na = nodeToNet.get(a.id);
  const nb = nodeToNet.get(b.id);

  if (na == null || nb == null) return null;

  return { a: na, b: nb };
}

function getNetVoltage(sol, net) {
  return sol?.mna?.V?.[net] ?? 0;
}

function addWarning(warnings, warning) {
  const exists = warnings.some(
    (w) => w.title === warning.title && w.message === warning.message
  );

  if (!exists) {
    warnings.push(warning);
  }
}

function isRealLoad(item) {
  return (
    item.type === "resistor" ||
    item.type === "bulb" ||
    item.type === "switch" ||
    item.type === "battery"
  );
}

function isNearZeroConductor(item) {
  return item.type === "ammeter" || (item.type === "switch" && item.closed);
}

function hasDirectShortPathBetweenNets(
  startNet,
  endNet,
  items,
  nodes,
  wires,
  nodeToNet
) {
  if (startNet === endNet) return true;

  const adj = new Map();

  function addEdge(a, b) {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);

    adj.get(a).push(b);
    adj.get(b).push(a);
  }

  for (const wire of wires) {
    const a = nodeToNet.get(wire.aNodeId);
    const b = nodeToNet.get(wire.bNodeId);

    if (a == null || b == null) continue;

    addEdge(a, b);
  }

  for (const item of items) {
    if (!isNearZeroConductor(item)) continue;

    const nets = getItemNets(item, nodes, nodeToNet);
    if (!nets) continue;

    addEdge(nets.a, nets.b);
  }

  const seen = new Set();
  const stack = [startNet];

  seen.add(startNet);

  while (stack.length) {
    const current = stack.pop();

    if (current === endNet) return true;

    for (const next of adj.get(current) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }

  return false;
}

export function detectCircuitWarnings(items, nodes, wires, sol) {
  const warnings = [];

  const { nodeToNet } = buildNodeToNet(nodes, wires);

  const componentPairs = new Map();
  const netUsage = new Map();

  for (const item of items) {
    const nets = getItemNets(item, nodes, nodeToNet);
    if (!nets) continue;

    const key = pairKey(nets.a, nets.b);

    if (!componentPairs.has(key)) {
      componentPairs.set(key, []);
    }

    componentPairs.get(key).push(item);

    if (!netUsage.has(nets.a)) netUsage.set(nets.a, []);
    if (!netUsage.has(nets.b)) netUsage.set(nets.b, []);

    netUsage.get(nets.a).push(item);
    netUsage.get(nets.b).push(item);
  }

  // 1. Ampermetru pus în paralel cu o sarcină
  for (const item of items) {
    if (item.type !== "ammeter") continue;

    const nets = getItemNets(item, nodes, nodeToNet);
    if (!nets) continue;

    const sameBranchItems = componentPairs.get(pairKey(nets.a, nets.b)) || [];

    const hasParallelLoad = sameBranchItems.some(
      (x) => x.id !== item.id && isRealLoad(x)
    );

    if (hasParallelLoad) {
      addWarning(warnings, {
        title: "Ampermetrul este legat greșit",
        message:
          "Ai conectat ampermetrul în paralel cu o componentă. Ampermetrul trebuie legat în serie, deoarece are rezistență foarte mică. În paralel poate produce un scurtcircuit și poate strica aparatul.",
        severity: "danger",
      });
    }
  }

  // 2. Voltmetru pus în serie
  for (const item of items) {
    if (item.type !== "voltmeter") continue;

    const nets = getItemNets(item, nodes, nodeToNet);
    if (!nets) continue;

    const itemsOnA = (netUsage.get(nets.a) || []).filter(
      (x) => x.id !== item.id
    );

    const itemsOnB = (netUsage.get(nets.b) || []).filter(
      (x) => x.id !== item.id
    );

    const realOnA = itemsOnA.filter(isRealLoad);
    const realOnB = itemsOnB.filter(isRealLoad);

    const sameBranchItems = componentPairs.get(pairKey(nets.a, nets.b)) || [];

    const hasParallelTarget = sameBranchItems.some(
      (x) => x.id !== item.id && isRealLoad(x)
    );

    const looksSeries =
      !hasParallelTarget &&
      realOnA.length > 0 &&
      realOnB.length > 0 &&
      realOnA.length <= 2 &&
      realOnB.length <= 2;

    if (looksSeries) {
      addWarning(warnings, {
        title: "Voltmetrul este legat greșit",
        message:
          "Ai conectat voltmetrul în serie. Voltmetrul trebuie legat în paralel cu elementul pe care vrei să măsori tensiunea. Dacă îl pui în serie, circuitul este practic întrerupt deoarece voltmetrul are rezistență foarte mare.",
        severity: "warning",
      });
    }
  }

  // 3. Bec suprasolicitat
  if (sol?.ok) {
    for (const item of items) {
      if (item.type !== "bulb") continue;

      const nets = getItemNets(item, nodes, nodeToNet);
      if (!nets) continue;

      const va = getNetVoltage(sol, nets.a);
      const vb = getNetVoltage(sol, nets.b);

      const voltage = Math.abs(va - vb);
      const resistance = Math.max(0.000001, parseSIValue(item.R, 30));

      const maxPower = Math.max(
        0.000001,
        parseSIValue(item.Pnom ?? item.ratedPowerW, 0.5)
      );

      const power = (voltage * voltage) / resistance;

      if (power > maxPower * 1.1) {
        addWarning(warnings, {
          title: "Becul este suprasolicitat",
          message:
            `Becul primește aproximativ ${power.toFixed(2)} W, dar este setat pentru maximum ${maxPower.toFixed(2)} W. ` +
            "În realitate, becul s-ar arde sau s-ar deteriora. Scade tensiunea, crește rezistența sau folosește un bec cu putere nominală mai mare.",
          severity: "danger",
        });
      }
    }
  }

  // 4. Bec polarizat conectat invers
  if (sol?.ok) {
    for (const item of items) {
      if (item.type !== "bulb") continue;
      if (item.polaritySensitive === false) continue;

      const nets = getItemNets(item, nodes, nodeToNet);
      if (!nets) continue;

      const va = getNetVoltage(sol, nets.a);
      const vb = getNetVoltage(sol, nets.b);

      const delta = va - vb;

      if (delta < -0.01) {
        addWarning(warnings, {
          title: "Becul este conectat invers",
          message:
            "Ai conectat invers bornele becului. În simulator, pinul stâng al becului este considerat plus, iar pinul drept este considerat minus. Leagă plusul bateriei spre plusul becului și minusul bateriei spre minusul becului.",
          severity: "danger",
        });
      }
    }
  }

  // 5. Borne inversate la voltmetru / ampermetru
  if (sol?.ok) {
    for (const item of items) {
      if (item.type !== "voltmeter" && item.type !== "ammeter") continue;

      const nets = getItemNets(item, nodes, nodeToNet);
      if (!nets) continue;

      const va = getNetVoltage(sol, nets.a);
      const vb = getNetVoltage(sol, nets.b);

      const delta = va - vb;

      if (delta < -0.01) {
        addWarning(warnings, {
          title: "Bornele aparatului par inversate",
          message:
            "Borna pozitivă și borna negativă par conectate invers. Aparatul poate afișa o valoare negativă sau o măsurare interpretată greșit.",
          severity: "info",
        });
      }
    }
  }

  // 6. Baterii conectate greșit în paralel
  const batteries = items.filter((item) => item.type === "battery");

  for (let i = 0; i < batteries.length; i++) {
    for (let j = i + 1; j < batteries.length; j++) {
      const b1 = batteries[i];
      const b2 = batteries[j];

      const n1 = getItemNets(b1, nodes, nodeToNet);
      const n2 = getItemNets(b2, nodes, nodeToNet);

      if (!n1 || !n2) continue;

      const sameDirection = n1.a === n2.a && n1.b === n2.b;
      const oppositeDirection = n1.a === n2.b && n1.b === n2.a;

      if (!sameDirection && !oppositeDirection) continue;

      const v1 = parseSIValue(b1.V, 9);
      const v2 = parseSIValue(b2.V, 9);

      if (oppositeDirection) {
        addWarning(warnings, {
          title: "Baterii conectate cu polaritate opusă",
          message:
            "Ai conectat două surse de tensiune în paralel, dar cu polaritate opusă. În realitate, asta poate produce curenți foarte mari, încălzire și deteriorarea surselor.",
          severity: "danger",
        });
      }

      if (sameDirection && Math.abs(v1 - v2) > 0.01) {
        addWarning(warnings, {
          title: "Baterii diferite conectate în paralel",
          message:
            "Ai conectat în paralel două baterii cu tensiuni diferite. În realitate, bateria cu tensiune mai mare poate încărca forțat bateria cu tensiune mai mică, ceea ce este periculos.",
          severity: "warning",
        });
      }
    }
  }

  // 7. Plusul și minusul aceleiași baterii ajung legate direct între ele
  for (const battery of batteries) {
    const nets = getItemNets(battery, nodes, nodeToNet);
    if (!nets) continue;

    const shorted = hasDirectShortPathBetweenNets(
      nets.a,
      nets.b,
      items,
      nodes,
      wires,
      nodeToNet
    );

    if (shorted) {
      addWarning(warnings, {
        title: "Bateria este scurtcircuitată",
        message:
          "Ai legat practic borna pozitivă și borna negativă ale bateriei direct între ele, fără o sarcină utilă între ele. În realitate, acest lucru produce un curent foarte mare, încălzire și poate deteriora bateria sau cablurile.",
        severity: "danger",
      });
    }
  }

  return warnings;
}