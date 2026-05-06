import React from "react";
import Toolbar from "../lab/Toolbar";

export default function Topbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur">
      <div className="grid grid-cols-[240px_1fr_240px] items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 shadow">
            <span className="text-xl">⚡</span>
          </div>

          <div className="leading-tight">
            <div className="text-base font-semibold">VoltLab</div>
            <div className="text-xs text-white/60">Circuit Sandbox</div>
          </div>
        </div>

        <div className="flex justify-center">
          <Toolbar />
        </div>

        <div />
      </div>
    </header>
  );
}