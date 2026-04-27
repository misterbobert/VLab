import { formatSI } from "./formatting";

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatRuntime(hours) {
  if (!Number.isFinite(hours)) return "∞";
  if (hours < 0) return "—";

  const totalMinutes = Math.floor(hours * 60);

  if (totalMinutes < 1) return "<1 min";

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h <= 0) return `${m} min`;
  if (m <= 0) return `${h} h`;

  return `${h} h ${m} min`;
}

function formatValue(value, unit) {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatSI(value, unit);
}

function itemPins(nodes, itemId) {
  const pins = nodes.filter((n) => n.itemId === itemId);
  const a = pins.find((p) => p.name === "a") || pins[0];
  const b = pins.find((p) => p.name === "b") || pins[1];

  return { a, b };
}

function getAppliedVoltageAcrossItem(item, nodes, sol) {
  if (!sol?.ok || !sol?.nodeToNet || !sol?.mna?.V) return 0;

  const { a, b } = itemPins(nodes, item.id);
  if (!a || !b) return 0;

  const na = sol.nodeToNet.get(a.id);
  const nb = sol.nodeToNet.get(b.id);

  if (na == null || nb == null) return 0;

  const va = sol.mna.V[na] ?? 0;
  const vb = sol.mna.V[nb] ?? 0;

  return va - vb;
}

function batteryEffectiveVoltage(nominalV, socPct) {
  const soc = Math.max(0, Math.min(100, socPct));

  if (soc <= 0.001) return 0;

  // Model didactic: tensiunea scade vizibil odată cu procentul.
  return nominalV * (soc / 100);
}

export function stepPowerStorage(items, nodes, sol, dtSec) {
  const dt = Math.max(0, Math.min(0.25, safeNumber(dtSec, 0.08)));

  return items.map((item) => {
    const copy = { ...item };

    if (copy.type === "battery") {
      const nominalV = safeNumber(copy.V, 9);
      const capacityMah = Math.max(1, safeNumber(copy.capacityMah, 2000));
      const oldSoc = Math.max(0, Math.min(100, safeNumber(copy.socPct, 100)));

      let currentA = 0;

      const meta = sol?.batterySourceByItemId?.get?.(copy.id);

      if (sol?.ok && meta) {
        currentA = Math.abs(sol.mna?.Ivs?.[meta.sourceIndex] ?? 0);
      }

      let nextSoc = oldSoc;

      if (copy.dischargeEnabled !== false && currentA > 0.000001) {
        const usedMah = currentA * 1000 * (dt / 3600);
        const usedPct = (usedMah / capacityMah) * 100;

        nextSoc = Math.max(0, oldSoc - usedPct);
      }

      const effectiveV = batteryEffectiveVoltage(nominalV, nextSoc);
      const powerW = currentA * Math.abs(effectiveV);

      const remainingMah = capacityMah * (nextSoc / 100);
      const runtimeHours =
        currentA > 0.000001 ? remainingMah / (currentA * 1000) : Infinity;

      copy.socPct = nextSoc;
      copy.effectiveV = effectiveV;

      copy.displayCurrent = formatValue(currentA, "A");
      copy.displayPower = formatValue(powerW, "W");
      copy.displayRuntime = formatRuntime(runtimeHours);
    }

    if (copy.type === "capacitor") {
      const C = Math.max(1e-12, safeNumber(copy.C, 0.001));
      const Vmax = Math.max(0.000001, safeNumber(copy.Vmax, 9));
      const oldVoltage = safeNumber(copy.capVoltage, 0);

      const appliedVoltage = getAppliedVoltageAcrossItem(copy, nodes, sol);

      let currentA = 0;

      const meta = sol?.capacitorSourceByItemId?.get?.(copy.id);

      if (sol?.ok && meta) {
        currentA = Math.abs(sol.mna?.Ivs?.[meta.sourceIndex] ?? 0);
      }

      let nextVoltage = oldVoltage;

      const hasExternalVoltage = Math.abs(appliedVoltage) > 0.001;

      const voltageWantsToCharge =
        hasExternalVoltage &&
        Math.abs(appliedVoltage) > Math.abs(oldVoltage) + 0.001;

      const isDeliveringPower =
        currentA > 0.000001 && Math.abs(oldVoltage) > 0.0001;

      if (voltageWantsToCharge) {
        const tau = Math.max(0, safeNumber(copy.chargeTimeSec, 1.2));

        if (tau <= 0.02) {
          nextVoltage = appliedVoltage;
        } else {
          const k = 1 - Math.exp(-dt / tau);
          nextVoltage = oldVoltage + (appliedVoltage - oldVoltage) * k;
        }
      } else if (isDeliveringPower) {
        // Model didactic:
        // când condensatorul alimentează un consumator, îl descărcăm după timpul setat în Inspector,
        // nu după formula fizică dură I/C, care îl golește instant la valori mici.
        const tau = Math.max(0, safeNumber(copy.dischargeTimeSec, 2));

        if (tau <= 0.02) {
          nextVoltage = 0;
        } else {
          const k = 1 - Math.exp(-dt / tau);
          nextVoltage = oldVoltage + (0 - oldVoltage) * k;
        }
      } else if (!hasExternalVoltage && copy.leakageEnabled !== false) {
        // Pierdere lentă când nu e alimentat și nu descarcă activ pe consumator.
        const tau = Math.max(0.02, safeNumber(copy.dischargeTimeSec, 2));
        const k = 1 - Math.exp(-dt / tau);

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
      copy.displayCurrent = formatValue(currentA, "A");
      copy.displayCharge = formatValue(charge, "C");
      copy.displayEnergy = formatValue(energy, "J");
      copy.displayPercent = `${Math.round(percent * 100)}%`;
    }

    return copy;
  });
}