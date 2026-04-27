import React from "react";
import Topbar from "../layout/Topbar";
import Workspace from "./Workspace";
import Inspector from "./Inspector";
import SidebarLibrary from "./SidebarLibrary";
import SafetyDialog from "./SafetyDialog";
import { VoltLabProvider } from "../../hooks/useVoltLabStore.jsx";

export default function LabShell() {
  return (
    <VoltLabProvider>
      <div className="fixed left-0 right-0 bottom-0 top-16 overflow-hidden bg-[#0b0f17]">
        <Workspace />

        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <Topbar />
          </div>

          {/* Library stânga cu scroll intern */}
          <div className="absolute left-4 top-24 bottom-4 w-[360px] pointer-events-auto">
            <div className="voltlab-scroll h-full overflow-y-auto overflow-x-hidden rounded-[22px] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
              <SidebarLibrary />
            </div>
          </div>

          {/* Inspector dreapta cu scroll intern */}
          <div className="absolute right-4 top-24 bottom-4 w-[360px] pointer-events-auto">
            <div className="voltlab-scroll  h-full overflow-y-auto overflow-x-hidden rounded-[22px]">
              <Inspector />
            </div>
          </div>
        </div>

        <SafetyDialog />
      </div>
    </VoltLabProvider>
  );
}