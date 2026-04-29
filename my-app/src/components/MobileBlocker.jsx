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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        minHeight: "100vh",
        width: "100vw",
        background:
          "radial-gradient(circle at top, rgba(37, 99, 235, 0.35), transparent 35%), radial-gradient(circle at bottom, rgba(6, 182, 212, 0.3), transparent 40%), #070b13",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "rgba(15, 23, 42, 0.96)",
          border: "1px solid rgba(103, 232, 249, 0.25)",
          borderRadius: "28px",
          padding: "30px 24px",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: "78px",
            height: "78px",
            margin: "0 auto 22px",
            borderRadius: "22px",
            border: "1px solid rgba(103, 232, 249, 0.35)",
            background: "rgba(34, 211, 238, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "44px",
              border: "3px solid #a5f3fc",
              borderRadius: "10px",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "9px",
                height: "3px",
                borderRadius: "99px",
                background: "#a5f3fc",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "6px",
                height: "6px",
                borderRadius: "99px",
                background: "#a5f3fc",
              }}
            />
          </div>
        </div>

        <p
          style={{
            margin: "0 0 12px",
            color: "#67e8f9",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          VoltLab
        </p>

        <h1
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "25px",
            lineHeight: "1.2",
            fontWeight: 800,
          }}
        >
          Ne pare rău, VoltLab nu este disponibil momentan pe telefon.
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            color: "#cbd5e1",
            fontSize: "16px",
            lineHeight: "1.65",
            fontWeight: 400,
          }}
        >
          Editorul de circuite are nevoie de un ecran mai mare pentru plasarea
          componentelor, conectarea firelor și simularea circuitelor în condiții
          bune.
        </p>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "18px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#cffafe",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Te rugăm să deschizi aplicația de pe:
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "#cbd5e1",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            laptop, calculator sau tabletă cu ecran mare.
          </p>
        </div>

        <p
          style={{
            margin: "22px 0 0",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          VoltLab Sandbox este optimizat pentru desktop.
        </p>
      </div>
    </div>
  );
}