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

function drawWirePath(ctx, pts) {
  if (!pts.length) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }

  ctx.stroke();
}

export function drawWires(ctx, nodes, wires, cam, wireState) {
  ctx.save();

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function nodePos(id) {
    const n = nodeMap.get(id);
    if (!n) return null;

    return worldToScreen(n.x, n.y, cam);
  }

  // wires - shadow/glow
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const w of wires) {
    const a = nodePos(w.aNodeId);
    const b = nodePos(w.bNodeId);

    if (!a || !b) continue;

    const pts = [
      a,
      ...((w.points || []).map((p) => worldToScreen(p.x, p.y, cam))),
      b,
    ];

    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(70,160,255,0.13)";
    drawWirePath(ctx, pts);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(120,200,255,0.88)";
    drawWirePath(ctx, pts);
  }

  const activeNodeId = wireState?.startNodeId ?? null;

  // nodes
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

    // label: a = −, b = +
    const sign = n.name === "a" ? "−" : n.name === "b" ? "+" : null;

    if (sign) {
      drawBadge(ctx, p.x, p.y - 14, sign);
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