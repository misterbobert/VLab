import { useEffect } from "react";
import { useVoltLab } from "./useVoltLabStore.jsx";
import { drawInfiniteGrid, drawWires } from "../core/coords";

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

      // clear
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      // grid
      drawInfiniteGrid(ctx, canvas.clientWidth, canvas.clientHeight, state.cam);

      // wires + particule de curent în modul vizual
      drawWires(ctx, state.nodes, state.wires, state.cam, state.wire, {
        items: state.items,
        running: state.running || state.isRunning,
        renderStyle: state.renderStyle ?? "real",
        sol: state.sol,
        timeMs,
      });

      const shouldAnimate =
        (state.running || state.isRunning) &&
        (state.renderStyle ?? "real") !== "schematic";

      if (shouldAnimate) {
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
  ]);
}