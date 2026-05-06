import {
  batterySVG,
  resistorSVG,
  potentiometerSVG,
  diodeSVG,
  transistorSVG,
  bulbSVG,
  switchSVG,
  meterSVG,
  capacitorSVG,
} from "./renderersSvg";
import { formatSI } from "./formatting";

const cache = new Map();

function getCachedImage(svgString) {
  if (cache.has(svgString)) return cache.get(svgString);

  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
  cache.set(svgString, img);

  return img;
}

function getDefaultRenderStyle() {
  if (typeof window === "undefined") return "real";

  return localStorage.getItem("voltlab:renderStyle") === "schematic"
    ? "schematic"
    : "real";
}

export function getCircuitLabel(item, items = []) {
  const prefixes = {
    battery: "E",
    resistor: "R",
    potentiometer: "P",
    diode: "D",
    transistor_npn: "Q",
    transistor_pnp: "Q",
    capacitor: "C",
    bulb: "L",
    switch: "K",
    voltmeter: "V",
    ammeter: "A",
    ohmmeter: "Ω",
  };

  const prefix = prefixes[item.type] ?? "X";
  const sameTypeItems = items.filter((x) => x.type === item.type);
  const index = sameTypeItems.findIndex((x) => x.id === item.id);

  if (index >= 0 && sameTypeItems.length > 1) {
    return `${prefix}${index + 1}`;
  }

  const numericSuffix = String(item.id ?? "").match(/(\d+)/);
  return `${prefix}${numericSuffix ? Number(numericSuffix[1]) : 1}`;
}

function getSchematicValue(item) {
  switch (item.type) {
    case "battery":
      return formatSI(item.effectiveV ?? item.V ?? 9, "V");
    case "resistor":
      return formatSI(item.R ?? 100, "Ω");
    case "potentiometer":
      return formatSI(item.R ?? 5000, "Ω");
    case "diode":
      return item.displayState === "conduce" ? `ON · ${formatSI(item.Vf ?? 0.7, "V")}` : `OFF · ${formatSI(item.Vf ?? 0.7, "V")}`;
    case "transistor_npn":
    case "transistor_pnp":
      return `${item.type === "transistor_pnp" ? "PNP" : "NPN"} · ${item.displayState ?? "—"}`;
    case "capacitor":
      return formatSI(item.C ?? 0.001, "F");
    case "bulb":
      return formatSI(item.R ?? 30, "Ω");
    case "switch":
      return item.closed ? "închis" : "deschis";
    case "voltmeter":
    case "ammeter":
    case "ohmmeter":
      return item.display ?? "—";
    default:
      return "";
  }
}

