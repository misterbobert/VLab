import { useEffect, useState } from "react";

function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const mobileByUserAgent =
    /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(userAgent);

  const mobileByWidth = window.innerWidth < 900;

  const mobileByTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return mobileByUserAgent || (mobileByWidth && mobileByTouch);
}

export default function MobileBlocker({ children }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    function checkDevice() {
      setBlocked(isMobileDevice());
    }

    checkDevice();

    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  if (!blocked) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#070b13] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb55,transparent_35%),radial-gradient(circle_at_bottom,#06b6d455,transparent_40%)]" />

      <div className="absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[-80px] right-[-80px] h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-300/20 bg-[#0f172a]/95 p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-lg">
          <div className="relative h-11 w-7 rounded-lg border-2 border-cyan-200">
            <div className="absolute left-1/2 top-1 h-1 w-2 -translate-x-1/2 rounded-full bg-cyan-200" />
            <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-200" />
          </div>
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          VoltLab
        </p>

        <h1 className="text-2xl font-bold leading-tight text-white">
          Ne pare rău, VoltLab nu este disponibil momentan pe telefon.
        </h1>

        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Editorul de circuite are nevoie de un ecran mai mare pentru plasarea
          componentelor, conectarea firelor și simularea circuitelor în condiții
          bune.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-cyan-100">
            Te rugăm să deschizi aplicația de pe:
          </p>

          <p className="mt-2 text-sm text-slate-300">
            laptop, calculator sau tabletă cu ecran mare.
          </p>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          VoltLab Sandbox este optimizat pentru desktop.
        </p>
      </div>
    </div>
  );
}