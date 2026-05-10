import { useEffect } from "react";
import { useVoltLab } from "./useVoltLabStore.jsx";
import { drawInfiniteGrid, drawWires } from "../core/coords";
import { renderComponentCanvas } from "../core/renderComponentCanvas";

function normalizeRenderStyle(value) {
  return value === "schematic" || value === "schema" || value === "fizica"
    ? "schematic"
    : "real";
}

function getRenderStyle(state) {
  const fromState = normalizeRenderStyle(state?.renderStyle);
  if (fromState === "schematic") return "schematic";

  // Fallback util dacă store-ul a fost restaurat temporar dintr-o variantă
  // mai veche, dar utilizatorul avea modul salvat în localStorage.
  try {
    const saved = localStorage.getItem("voltlab:renderStyle");
    return normalizeRenderStyle(saved);
  } catch {
    return fromState;
  }
}

export function useCanvasRenderer(canvasRef) {
  const { state } = useVoltLab();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = null;
    let cancelled = false;

    function render(timeMs = 0) {
      if (cancelled) return;

      const width = canvas.clientWidth || canvas.width;
      const height = canvas.clientHeight || canvas.height;
      const renderStyle = getRenderStyle(state);
      const schematicMode = renderStyle === "schematic";
      const running = !!(state.running || state.isRunning);

      ctx.clearRect(0, 0, width, height);
      drawInfiniteGrid(ctx, width, height, state.cam);

      // Firele sunt desenate prima dată. În mod schematic, componentele sunt
      // desenate DUPĂ fire, ca simbolurile să fie mereu vizibile peste cabluri.
      try {
        drawWires(ctx, state.nodes, state.wires, state.cam, state.wire, {
          items: state.items,
          running,
          renderStyle,
          sol: state.sol,
          timeMs,
          particlesEnabled: state.particleFlowEnabled ?? true,
        });
      } catch (err) {
        // Dacă animația particulelor are vreun caz-limită, nu lăsăm canvas-ul
        // schematic gol. Componentele se desenează în continuare.
        console.warn("VoltLab wire render failed:", err);
      }

      if (schematicMode) {
        for (const item of state.items) {
          try {
            renderComponentCanvas(ctx, item, state.cam, "schematic", state.items);
          } catch (err) {
            console.warn("VoltLab schematic component render failed:", item?.type, err);
          }
        }
      }

      // În modul vizual, particulele au nevoie de requestAnimationFrame ca să
      // curgă continuu. În schematic nu animăm, ca să rămână curat și stabil.
      if (running && !schematicMode) {
        rafId = window.requestAnimationFrame(render);
      }
    }

    render(performance.now());

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [
    canvasRef,
    state.cam,
    state.nodes,
    state.wires,
    state.wire,
    state.items,
    state.sol,
    state.running,
    state.isRunning,
    state.renderStyle,
    state.particleFlowEnabled,
  ]);
}