function drawSchematicComponent(ctx, item, cam, allItems = []) {
  const scale = cam.z;
  const x = item.x * scale + cam.x;
  const y = item.y * scale + cam.y;
  const size = (item.sizePct ?? 100) / 100;
  const label = getCircuitLabel(item, allItems);
  const value = getSchematicValue(item);

  const stroke = "rgba(255,255,255,0.92)";
  const muted = "rgba(255,255,255,0.68)";
  const accent = "rgba(34,211,238,0.96)";

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((item.rot ?? 0) * Math.PI) / 180);
  ctx.scale(scale * size, scale * size);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;

  ctx.font = "800 15px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.fillText(label, 0, -46);

  ctx.font = "600 13px ui-sans-serif, system-ui";
  ctx.fillStyle = muted;
  ctx.fillText(value, 0, 47);

  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = 5;

  if (item.type === "battery") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-28, 0);
    ctx.moveTo(28, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-18, -20);
    ctx.lineTo(-18, 20);
    ctx.moveTo(18, -30);
    ctx.lineTo(18, 30);
    ctx.stroke();

    ctx.font = "800 15px ui-sans-serif, system-ui";
    ctx.fillStyle = muted;
    ctx.fillText("−", -24, -30);
    ctx.fillText("+", 24, -38);
  } else if (item.type === "resistor") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-42, 0);
    ctx.moveTo(42, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.strokeStyle = stroke;
    roundRectPath(ctx, -42, -18, 84, 36, 4);
    ctx.fill();
    ctx.stroke();
  } else if (item.type === "potentiometer") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-42, 0);
    ctx.moveTo(42, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.strokeStyle = stroke;
    roundRectPath(ctx, -42, -18, 84, 36, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(16, -34);
    ctx.lineTo(-16, -4);
    ctx.moveTo(16, -34);
    ctx.lineTo(4, -31);
    ctx.moveTo(16, -34);
    ctx.lineTo(13, -22);
    ctx.stroke();
  } else if (item.type === "diode") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-28, 0);
    ctx.moveTo(28, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-28, -26);
    ctx.lineTo(18, 0);
    ctx.lineTo(-28, 26);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(28, -28);
    ctx.lineTo(28, 28);
    ctx.stroke();
  } else if (item.type === "transistor_npn" || item.type === "transistor_pnp") {
    const isPnp = item.type === "transistor_pnp";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-80, 0); // B
    ctx.lineTo(-22, 0);
    ctx.moveTo(24, -36); // C
    ctx.lineTo(80, -36);
    ctx.moveTo(24, 36); // E
    ctx.lineTo(80, 36);
    ctx.moveTo(-22, -34);
    ctx.lineTo(-22, 34);
    ctx.moveTo(-22, -17);
    ctx.lineTo(24, -36);
    ctx.moveTo(-22, 17);
    ctx.lineTo(24, 36);
    ctx.stroke();

    ctx.beginPath();
    if (isPnp) {
      ctx.moveTo(43, 36);
      ctx.lineTo(15, 23);
      ctx.moveTo(15, 23);
      ctx.lineTo(31, 21);
      ctx.moveTo(15, 23);
      ctx.lineTo(24, 36);
    } else {
      ctx.moveTo(15, 23);
      ctx.lineTo(43, 36);
      ctx.moveTo(43, 36);
      ctx.lineTo(31, 21);
      ctx.moveTo(43, 36);
      ctx.lineTo(24, 36);
    }
    ctx.stroke();

    ctx.font = "800 12px ui-sans-serif, system-ui";
    ctx.fillStyle = muted;
    ctx.fillText("B", -68, -14);
    ctx.fillText("C", 70, -52);
    ctx.fillText("E", 70, 52);
  } else if (item.type === "capacitor") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-18, 0);
    ctx.moveTo(18, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, -28);
    ctx.lineTo(-10, 28);
    ctx.moveTo(10, -28);
    ctx.lineTo(10, 28);
    ctx.stroke();

    ctx.font = "800 14px ui-sans-serif, system-ui";
    ctx.fillStyle = muted;
    ctx.fillText("+", -20, -34);
  } else if (item.type === "bulb") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-34, 0);
    ctx.moveTo(34, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-22, -22);
    ctx.lineTo(22, 22);
    ctx.moveTo(22, -22);
    ctx.lineTo(-22, 22);
    ctx.stroke();
  } else if (item.type === "switch") {
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-24, 0);
    ctx.moveTo(24, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-24, 0, 5, 0, Math.PI * 2);
    ctx.arc(24, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    if (item.closed) {
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
    } else {
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, -22);
    }
    ctx.stroke();
  } else if (["voltmeter", "ammeter", "ohmmeter"].includes(item.type)) {
    const symbol = item.type === "voltmeter" ? "V" : item.type === "ammeter" ? "A" : "Ω";

    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-38, 0);
    ctx.moveTo(38, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fill();
    ctx.stroke();

    ctx.font = "900 30px ui-sans-serif, system-ui";
    ctx.fillStyle = stroke;
    ctx.fillText(symbol, 0, 2);
  }

  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function renderComponentCanvas(
  ctx,
  item,
  cam,
  renderStyle = getDefaultRenderStyle(),
  allItems = []
) {
  const scale = cam.z;
  const x = item.x * scale + cam.x;
  const y = item.y * scale + cam.y;

  if (renderStyle === "schematic") {
    drawSchematicComponent(ctx, item, cam, allItems);
    return;
  }

  let svg = null;

  switch (item.type) {
    case "battery":
      svg = batterySVG(
        item.effectiveV ?? item.V ?? 9,
        item.Rint ?? 0.2,
        item.socPct ?? 100,
        item.capacityMah ?? 2000
      );
      break;

    case "resistor":
      svg = resistorSVG(item.R ?? 100);
      break;

    case "potentiometer":
      svg = potentiometerSVG(item.R ?? 5000, item.Rmax ?? 10000, item.positionPct ?? 50);
      break;

    case "diode":
      svg = diodeSVG(item.displayState === "conduce", item.Vf ?? 0.7);
      break;

    case "transistor_npn":
      svg = transistorSVG("NPN", item.displayState === "pornit");
      break;

    case "transistor_pnp":
      svg = transistorSVG("PNP", item.displayState === "pornit");
      break;

    case "capacitor":
      svg = capacitorSVG(
        item.capVoltage ?? 0,
        item.Vmax ?? 9,
        item.C ?? 0.001,
        item.polaritySensitive !== false
      );
      break;

    case "bulb":
      svg = bulbSVG(item.brightness ?? 0);
      break;

    case "switch":
      svg = switchSVG(!!item.closed);
      break;

    case "voltmeter":
      svg = meterSVG("voltmeter", item.display ?? "—");
      break;

    case "ammeter":
      svg = meterSVG("ammeter", item.display ?? "—");
      break;

    case "ohmmeter":
      svg = meterSVG("ohmmeter", item.display ?? "—");
      break;

    default:
      svg = null;
      break;
  }

  if (!svg) return;

  const img = getCachedImage(svg);

  const isPortrait = item.type === "capacitor";
  const isTall = item.type === "transistor_npn" || item.type === "transistor_pnp";

  const w = (isPortrait ? 150 : 200) * scale;
  const h = (isPortrait ? 170 : isTall ? 140 : 120) * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((item.rot ?? 0) * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
