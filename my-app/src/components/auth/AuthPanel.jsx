import React, { useEffect, useState } from "react";

import {
  watchAuth,
  registerWithUsername,
  loginWithUsername,
  loginWithGoogle,
  logout,
  getMyProfile,
} from "../../services/authService";

export default function AuthPanel({
  onAuthReady,
  className = "fixed right-4 top-20 z-[60]",
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("login");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshProfile() {
    const data = await getMyProfile();
    setProfile(data);
  }

  useEffect(() => {
    const unsub = watchAuth(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await refreshProfile();
      } else {
        setProfile(null);
      }

      onAuthReady?.(currentUser);
    });

    return () => unsub();
  }, []);

  async function handleRegister() {
    try {
      setLoading(true);
      setMessage("");

      await registerWithUsername(username, password);
      await refreshProfile();

      setUsername("");
      setPassword("");
      setMessage("Cont creat cu succes.");
    } catch (err) {
      setMessage(err.message || "Nu s-a putut crea contul.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    try {
      setLoading(true);
      setMessage("");

      await loginWithUsername(username, password);
      await refreshProfile();

      setUsername("");
      setPassword("");
      setMessage("Te-ai conectat cu succes.");
    } catch (err) {
      setMessage("Username sau parolă greșită.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      setMessage("");

      await loginWithGoogle();
      await refreshProfile();

      setMessage("Te-ai conectat cu Google.");
    } catch (err) {
      setMessage(err.message || "Logarea cu Google nu a reușit.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      setMessage("");

      await logout();

      setProfile(null);
      setUser(null);
      setMessage("Te-ai deconectat.");
    } catch (err) {
      setMessage("Nu s-a putut face logout.");
    } finally {
      setLoading(false);
    }
  }

  const displayName =
    profile?.username ||
    user?.displayName ||
    user?.email ||
    "cont activ";

  return (
    <div className={className}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 shadow-lg transition hover:bg-cyan-200"
      >
        {user ? "Cont" : "Login"}
      </button>

      {open && (
      <div className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-32px)] rounded-[26px] border border-white/10 bg-[#0b0f17]/95 p-4 text-white shadow-2xl backdrop-blur">    <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">
                {user ? "Cont VoltLab" : "Autentificare"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-white/55">
                Poți folosi username și parolă, fără email sau telefon. Opțional,
                te poți conecta și cu Google.
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {user ? (
            <div className="mt-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Conectat ca
                </div>

                <div className="mt-1 break-all text-sm font-bold text-cyan-100">
                  {displayName}
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="mt-4 w-full rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-black text-rose-100 transition hover:bg-rose-300/15 disabled:opacity-50"
              >
                Deconectează-te
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                <button
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-bold transition",
                    mode === "login"
                      ? "bg-cyan-300 text-slate-950"
                      : "text-white/60 hover:bg-white/10",
                  ].join(" ")}
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-bold transition",
                    mode === "register"
                      ? "bg-cyan-300 text-slate-950"
                      : "text-white/60 hover:bg-white/10",
                  ].join(" ")}
                >
                  Cont nou
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="parolă"
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
                />

                <button
                  onClick={mode === "login" ? handleLogin : handleRegister}
                  disabled={loading}
                  className="w-full rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                >
                  {mode === "login" ? "Intră în cont" : "Creează cont"}
                </button>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  Continuă cu Google
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white/70">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}