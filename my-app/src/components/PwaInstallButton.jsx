import React, { useEffect, useMemo, useState } from "react";

const MANIFEST_ID = "voltlab-pwa-manifest";

function isDesktopDevice() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const mobileLike = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
  const hasCoarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)")?.matches;

  return !mobileLike && !hasCoarsePointer;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}

function ensureManifestLink() {
  if (typeof document === "undefined") return;

  if (!document.getElementById(MANIFEST_ID)) {
    const link = document.createElement("link");
    link.id = MANIFEST_ID;
    link.rel = "manifest";
    link.href = "/manifest.webmanifest";
    document.head.appendChild(link);
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#0b0f17";
    document.head.appendChild(meta);
  }
}

async function registerServiceWorker() {
  if (typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.warn("VoltLab PWA service worker could not be registered:", err);
  }
}

export default function PwaInstallButton() {
  const desktop = useMemo(() => isDesktopDevice(), []);
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(() => isStandaloneMode());
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    ensureManifestLink();
    registerServiceWorker();

    function onBeforeInstallPrompt(event) {
      if (!desktop) return;
      event.preventDefault();
      setPromptEvent(event);
      setUnsupported(false);
    }

    function onInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => {
      if (!isStandaloneMode() && !promptEvent) {
        setUnsupported(true);
      }
    }, 3500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, [desktop, promptEvent]);

  if (!desktop || installed) return null;

  async function installApp() {
    if (!promptEvent) {
      setUnsupported(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice?.outcome === "accepted") {
        setInstalled(true);
      }

      setPromptEvent(null);
    } catch (err) {
      console.warn("VoltLab install prompt failed:", err);
    }
  }

  return (
    <div className="relative hidden items-center gap-2 lg:flex">
      <button
        type="button"
        onClick={installApp}
        title={unsupported ? "Folosește Chrome / Edge pe HTTPS pentru instalare" : "Instalează VoltLab pe PC"}
        className={[
          "rounded-xl border px-4 py-2 text-sm font-bold transition",
          promptEvent
            ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25"
            : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80",
        ].join(" ")}
      >
        Instalează
      </button>
    </div>
  );
}
