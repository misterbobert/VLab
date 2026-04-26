import { computeNets } from "./nets";
import { formatSI } from "./formatting";

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

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatValue(value, unit) {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatSI(value, unit);
}

function getTargetVoltageForCapacitor(cap, nodes, wires, sol) {
  const { nodeToNet } = sol?.nodeToNet ? sol : buildNodeToNet(nodes, wires);

  const { a, b } = itemPins(nodes, cap.id);
  if (!a || !b) return 0;

  const na = nodeToNet.get(a.id);
  const nb = nodeToNet.get(b.id);

  if (na == null || nb == null) return 0;

  const va = sol?.mna?.V?.[na] ?? 0;
  const vb = sol?.mna?.V?.[nb] ?? 0;

  return va - vb;
}

export function stepCapacitors(items, nodes, wires, sol, dtSec) {
  const dt = Math.max(0, Math.min(0.25, safeNumber(dtSec, 0.08)));

  return items.map((item) => {
    if (item.type !== "capacitor") return item;

    const copy = { ...item };

    const C = Math.max(1e-12, safeNumber(copy.C, 0.001));
    const Vmax = Math.max(0.000001, safeNumber(copy.Vmax, 9));
    const oldVoltage = safeNumber(copy.capVoltage, 0);

    let targetVoltage = sol?.ok
      ? getTargetVoltageForCapacitor(copy, nodes, wires, sol)
      : 0;

    if (!Number.isFinite(targetVoltage)) targetVoltage = 0;

    const isCharging = Math.abs(targetVoltage) > Math.abs(oldVoltage);
    const tau = Math.max(
      0,
      safeNumber(
        isCharging ? copy.chargeTimeSec : copy.dischargeTimeSec,
        isCharging ? 1.2 : 2.0
      )
    );

    let nextVoltage = oldVoltage;

    if (tau <= 0.02) {
      nextVoltage = targetVoltage;
    } else {
      const k = 1 - Math.exp(-dt / tau);
      nextVoltage = oldVoltage + (targetVoltage - oldVoltage) * k;
    }

    if (Math.abs(targetVoltage) < 0.001 && copy.leakageEnabled !== false) {
      const dischargeTau = Math.max(0.02, safeNumber(copy.dischargeTimeSec, 2));
      const k = 1 - Math.exp(-dt / dischargeTau);
      nextVoltage = oldVoltage + (0 - oldVoltage) * k;
    }

    if (Math.abs(nextVoltage) < 0.0001) {
      nextVoltage = 0;
    }

    const absV = Math.abs(nextVoltage);
    const percent = Math.max(0, Math.min(1, absV / Vmax));
    const charge = C * absV;
    const energy = 0.5 * C * absV * absV;

    copy.capVoltage = nextVoltage;
    copy.displayVoltage = formatValue(nextVoltage, "V");
    copy.displayCharge = formatValue(charge, "C");
    copy.displayEnergy = formatValue(energy, "J");
    copy.displayPercent = `${Math.round(percent * 100)}%`;

    return copy;
  });
}

export function resetCapacitors(items) {
  return items.map((item) => {
    if (item.type !== "capacitor") return item;

    return {
      ...item,
      capVoltage: 0,
      displayVoltage: "—",
      displayCharge: "—",
      displayEnergy: "—",
      displayPercent: "0%",
    };
  });
}