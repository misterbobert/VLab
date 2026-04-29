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
    <div className="min-h-screen bg-[#070b13] text-white flex items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed833,transparent_35%),radial-gradient(circle_at_bottom,#06b6d433,transparent_35%)]" />

      <div className="absolute top-10 left-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="absolute bottom-10 right-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-2xl p-7 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-lg">
          <div className="relative h-10 w-6 rounded-md border-2 border-cyan-200/80">
            <div className="absolute left-1/2 top-1 h-1 w-2 -translate-x-1/2 rounded-full bg-cyan-200/80" />
            <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-200/80" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          VoltLab nu este disponibil pe telefon momentan
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Ne pare rău, dar editorul VoltLab are nevoie de un ecran mai mare
          pentru plasarea componentelor, conectarea firelor și simularea
          circuitelor în siguranță.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
          <p className="text-sm font-semibold text-cyan-100">
            Pentru cea mai bună experiență:
          </p>

          <p className="mt-2 text-sm text-white/65">
            Deschide aplicația de pe laptop, PC sau tabletă cu ecran mare.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
          <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
          <span>VoltLab Sandbox</span>
        </div>
      </div>
    </div>
  );
}