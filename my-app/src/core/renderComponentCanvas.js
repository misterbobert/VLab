import {
  batterySVG,
  resistorSVG,
  bulbSVG,
  switchSVG,
  meterSVG,
  capacitorSVG,
} from "./renderersSvg";

const cache = new Map();

function getCachedImage(svgString) {
  if (cache.has(svgString)) return cache.get(svgString);

  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(svgString);
  cache.set(svgString, img);

  return img;
}

export function renderComponentCanvas(ctx, item, cam) {
  const scale = cam.z;
  const x = item.x * scale + cam.x;
  const y = item.y * scale + cam.y;

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

  const w = (isPortrait ? 150 : 200) * scale;
  const h = (isPortrait ? 170 : 120) * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((item.rot ?? 0) * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}