import React, { useMemo } from "react";
import { useVoltLab } from "../../hooks/useVoltLabStore.jsx";

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-white/60">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", step, min, max }) {
  return (
    <input
      value={value}
      type={type}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
    />
  );
}

function Readout({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="text-sm font-semibold text-white/90">{value ?? "—"}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
        {title}
      </div>
      {children}
    </div>
  );
}

function clampNumber(value, fallback, min = -Infinity, max = Infinity) {
  const n = Number(value);

  if (!Number.isFinite(n)) return fallback;

  return Math.max(min, Math.min(max, n));
}

function pct(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(Math.max(0, Math.min(1, n)) * 100)}%`;
}

function displayName(type) {
  if (type === "battery") return "Baterie";
  if (type === "resistor") return "Rezistor";
  if (type === "capacitor") return "Condensator";
  if (type === "switch") return "Întrerupător";
  if (type === "bulb") return "Bec";
  if (type === "voltmeter") return "Voltmetru";
  if (type === "ammeter") return "Ampermetru";
  if (type === "ohmmeter") return "Ohmmetru";
  return type;
}

export default function Inspector() {
  const { state, actions } = useVoltLab();

  const selected = useMemo(
    () => state.items.find((x) => x.id === state.selectedId) || null,
    [state.items, state.selectedId]
  );

  return (
  <aside className="min-h-full rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">    <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Inspector</div>

        <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/60">
          {state.running ? "Rulează" : "Oprit"}
        </div>
      </div>

      {!selected ? (
        <div className="space-y-3 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            Trage componente din bibliotecă.
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            Folosește <b>Selectează</b> pentru a muta/selecta. Folosește{" "}
            <b>Cablu</b> pentru a conecta componente între ele.
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            Apasă <b>Start</b> pentru a rula circuitul creat.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Section title="Componentă">
            <div>
              <div className="text-xs text-white/60">Nume</div>
              <div className="text-sm font-semibold">
                {displayName(selected.type)}{" "}
                <span className="text-white/40">#{selected.id.slice(-4)}</span>
              </div>
            </div>
          </Section>

          <Section title="Poziționare">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mărime (%)">
                <Input
                  type="number"
                  step="1"
                  min="40"
                  max="200"
                  value={selected.sizePct ?? 100}
                  onChange={(v) =>
                    actions.updateItem(selected.id, {
                      sizePct: clampNumber(v, selected.sizePct ?? 100, 40, 200),
                    })
                  }
                />
              </Field>

              <Field label="Rotație (grade)">
                <Input
                  type="number"
                  step="1"
                  value={selected.rot ?? 0}
                  onChange={(v) =>
                    actions.updateItem(selected.id, {
                      rot: clampNumber(v, selected.rot ?? 0),
                    })
                  }
                />
              </Field>
            </div>
          </Section>

          {selected.type === "battery" && (
            <>
              <Section title="Specificații baterie">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tensiune nominală (V)">
                    <Input
                      type="number"
                      step="0.1"
                      value={selected.V ?? 9}
                      onChange={(v) => {
                        const voltage = clampNumber(v, selected.V ?? 9);

                        actions.updateItem(selected.id, {
                          V: voltage,
                          effectiveV:
                            Number(selected.socPct ?? 100) <= 0.001
                              ? 0
                              : voltage,
                        });
                      }}
                    />
                  </Field>

                  <Field label="Rezistență internă (Ω)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.001"
                      value={selected.Rint ?? 0.2}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          Rint: clampNumber(v, selected.Rint ?? 0.2, 0.001),
                        })
                      }
                    />
                  </Field>

                  <Field label="Capacitate (mAh)">
                    <Input
                      type="number"
                      step="100"
                      min="1"
                      value={selected.capacityMah ?? 2000}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          capacityMah: clampNumber(
                            v,
                            selected.capacityMah ?? 2000,
                            1
                          ),
                        })
                      }
                    />
                  </Field>

                  <Field label="Încărcare (%)">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={selected.socPct ?? 100}
                      onChange={(v) => {
                        const soc = clampNumber(v, selected.socPct ?? 100, 0, 100);
                        const voltage = Number(selected.V ?? 9);

                        actions.updateItem(selected.id, {
                          socPct: soc,
                          effectiveV: soc <= 0.001 ? 0 : voltage,
                        });
                      }}
                    />
                  </Field>

                  <Field label="Consumă bateria">
                    <button
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                      onClick={() =>
                        actions.updateItem(selected.id, {
                          dischargeEnabled: selected.dischargeEnabled === false,
                        })
                      }
                    >
                      {selected.dischargeEnabled === false ? "Nu" : "Da"}
                    </button>
                  </Field>
                </div>
              </Section>

              <Section title="Rezultate baterie">
                <div className="grid grid-cols-2 gap-3">
                  <Readout
                    label="Curent livrat"
                    value={selected.displayCurrent ?? "—"}
                  />
                  <Readout
                    label="Putere livrată"
                    value={selected.displayPower ?? "—"}
                  />
                  <Readout
                    label="Autonomie estimată"
                    value={selected.displayRuntime ?? "—"}
                  />
                  <Readout
                    label="Tensiune efectivă"
                    value={`${Number(selected.effectiveV ?? selected.V ?? 9).toFixed(
                      2
                    )}V`}
                  />
                </div>
              </Section>

              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-3 text-xs leading-relaxed text-emerald-100/80">
                Bateria folosește capacitatea în mAh. Când circuitul consumă
                curent, procentul scade automat. Dacă ajunge la 0%, tensiunea
                efectivă devine 0V.
              </div>
            </>
          )}

          {selected.type === "resistor" && (
            <Section title="Specificații rezistor">
              <Field label="Rezistență (Ω)">
                <Input
                  type="number"
                  step="1"
                  min="0.001"
                  value={selected.R ?? 100}
                  onChange={(v) =>
                    actions.updateItem(selected.id, {
                      R: clampNumber(v, selected.R ?? 100, 0.001),
                    })
                  }
                />
              </Field>
            </Section>
          )}

          {selected.type === "capacitor" && (
            <>
              <Section title="Specificații condensator">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Capacitate (µF)">
                    <Input
                      type="number"
                      step="10"
                      min="0.001"
                      value={Math.round((selected.C ?? 0.001) * 1000000)}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          C: Math.max(0.000000001, Number(v) * 0.000001),
                        })
                      }
                    />
                  </Field>

                  <Field label="Tensiune maximă (V)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={selected.Vmax ?? 9}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          Vmax: clampNumber(v, selected.Vmax ?? 9, 0.1),
                        })
                      }
                    />
                  </Field>

                  <Field label="Tensiune actuală (V)">
                    <Input
                      type="number"
                      step="0.1"
                      value={selected.capVoltage ?? 0}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          capVoltage: clampNumber(v, selected.capVoltage ?? 0),
                        })
                      }
                    />
                  </Field>

                  <Field label="Rezistență internă ESR (Ω)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.001"
                      value={selected.ESR ?? 0.5}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          ESR: clampNumber(v, selected.ESR ?? 0.5, 0.001),
                        })
                      }
                    />
                  </Field>

                  <Field label="Timp încărcare (s)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={selected.chargeTimeSec ?? 1.2}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          chargeTimeSec: clampNumber(
                            v,
                            selected.chargeTimeSec ?? 1.2,
                            0
                          ),
                        })
                      }
                    />
                  </Field>

                  <Field label="Timp descărcare (s)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={selected.dischargeTimeSec ?? 2}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          dischargeTimeSec: clampNumber(
                            v,
                            selected.dischargeTimeSec ?? 2,
                            0
                          ),
                        })
                      }
                    />
                  </Field>

                  <Field label="Polarizat">
                    <button
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                      onClick={() =>
                        actions.updateItem(selected.id, {
                          polaritySensitive: selected.polaritySensitive === false,
                        })
                      }
                    >
                      {selected.polaritySensitive === false ? "Nu" : "Da"}
                    </button>
                  </Field>

                  <Field label="Pierdere automată">
                    <button
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                      onClick={() =>
                        actions.updateItem(selected.id, {
                          leakageEnabled: selected.leakageEnabled === false,
                        })
                      }
                    >
                      {selected.leakageEnabled === false ? "Oprită" : "Pornită"}
                    </button>
                  </Field>
                </div>
              </Section>

              <Section title="Rezultate condensator">
                <div className="grid grid-cols-2 gap-3">
                  <Readout label="Tensiune" value={selected.displayVoltage ?? "—"} />
                  <Readout label="Încărcare" value={selected.displayPercent ?? "0%"} />
                  <Readout label="Curent livrat" value={selected.displayCurrent ?? "—"} />
                  <Readout label="Sarcină" value={selected.displayCharge ?? "—"} />
                  <Readout label="Energie" value={selected.displayEnergy ?? "—"} />
                </div>
              </Section>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-xs leading-relaxed text-cyan-100/80">
                Condensatorul încărcat se comportă ca o sursă temporară. Când
                alimentează un consumator, tensiunea lui scade progresiv, iar
                umplerea din SVG scade odată cu ea.
              </div>
            </>
          )}

          {selected.type === "bulb" && (
            <>
              <Section title="Specificații bec">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Rezistență filament (Ω)">
                    <Input
                      type="number"
                      step="1"
                      min="0.001"
                      value={selected.R ?? 30}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          R: clampNumber(v, selected.R ?? 30, 0.001),
                        })
                      }
                    />
                  </Field>

                  <Field label="Tensiune nominală (V)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={selected.Vnom ?? 6}
                      onChange={(v) =>
                        actions.updateItem(selected.id, {
                          Vnom: clampNumber(v, selected.Vnom ?? 6, 0),
                        })
                      }
                    />
                  </Field>

                  <Field label="Putere nominală (W)">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.001"
                      value={selected.Pnom ?? 0.5}
                      onChange={(v) => {
                        const p = clampNumber(v, selected.Pnom ?? 0.5, 0.001);

                        actions.updateItem(selected.id, {
                          Pnom: p,
                          ratedPowerW: p,
                        });
                      }}
                    />
                  </Field>

                  <Readout label="Luminozitate" value={pct(selected.brightness)} />
                </div>
              </Section>

              <Section title="Rezultate bec">
                <div className="grid grid-cols-3 gap-3">
                  <Readout
                    label="Tensiune"
                    value={selected.displayVoltage ?? "—"}
                  />
                  <Readout
                    label="Curent"
                    value={selected.displayCurrent ?? "—"}
                  />
                  <Readout
                    label="Putere"
                    value={selected.displayPower ?? "—"}
                  />
                </div>
              </Section>

              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100/80">
                Model simplificat: becul este tratat ca o rezistență.
                Luminozitatea este calculată din puterea actuală raportată la
                puterea nominală.
              </div>
            </>
          )}

          {selected.type === "switch" && (
            <Section title="Întrerupător">
              <Field label="Stadiu">
                <button
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={() =>
                    actions.updateItem(selected.id, {
                      closed: !selected.closed,
                    })
                  }
                >
                  {selected.closed ? "Închis" : "Deschis"}
                </button>
              </Field>
            </Section>
          )}

          {(selected.type === "voltmeter" ||
            selected.type === "ammeter" ||
            selected.type === "ohmmeter") && (
            <Section title="Instrument">
              <Readout
                label={
                  selected.type === "voltmeter"
                    ? "Tensiune măsurată"
                    : selected.type === "ammeter"
                    ? "Curent măsurat"
                    : "Rezistență măsurată"
                }
                value={selected.display ?? "—"}
              />
            </Section>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm hover:bg-rose-500/15"
              onClick={() => actions.deleteItem(selected.id)}
            >
              Șterge
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}