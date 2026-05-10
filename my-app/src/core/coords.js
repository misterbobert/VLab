export function screenToWorld(sx, sy, cam) {
  return {
    x: (sx - cam.x) / cam.z,
    y: (sy - cam.y) / cam.z,
  };
}

export function worldToScreen(x, y, cam) {
  return {
    x: x * cam.z + cam.x,
    y: y * cam.z + cam.y,
  };
}

export function drawInfiniteGrid(ctx, w, h, cam) {
  const grid = 40 * cam.z;

  ctx.save();

  ctx.fillStyle = "#0b0f17";
  ctx.fillRect(0, 0, w, h);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";

  const ox = cam.x % grid;
  const oy = cam.y % grid;

  for (let x = ox; x < w; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  for (let y = oy; y < h; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBadge(ctx, x, y, text) {
  ctx.save();

  ctx.font = "bold 13px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const padX = 7;
  const w = Math.max(18, ctx.measureText(text).width + padX * 2);
  const h = 18;

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 6;

  ctx.fillStyle = "rgba(10,14,22,0.85)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;

  roundRect(ctx, x - w / 2, y - h / 2, w, h, 9);

  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(text, x, y);

  ctx.restore();
}

function drawJunction(ctx, x, y, active = false) {
  ctx.save();

  // glow
  ctx.beginPath();
  ctx.fillStyle = active
    ? "rgba(255,220,120,0.18)"
    : "rgba(120,200,255,0.14)";
  ctx.arc(x, y, active ? 12 : 10, 0, Math.PI * 2);
  ctx.fill();

  // outer ring
  ctx.beginPath();
  ctx.lineWidth = active ? 2.5 : 2;
  ctx.strokeStyle = active
    ? "rgba(255,220,120,0.95)"
    : "rgba(120,200,255,0.95)";
  ctx.arc(x, y, active ? 6.5 : 5.5, 0, Math.PI * 2);
  ctx.stroke();

  // inner dot
  ctx.beginPath();
  ctx.fillStyle = active
    ? "rgba(255,235,170,0.98)"
    : "rgba(170,225,255,0.98)";
  ctx.arc(x, y, active ? 3.3 : 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawComponentPin(ctx, x, y, active = false) {
  ctx.save();

  if (active) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,220,120,0.16)";
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = active
    ? "rgba(255,235,170,0.98)"
    : "rgba(255,255,255,0.68)";

  ctx.strokeStyle = active
    ? "rgba(255,220,120,0.95)"
    : "rgba(255,255,255,0.22)";

  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(x, y, active ? 5 : 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}



function parseSIValue(value, expectedUnit = "") {
  if (typeof value === "number") return value;
  if (value == null) return NaN;

  const raw = String(value).trim();
  if (!raw || raw === "—" || raw === "∞") return NaN;

  if (expectedUnit && !raw.toLowerCase().includes(expectedUnit.toLowerCase())) {
    return NaN;
  }

  const clean = raw
    .replace(",", ".")
    .replace(/\s+/g, "")
    .replace(/[ΩVAWAhFJC%]/gi, "");

  const m = clean.match(/^(-?\d+(?:\.\d+)?)(p|n|u|µ|m|k|M|G|T)?$/);
  if (!m) {
    const n = Number(clean);
    return Number.isFinite(n) ? n : NaN;
  }

  const num = Number(m[1]);
  if (!Number.isFinite(num)) return NaN;

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

function parseAmpValue(value) {
  const parsed = parseSIValue(value, "A");
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function safeNumber(value, fallback) {
  const parsed = parseSIValue(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeResistance(value, fallback) {
  return Math.max(1e-6, safeNumber(value, fallback));
}

function itemCurrentAbs(item) {
  if (!item) return 0;

  const candidates = [
    item.displayCurrent,
    item.displayIc,
    item.displayIb,
    item.display,
    item.current,
    item.I,
  ];

  let best = 0;

  for (const value of candidates) {
    const parsed = parseAmpValue(value);
    if (parsed > best) best = parsed;
  }

  return best;
}

function itemPins(nodes, itemId) {
  return nodes.filter((n) => n.itemId === itemId);
}

function pinByName(pins, name, fallbackIndex = 0) {
  return pins.find((p) => p.name === name) || pins[fallbackIndex] || null;
}

function nodeToNetGet(sol, nodeId) {
  const map = sol?.nodeToNet;
  if (!map) return null;
  if (typeof map.get === "function") return map.get(nodeId);
  return map[nodeId] ?? null;
}

function voltageForNode(nodeId, sol) {
  const net = nodeToNetGet(sol, nodeId);
  if (net == null) return 0;
  return sol?.mna?.V?.[net] ?? 0;
}

function voltageDiff(aNode, bNode, sol) {
  return voltageForNode(aNode.id, sol) - voltageForNode(bNode.id, sol);
}


function addPinInjection(map, pin, amount) {
  if (!pin || !pin.id) return;
  const n = Number(amount);
  if (!Number.isFinite(n) || Math.abs(n) < 1e-9) return;
  map.set(pin.id, (map.get(pin.id) || 0) + n);
}

function addComponentCurrent(map, pinA, pinB, currentAtoB) {
  const I = Number(currentAtoB);
  if (!pinA || !pinB || !Number.isFinite(I) || Math.abs(I) < 1e-9) return;

  // Convenție:
  // currentAtoB > 0 înseamnă curent prin componentă de la A la B.
  // Deci la A curentul INTRĂ în componentă => componenta scoate -I în cablu.
  // La B curentul IESE din componentă => componenta scoate +I în cablu.
  addPinInjection(map, pinA, -I);
  addPinInjection(map, pinB, I);
}

function addSourceTerminalCurrent(map, pinA, pinB, sourceCurrentAtoInside) {
  const I = Number(sourceCurrentAtoInside);
  if (!pinA || !pinB || !Number.isFinite(I) || Math.abs(I) < 1e-9) return;

  // Pentru sursele de tensiune din MNA, Ivs este curentul care intră în sursă
  // prin pinul A. Asta dă direct injecția în cabluri:
  // pinA = -Ivs, pinB = +Ivs.
  addPinInjection(map, pinA, -I);
  addPinInjection(map, pinB, I);
}

function addPassiveTwoPin(map, aPin, bPin, sol, resistance, fallbackAbsCurrent = 0) {
  if (!aPin || !bPin || !sol?.ok) return;

  const R = Math.max(1e-9, resistance);
  let Iab = voltageDiff(aPin, bPin, sol) / R;

  if ((!Number.isFinite(Iab) || Math.abs(Iab) < 1e-9) && fallbackAbsCurrent > 1e-9) {
    const dv = voltageDiff(aPin, bPin, sol);
    Iab = (dv >= 0 ? 1 : -1) * Math.abs(fallbackAbsCurrent);
  }

  addComponentCurrent(map, aPin, bPin, Iab);
}

function addBatteryInjection(map, item, aPin, bPin, sol) {
  const meta = sol?.batterySourceByItemId?.get?.(item.id);
  const signed = meta ? Number(sol?.mna?.Ivs?.[meta.sourceIndex] ?? 0) : NaN;

  if (Number.isFinite(signed) && Math.abs(signed) > 1e-9) {
    addSourceTerminalCurrent(map, aPin, bPin, signed);
    return;
  }

  const fallback = itemCurrentAbs(item);
  if (fallback <= 1e-9) return;

  const va = voltageForNode(aPin.id, sol);
  const vb = voltageForNode(bPin.id, sol);
  if (va >= vb) {
    addPinInjection(map, aPin, fallback);
    addPinInjection(map, bPin, -fallback);
  } else {
    addPinInjection(map, bPin, fallback);
    addPinInjection(map, aPin, -fallback);
  }
}

function addCapacitorInjection(map, item, aPin, bPin, sol) {
  const meta = sol?.capacitorSourceByItemId?.get?.(item.id);
  const signed = meta ? Number(sol?.mna?.Ivs?.[meta.sourceIndex] ?? 0) : NaN;

  if (Number.isFinite(signed) && Math.abs(signed) > 1e-9) {
    addSourceTerminalCurrent(map, aPin, bPin, signed);
    return;
  }

  // Când condensatorul este neîncărcat, modelul didactic îl încarcă în
  // powerDynamics, nu ca element MNA. Pentru animație folosim sensul tensiunii
  // aplicate și curentul afișat, dacă există.
  const fallback = itemCurrentAbs(item);
  if (fallback <= 1e-9) return;

  const dv = voltageDiff(aPin, bPin, sol);
  addComponentCurrent(map, aPin, bPin, (dv >= 0 ? 1 : -1) * fallback);
}

function addDiodeInjection(map, item, aPin, bPin, sol) {
  const meta = sol?.diodeMetaByItemId?.get?.(item.id);

  if (meta?.active && meta.sourceIndex != null) {
    const signed = Number(sol?.mna?.Ivs?.[meta.sourceIndex] ?? 0);
    if (Number.isFinite(signed) && Math.abs(signed) > 1e-9) {
      addSourceTerminalCurrent(map, aPin, bPin, signed);
      return;
    }
  }

  const R = meta?.active
    ? safeResistance(item.Ron ?? item.ron ?? 1, 1)
    : safeResistance(item.Roff ?? item.roff ?? 1000000000, 1000000000);
  addPassiveTwoPin(map, aPin, bPin, sol, R, itemCurrentAbs(item));
}

function addTransistorInjection(map, item, nodes, sol) {
  const pins = itemPins(nodes, item.id);
  const bPin = pinByName(pins, "b", 0) || pinByName(pins, "B", 0) || pinByName(pins, "base", 0);
  const cPin = pinByName(pins, "c", 1) || pinByName(pins, "C", 1) || pinByName(pins, "collector", 1);
  const ePin = pinByName(pins, "e", 2) || pinByName(pins, "E", 2) || pinByName(pins, "emitter", 2);
  if (!bPin || !cPin || !ePin) return;

  const type = String(item.type ?? "").toLowerCase();
  const variant = String(item.variant ?? item.kind ?? item.transistorType ?? item.type ?? "NPN").toUpperCase();
  const isPnp = type.includes("pnp") || variant.includes("PNP");
  const meta = sol?.transistorMetaByItemId?.get?.(item.id);

  // Ramura colector-emitor este modelată ca rezistență Rce.
  const Rce = safeResistance(meta?.Rce ?? item.RonCE ?? item.ronCE ?? item.RoffCE ?? 1000000000, 1000000000);
  addPassiveTwoPin(map, cPin, ePin, sol, Rce, itemCurrentAbs(item));

  // Ramura bază-emitor, dacă tranzistorul este pornit, este o sursă Vbe + Rbe.
  if (meta?.baseSourceIndex != null) {
    const signed = Number(sol?.mna?.Ivs?.[meta.baseSourceIndex] ?? 0);
    if (Number.isFinite(signed) && Math.abs(signed) > 1e-9) {
      if (isPnp) {
        // În solver, PNP-ul are sursa între E și B.
        addSourceTerminalCurrent(map, ePin, bPin, signed);
      } else {
        // NPN-ul are sursa între B și E.
        addSourceTerminalCurrent(map, bPin, ePin, signed);
      }
    }
    return;
  }

  // Când e oprit, lăsăm doar o scurgere foarte mică, dacă apare numeric.
  const RbeOff = safeResistance(item.RoffCE ?? item.RbeOff ?? 1000000000, 1000000000);
  addPassiveTwoPin(map, bPin, ePin, sol, RbeOff, 0);
}

function buildPinInjectionMap(nodes, items, sol) {
  const map = new Map();
  if (!sol?.ok) return map;

  for (const item of items || []) {
    if (!item?.id) continue;
    const type = String(item.type ?? "").toLowerCase();

    if (
      type === "transistor" ||
      type === "transistor_npn" ||
      type === "transistor_pnp" ||
      type === "npn" ||
      type === "pnp"
    ) {
      addTransistorInjection(map, item, nodes, sol);
      continue;
    }

    const pins = itemPins(nodes, item.id);
    const a = pinByName(pins, "a", 0);
    const b = pinByName(pins, "b", 1);
    if (!a || !b) continue;

    if (type === "battery") {
      addBatteryInjection(map, item, a, b, sol);
    } else if (type === "capacitor") {
      addCapacitorInjection(map, item, a, b, sol);
    } else if (type === "diode") {
      addDiodeInjection(map, item, a, b, sol);
    } else if (type === "resistor") {
      addPassiveTwoPin(map, a, b, sol, safeResistance(item.R ?? 100, 100));
    } else if (type === "potentiometer") {
      const r =
        item.R ??
        item.resistance ??
        item.currentR ??
        Math.max(
          1,
          safeResistance(item.Rmin ?? 0, 0) +
            (safeResistance(item.Rmax ?? 10000, 10000) - safeResistance(item.Rmin ?? 0, 0)) *
              (safeNumber(item.positionPct ?? item.position ?? 50, 50) / 100)
        );
      addPassiveTwoPin(map, a, b, sol, safeResistance(r, 10000));
    } else if (type === "bulb") {
      addPassiveTwoPin(map, a, b, sol, safeResistance(item.R ?? 30, 30));
    } else if (type === "switch") {
      if (item.closed) addPassiveTwoPin(map, a, b, sol, 1e-4);
    } else if (type === "ammeter") {
      addPassiveTwoPin(map, a, b, sol, 1e-4);
    }
  }

  // Curățăm zgomotul numeric foarte mic.
  for (const [id, value] of [...map.entries()]) {
    if (!Number.isFinite(value) || Math.abs(value) < 1e-7) map.delete(id);
  }

  return map;
}

function makeEdgeKey(a, b) {
  return [a, b].sort().join("__");
}

function buildWireGraph(nodes, wires) {
  const adj = new Map(nodes.map((n) => [n.id, []]));

  for (let i = 0; i < wires.length; i++) {
    const w = wires[i];
    if (!adj.has(w.aNodeId) || !adj.has(w.bNodeId)) continue;

    adj.get(w.aNodeId).push(w.bNodeId);
    adj.get(w.bNodeId).push(w.aNodeId);
  }

  return adj;
}

function shortestWirePath(adj, start, goal) {
  if (start === goal) return [start];

  const queue = [start];
  const prev = new Map([[start, null]]);

  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];

    for (const nx of adj.get(cur) || []) {
      if (prev.has(nx)) continue;

      prev.set(nx, cur);
      if (nx === goal) {
        const path = [goal];
        let p = cur;
        while (p != null) {
          path.push(p);
          p = prev.get(p);
        }
        return path.reverse();
      }
      queue.push(nx);
    }
  }

  return null;
}

function connectedComponentsOfWireGraph(adj) {
  const seen = new Set();
  const groups = [];

  for (const id of adj.keys()) {
    if (seen.has(id)) continue;

    const q = [id];
    const group = new Set([id]);
    seen.add(id);

    for (let i = 0; i < q.length; i++) {
      const cur = q[i];
      for (const nx of adj.get(cur) || []) {
        if (seen.has(nx)) continue;
        seen.add(nx);
        group.add(nx);
        q.push(nx);
      }
    }

    groups.push(group);
  }

  return groups;
}

function addDirectedWireFlow(flowMap, wireMap, wires, from, to, amount) {
  const edgeKey = makeEdgeKey(from, to);
  const wireIndex = wireMap.get(edgeKey);
  if (wireIndex == null) return;

  const w = wires[wireIndex];
  const previous = flowMap.get(edgeKey) || 0;
  const sign = w.aNodeId === from && w.bNodeId === to ? 1 : -1;

  flowMap.set(edgeKey, previous + sign * amount);
}

function buildWireFlowMap(nodes, wires, items, sol) {
  const adj = buildWireGraph(nodes, wires);
  const wireMap = new Map();

  for (let i = 0; i < wires.length; i++) {
    wireMap.set(makeEdgeKey(wires[i].aNodeId, wires[i].bNodeId), i);
  }

  const injections = buildPinInjectionMap(nodes, items, sol);
  const flowMap = new Map();
  if (!injections.size) return flowMap;

  const groups = connectedComponentsOfWireGraph(adj);

  for (const group of groups) {
    const sources = [];
    const sinks = [];

    for (const nodeId of group) {
      const amount = injections.get(nodeId) || 0;
      if (amount > 1e-7) sources.push({ id: nodeId, amount });
      if (amount < -1e-7) sinks.push({ id: nodeId, amount: -amount });
    }

    if (!sources.length || !sinks.length) continue;

    // Într-o rețea de fire ideale cu bucle, distribuția exactă pe fiecare
    // segment nu este unică. Alegem o distribuție validă KCL: fiecare injecție
    // pozitivă este rutată către cele mai apropiate consumuri negative.
    for (const source of sources) {
      let remainingSource = source.amount;

      while (remainingSource > 1e-7) {
        let bestSink = null;
        let bestPath = null;

        for (const sink of sinks) {
          if (sink.amount <= 1e-7) continue;
          const path = shortestWirePath(adj, source.id, sink.id);
          if (!path || path.length < 2) continue;
          if (!bestPath || path.length < bestPath.length) {
            bestPath = path;
            bestSink = sink;
          }
        }

        if (!bestPath || !bestSink) break;

        const amount = Math.min(remainingSource, bestSink.amount);
        for (let i = 0; i < bestPath.length - 1; i++) {
          addDirectedWireFlow(flowMap, wireMap, wires, bestPath[i], bestPath[i + 1], amount);
        }

        remainingSource -= amount;
        bestSink.amount -= amount;
      }
    }
  }

  return flowMap;
}

function normalizedPairKey(a, b) {
  return [String(a), String(b)].sort().join("__");
}

function buildNetMapFromWires(nodes, wires) {
  const parent = new Map(nodes.map((n) => [n.id, n.id]));

  function find(x) {
    if (!parent.has(x)) parent.set(x, x);
    let p = parent.get(x);
    if (p !== x) {
      p = find(p);
      parent.set(x, p);
    }
    return p;
  }

  function unite(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  }

  for (const w of wires || []) {
    if (w?.aNodeId && w?.bNodeId) unite(w.aNodeId, w.bNodeId);
  }

  const map = new Map();
  for (const n of nodes || []) map.set(n.id, find(n.id));
  return map;
}

function getNodeNetId(nodeId, fallbackNetMap, sol) {
  const fromSol = nodeToNetGet(sol, nodeId);
  if (fromSol != null) return `sol:${fromSol}`;
  return `wire:${fallbackNetMap.get(nodeId) ?? nodeId}`;
}

function markWiresTouchingNode(result, wires, nodeId) {
  for (let i = 0; i < (wires || []).length; i++) {
    const w = wires[i];
    if (w.aNodeId === nodeId || w.bNodeId === nodeId) result.add(i);
  }
}

function markWiresTouchingItem(result, wires, nodes, itemId) {
  for (const pin of itemPins(nodes, itemId)) {
    markWiresTouchingNode(result, wires, pin.id);
  }
}

function buildIndexedWireGraph(nodes, wires) {
  const adj = new Map(nodes.map((n) => [n.id, []]));

  for (let i = 0; i < (wires || []).length; i++) {
    const w = wires[i];
    if (!adj.has(w.aNodeId) || !adj.has(w.bNodeId)) continue;

    adj.get(w.aNodeId).push({ nodeId: w.bNodeId, wireIndex: i });
    adj.get(w.bNodeId).push({ nodeId: w.aNodeId, wireIndex: i });
  }

  return adj;
}

function shortestWireIndexPath(adj, start, goal) {
  if (!start || !goal || start === goal) return [];

  const q = [start];
  const prev = new Map([[start, null]]);

  for (let qi = 0; qi < q.length; qi++) {
    const cur = q[qi];

    for (const edge of adj.get(cur) || []) {
      if (prev.has(edge.nodeId)) continue;
      prev.set(edge.nodeId, { nodeId: cur, wireIndex: edge.wireIndex });

      if (edge.nodeId === goal) {
        const path = [];
        let x = goal;
        while (prev.get(x)) {
          const step = prev.get(x);
          path.push(step.wireIndex);
          x = step.nodeId;
        }
        return path.reverse();
      }

      q.push(edge.nodeId);
    }
  }

  return null;
}

function getTwoPinNetsForItem(item, nodes, fallbackNetMap, sol) {
  const pins = itemPins(nodes, item.id);
  const a = pinByName(pins, "a", 0);
  const b = pinByName(pins, "b", 1);
  if (!a || !b) return null;

  return {
    a,
    b,
    na: getNodeNetId(a.id, fallbackNetMap, sol),
    nb: getNodeNetId(b.id, fallbackNetMap, sol),
  };
}

function unorderedNetPair(nets) {
  if (!nets) return null;
  return normalizedPairKey(nets.na, nets.nb);
}

function isComponentLoadForDanger(item) {
  const type = String(item?.type ?? "").toLowerCase();
  return (
    type === "resistor" ||
    type === "potentiometer" ||
    type === "bulb" ||
    type === "capacitor" ||
    type === "diode" ||
    type === "battery" ||
    type === "switch"
  );
}

function buildDangerWireSet(nodes, wires, items, sol) {
  const result = new Set();
  const fallbackNetMap = buildNetMapFromWires(nodes, wires);
  const indexedGraph = buildIndexedWireGraph(nodes, wires);
  const pairItems = new Map();
  const netUsage = new Map();

  function addToNetUsage(net, item) {
    if (!netUsage.has(net)) netUsage.set(net, []);
    netUsage.get(net).push(item);
  }

  for (const item of items || []) {
    const nets = getTwoPinNetsForItem(item, nodes, fallbackNetMap, sol);
    if (!nets) continue;

    const key = unorderedNetPair(nets);
    if (!pairItems.has(key)) pairItems.set(key, []);
    pairItems.get(key).push(item);

    addToNetUsage(nets.na, item);
    addToNetUsage(nets.nb, item);
  }

  for (const item of items || []) {
    const type = String(item?.type ?? "").toLowerCase();
    const nets = getTwoPinNetsForItem(item, nodes, fallbackNetMap, sol);

    if (type === "battery" && nets) {
      // Caz grav: borna + și borna − sunt unite doar prin cabluri/joncțiuni.
      // Asta este scurtcircuitul cel mai clar vizual, deci colorăm traseul exact.
      const path = shortestWireIndexPath(indexedGraph, nets.a.id, nets.b.id);
      if (path && path.length) {
        for (const wireIndex of path) result.add(wireIndex);
      }
    }

    if (type === "ammeter" && nets) {
      const sameBranchItems = pairItems.get(unorderedNetPair(nets)) || [];
      const parallelLoad = sameBranchItems.some(
        (x) => x.id !== item.id && isComponentLoadForDanger(x)
      );

      if (parallelLoad) {
        markWiresTouchingItem(result, wires, nodes, item.id);
      }
    }

    if (type === "voltmeter" && nets) {
      const sameBranchItems = pairItems.get(unorderedNetPair(nets)) || [];
      const hasParallelTarget = sameBranchItems.some(
        (x) => x.id !== item.id && isComponentLoadForDanger(x)
      );
      const realOnA = (netUsage.get(nets.na) || []).filter(
        (x) => x.id !== item.id && isComponentLoadForDanger(x)
      );
      const realOnB = (netUsage.get(nets.nb) || []).filter(
        (x) => x.id !== item.id && isComponentLoadForDanger(x)
      );

      if (!hasParallelTarget && realOnA.length > 0 && realOnB.length > 0) {
        markWiresTouchingItem(result, wires, nodes, item.id);
      }
    }

    if (type === "bulb" && sol?.ok && nets) {
      const voltage = Math.abs(voltageForNode(nets.a.id, sol) - voltageForNode(nets.b.id, sol));
      const resistance = safeResistance(item.R ?? 30, 30);
      const ratedPower = Math.max(0.000001, safeNumber(item.Pnom ?? item.ratedPowerW ?? 0.5, 0.5));
      const power = (voltage * voltage) / resistance;
      const inverted = item.polaritySensitive !== false && voltageForNode(nets.a.id, sol) - voltageForNode(nets.b.id, sol) < -0.01;

      if (power > ratedPower * 1.1 || inverted) {
        markWiresTouchingItem(result, wires, nodes, item.id);
      }
    }

    if (type === "capacitor" && sol?.ok && nets) {
      const vmax = Math.max(0.000001, safeNumber(item.Vmax ?? 9, 9));
      const applied = Math.abs(voltageForNode(nets.a.id, sol) - voltageForNode(nets.b.id, sol));
      const inverted = item.polaritySensitive !== false && voltageForNode(nets.a.id, sol) - voltageForNode(nets.b.id, sol) < -0.01;

      if (applied > vmax * 1.05 || inverted) {
        markWiresTouchingItem(result, wires, nodes, item.id);
      }
    }
  }

  return result;
}

function segmentLength(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointOnPolyline(pts, distance) {
  if (!pts.length) return null;
  if (pts.length === 1) return pts[0];

  let total = 0;
  const lengths = [];

  for (let i = 0; i < pts.length - 1; i++) {
    const len = segmentLength(pts[i], pts[i + 1]);
    lengths.push(len);
    total += len;
  }

  if (total <= 0.0001) return pts[0];

  let d = ((distance % total) + total) % total;

  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i];
    if (d <= len) {
      const t = len <= 0.0001 ? 0 : d / len;
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * t,
      };
    }
    d -= len;
  }

  return pts[pts.length - 1];
}

function drawCurrentParticles(ctx, pts, currentA, timeMs, wireIndex) {
  if (!currentA || currentA < 0.000001) return;

  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += segmentLength(pts[i], pts[i + 1]);
  }

  if (total < 12) return;

  // Scară didactică: curentul determină viteza și densitatea particulelor.
  // Important: particulele NU mai sunt distribuite cu modulo pe lungimea totală
  // a firului. Asta producea efectul urât în care pe fire lungi nu mai apărea
  // nimic lângă componenta-sursă până când particulele vechi ajungeau la capăt.
  // Acum faza se repetă la fiecare `spacing`, deci se emit particule continuu.
  const normalized = Math.min(1, Math.log10(currentA * 1000 + 1) / 2.2);
  const speedPxPerSec = 42 + normalized * 260;
  const spacing = Math.max(22, 58 - normalized * 28);
  const radius = 2.0 + normalized * 2.2;
  const seed = (wireIndex * 13) % spacing;
  const phase = (((timeMs / 1000) * speedPxPerSec + seed) % spacing + spacing) % spacing;

  ctx.save();
  ctx.shadowColor = "rgba(103,232,249,0.9)";
  ctx.shadowBlur = 10 + normalized * 12;

  // Desenăm pe toată lungimea firului. Prima particulă este mereu la cel mult
  // `spacing` px de început, deci nu mai există pauze mari de emisie.
  for (let d = phase; d < total + spacing * 0.5; d += spacing) {
    if (d < 0 || d > total) continue;

    const p = pointOnPolyline(pts, d);
    if (!p) continue;

    // Ușor fade-in la început și fade-out la capăt, ca să pară că intră/iese
    // din componentă, nu că se teleportează.
    const edgeFade = Math.min(1, d / 18, (total - d) / 18);
    const alpha = (0.58 + normalized * 0.34) * Math.max(0.25, edgeFade);

    ctx.beginPath();
    ctx.fillStyle = `rgba(165,243,252,${alpha})`;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.72 + normalized * 0.22})`;
    ctx.arc(
      p.x - radius * 0.28,
      p.y - radius * 0.28,
      Math.max(1, radius * 0.32),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

function drawWirePath(ctx, pts) {
  if (!pts.length) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }

  ctx.stroke();
}

export function drawWires(ctx, nodes, wires, cam, wireState, options = {}) {
  ctx.save();

  const items = options.items ?? [];
  const sol = options.sol ?? null;
  const running = !!options.running;
  const renderStyle = options.renderStyle ?? "real";
  const timeMs = options.timeMs ?? 0;
  const schematicMode = renderStyle === "schematic";
  const particlesEnabled = options.particlesEnabled !== false;

  // Particulele se bazează pe curenți calculați matematic din MNA:
  // 1) calculăm curentul semnat la fiecare pin al componentelor;
  // 2) respectăm KCL în fiecare net de fire;
  // 3) rutăm particulele de la pini care injectează curent spre pini care absorb curent.
  const showParticles = particlesEnabled && running && !schematicMode && !!sol?.ok;
  const wireFlowMap = showParticles
    ? buildWireFlowMap(nodes, wires, items, sol)
    : new Map();
  // Firele devin roșii doar după Start. Altfel, în timpul construirii
  // circuitului ar părea că aplicația acuză o greșeală înainte să simulezi.
  const dangerWireSet = running
    ? buildDangerWireSet(nodes, wires, items, sol)
    : new Set();

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const itemMap = new Map((items || []).map((it) => [it.id, it]));

  function nodePos(id) {
    const n = nodeMap.get(id);
    if (!n) return null;

    return worldToScreen(n.x, n.y, cam);
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let wireIndex = 0; wireIndex < wires.length; wireIndex++) {
    const w = wires[wireIndex];
    const a = nodePos(w.aNodeId);
    const b = nodePos(w.bNodeId);

    if (!a || !b) continue;

    const pts = [
      a,
      ...((w.points || []).map((p) => worldToScreen(p.x, p.y, cam))),
      b,
    ];

    const isDangerWire = dangerWireSet.has(wireIndex);

    if (schematicMode) {
      ctx.lineWidth = isDangerWire ? 6 : 4;
      ctx.strokeStyle = isDangerWire
        ? "rgba(248,113,113,0.98)"
        : "rgba(255,255,255,0.90)";
      if (isDangerWire) {
        ctx.shadowColor = "rgba(248,113,113,0.7)";
        ctx.shadowBlur = 12;
      }
      drawWirePath(ctx, pts);
      ctx.shadowBlur = 0;
    } else {
      ctx.lineWidth = isDangerWire ? 10 : 7;
      ctx.strokeStyle = isDangerWire
        ? "rgba(248,45,72,0.22)"
        : "rgba(70,160,255,0.13)";
      drawWirePath(ctx, pts);

      ctx.lineWidth = isDangerWire ? 4.5 : 3;
      ctx.strokeStyle = isDangerWire
        ? "rgba(255,78,96,0.96)"
        : "rgba(120,200,255,0.88)";
      if (isDangerWire) {
        ctx.shadowColor = "rgba(255,78,96,0.72)";
        ctx.shadowBlur = 14;
      }
      drawWirePath(ctx, pts);
      ctx.shadowBlur = 0;
    }

    if (showParticles && !isDangerWire) {
      const flow = wireFlowMap.get(makeEdgeKey(w.aNodeId, w.bNodeId)) || 0;
      const currentA = Math.abs(flow);

      if (currentA > 0.000001) {
        // flow pozitiv = sensul aNodeId -> bNodeId; negativ = invers.
        const directedPts = flow >= 0 ? pts : [...pts].reverse();
        drawCurrentParticles(ctx, directedPts, currentA, timeMs, wireIndex);
      }
    }
  }

  const activeNodeId = wireState?.startNodeId ?? null;

  // În modul schemă lăsăm simbolurile curate, fără buline de pini/joncțiuni.
  if (!schematicMode) {
    for (const n of nodes) {
      const p = worldToScreen(n.x, n.y, cam);
      const active = n.id === activeNodeId;

      const isJunction =
        n.kind === "junction" ||
        n.itemId == null ||
        n.name === "junction";

      if (isJunction) {
        drawJunction(ctx, p.x, p.y, active);
        continue;
      }

      drawComponentPin(ctx, p.x, p.y, active);

      const item = itemMap.get(n.itemId);
      let sign = null;

      // Nu mai punem +/− generic pe orice componentă, fiindcă la rezistor/bec
      // ar induce în eroare. Marcăm doar componentele polarizate unde sensul
      // contează vizual.
      if (item?.type === "battery") {
        sign = n.name === "a" ? "+" : n.name === "b" ? "−" : null;
      } else if (item?.type === "capacitor") {
        sign = n.name === "a" ? "+" : n.name === "b" ? "−" : null;
      } else if (item?.type === "diode") {
        sign = n.name === "a" ? "A" : n.name === "b" ? "K" : null;
      }

      if (sign) {
        drawBadge(ctx, p.x, p.y - 14, sign);
      }
    }
  }

  // preview wire
  if (wireState?.startNodeId && wireState?.previewWorld) {
    const a = nodePos(wireState.startNodeId);

    if (a) {
      const mids = (wireState.points || []).map((p) =>
        worldToScreen(p.x, p.y, cam)
      );

      const b = worldToScreen(
        wireState.previewWorld.x,
        wireState.previewWorld.y,
        cam
      );

      const pts = [a, ...mids, b];

      ctx.save();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.setLineDash([6, 6]);
      drawWirePath(ctx, pts);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.62)";
      ctx.setLineDash([6, 6]);
      drawWirePath(ctx, pts);

      ctx.setLineDash([]);

      ctx.restore();
    }
  }

  ctx.restore();
}

