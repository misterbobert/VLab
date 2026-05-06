import React, { useEffect, useRef } from "react";
import CanvasStage from "./CanvasStage";
import Overlay from "./Overlay";
import HintBar from "./HintBar";
import { useVoltLab } from "../../hooks/useVoltLabStore.jsx";
import { useWorkspaceEvents } from "../../hooks/useWorkspaceEvents";

export default function Workspace() {
  const workspaceRef = useRef(null);
  const overlayRef = useRef(null);

  const { state, actions } = useVoltLab();
  useWorkspaceEvents(workspaceRef, overlayRef);

  useEffect(() => {
    const raw = localStorage.getItem("voltlab:loadExample");
    if (!raw) return;

    try {
      const snap = JSON.parse(raw);
      localStorage.removeItem("voltlab:loadExample");
      actions.loadSnapshot?.(snap);
    } catch {
      localStorage.removeItem("voltlab:loadExample");
    }
  }, []);

  return (
    <div
      ref={workspaceRef}
      className="absolute inset-0 z-0 overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => actions.handleDrop(e, workspaceRef)}
    >
      <CanvasStage />

      <div
        className={
          state.renderStyle === "schematic"
            ? "absolute inset-0 opacity-0"
            : "absolute inset-0"
        }
      >
        <Overlay overlayRef={overlayRef} />
      </div>

      <HintBar />
    </div>
  );
}