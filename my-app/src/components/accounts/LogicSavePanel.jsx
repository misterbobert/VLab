import React, { useEffect, useState } from "react";
import { watchAuth } from "../../services/authService";

import {
  saveCircuitToCloud,
  listMyCircuits,
  loadCircuitFromCloud,
  deleteCircuitFromCloud,
  createTransferCodeFromCircuit,
  loadCircuitByTransferCode,
} from "../../services/circuitCloud";

export default function LogicSavePanel({
  getSnapshot,
  loadSnapshot,
  className = "fixed right-24 top-20 z-[55]",
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [title, setTitle] = useState("");
  const [circuits, setCircuits] = useState([]);

  const [inputCode, setInputCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshCircuits() {
    if (!user) return;

    try {
      const data = await listMyCircuits("logic-lab");
      setCircuits(data);
    } catch (err) {
      setMessage(err.message || "Nu s-au putut încărca circuitele.");
    }
  }

  useEffect(() => {
    const unsub = watchAuth((currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setCircuits([]);
        setGeneratedCode("");
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && open) {
      refreshCircuits();
    }
  }, [user, open]);

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");
      setGeneratedCode("");

      const snapshot = {
        kind: "logic-lab",
        version: 1,
        ...getSnapshot(),
      };

      await saveCircuitToCloud({
        title: title || "Circuit logic VoltLab",
        snapshot,
      });

      setTitle("");
      setMessage("Circuit logic salvat cu succes.");
      await refreshCircuits();
    } catch (err) {
      setMessage(err.message || "Circuitul logic nu a putut fi salvat.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoad(circuitId) {
    try {
      setLoading(true);
      setMessage("");
      setGeneratedCode("");

      const snapshot = await loadCircuitFromCloud(circuitId);

      if (snapshot?.kind !== "logic-lab") {
        setMessage(
          "Această salvare nu este un circuit logic. Este probabil un circuit electric."
        );
        return;
      }

      loadSnapshot(snapshot);

      setMessage("Circuit logic încărcat în canvas.");
    } catch (err) {
      setMessage(err.message || "Circuitul logic nu a putut fi încărcat.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(circuitId) {
    try {
      setLoading(true);
      setMessage("");
      setGeneratedCode("");

      await deleteCircuitFromCloud(circuitId);
      await refreshCircuits();

      setMessage("Circuit șters.");
    } catch (err) {
      setMessage(err.message || "Circuitul nu a putut fi șters.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCode(circuitId) {
    try {
      setLoading(true);
      setMessage("");

      const code = await createTransferCodeFromCircuit(circuitId);

      setGeneratedCode(code);
      setMessage("Cod generat. Este valabil 24 de ore.");
    } catch (err) {
      setMessage(err.message || "Nu s-a putut genera codul.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadByCode() {
    try {
      setLoading(true);
      setMessage("");
      setGeneratedCode("");

      const snapshot = await loadCircuitByTransferCode(inputCode);

      if (snapshot?.kind !== "logic-lab") {
        setMessage(
          "Codul este valid, dar nu conține un circuit logic VoltLab."
        );
        return;
      }

      loadSnapshot(snapshot);

      setInputCode("");
      setMessage("Circuit logic încărcat folosind codul.");
    } catch (err) {
      setMessage(err.message || "Codul nu a putut fi folosit.");
    } finally {
      setLoading(false);
    }
  }

  return (
   <div className={className}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-2xl border border-cyan-300/30 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-lg transition hover:bg-white/15"
      >
        Salvări
      </button>

      {open && (
       <div className="absolute right-0 top-full mt-3 w-[400px] max-w-[calc(100vw-32px)] rounded-[26px] border border-white/10 bg-[#0b0f17]/95 p-4 text-white shadow-2xl backdrop-blur">   <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Salvări circuite logice</h2>
              <p className="mt-1 text-xs leading-5 text-white/55">
                Salvează canvasul logic exact cum este acum și îl poți încărca
                mai târziu de pe orice dispozitiv.
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
            <div className="text-sm font-black text-cyan-100">
              Încarcă folosind cod
            </div>

            <p className="mt-1 text-xs leading-5 text-cyan-50/65">
              Poți încărca un circuit logic prin cod chiar și fără cont.
            </p>

            <div className="mt-3 flex gap-2">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ex: A7K9Q2HD"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
              />

              <button
                onClick={handleLoadByCode}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                Încarcă
              </button>
            </div>
          </div>

          {!user ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100/85">
              Pentru salvarea circuitelor logice în cont trebuie să te
              conectezi. Încărcarea prin cod funcționează și fără login.
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  placeholder="Nume circuit logic"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
                />

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                >
                  Salvează canvasul logic actual
                </button>
              </div>

              {generatedCode && (
                <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-black/35 p-4 text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    Cod transfer
                  </div>

                  <div className="mt-2 font-mono text-2xl font-black tracking-[0.22em] text-cyan-100">
                    {generatedCode}
                  </div>

                  <div className="mt-2 text-xs text-white/45">
                    Folosește acest cod pe alt dispozitiv.
                  </div>
                </div>
              )}

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Circuitele mele
                  </div>

                  <button
                    onClick={refreshCircuits}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>

                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {circuits.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/45">
                      Nu ai salvat niciun circuit încă.
                    </div>
                  )}

                  {circuits.map((circuit) => (
                    <div
                      key={circuit.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="text-sm font-bold text-white">
                        {circuit.title || "Circuit VoltLab"}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleLoad(circuit.id)}
                          disabled={loading}
                          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/15 disabled:opacity-50"
                        >
                          Încarcă
                        </button>

                        <button
                          onClick={() => handleGenerateCode(circuit.id)}
                          disabled={loading}
                          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
                        >
                          Generează cod
                        </button>

                        <button
                          onClick={() => handleDelete(circuit.id)}
                          disabled={loading}
                          className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-bold text-rose-100 transition hover:bg-rose-300/15 disabled:opacity-50"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
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