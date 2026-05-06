import React from "react";

function GateCard({ title, description, table, accent = "cyan" }) {
  const accentClass =
    accent === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : accent === "violet"
      ? "border-violet-300/20 bg-violet-300/10 text-violet-100"
      : accent === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : accent === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <section className={`rounded-[28px] border p-5 ${accentClass}`}>
      <h2 className="text-xl font-black text-white">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-white/70">{description}</p>

      {table && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <tbody>
              {table.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-white/10 last:border-b-0"
                >
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className={[
                        "bg-black/25 px-4 py-2 text-center font-mono",
                        index === 0
                          ? "font-black text-white"
                          : "text-white/75",
                      ].join(" ")}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function LogicTheoryPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200/70">
            VoltLab Logic
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Teorie pe scurt: porți logice
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
            Porțile logice sunt componente digitale care primesc valori de tip
            0 sau 1 și produc o ieșire tot de tip 0 sau 1. Ele sunt baza
            circuitelor digitale, a procesoarelor și a memoriei din calculatoare.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                window.location.href = "/logic";
              }}
              className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Înapoi la Logic Lab
            </button>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
            >
              Înapoi la VoltLab
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <GateCard
            title="Input și Output"
            accent="cyan"
            description="Un Input reprezintă o valoare introdusă de utilizator: 0 sau 1. Un Output afișează rezultatul final al circuitului logic."
            table={[
              ["Input", "Output"],
              ["0", "LOW"],
              ["1", "HIGH"],
            ]}
          />

          <GateCard
            title="Poarta NOT"
            accent="amber"
            description="Poarta NOT inversează valoarea de intrare. Dacă primește 0, scoate 1. Dacă primește 1, scoate 0."
            table={[
              ["A", "NOT A"],
              ["0", "1"],
              ["1", "0"],
            ]}
          />

          <GateCard
            title="Poarta AND"
            accent="emerald"
            description="Poarta AND dă 1 doar atunci când toate intrările sunt 1. Dacă măcar o intrare este 0, rezultatul este 0."
            table={[
              ["A", "B", "A AND B"],
              ["0", "0", "0"],
              ["0", "1", "0"],
              ["1", "0", "0"],
              ["1", "1", "1"],
            ]}
          />

          <GateCard
            title="Poarta OR"
            accent="cyan"
            description="Poarta OR dă 1 dacă cel puțin una dintre intrări este 1. Rezultatul este 0 doar atunci când toate intrările sunt 0."
            table={[
              ["A", "B", "A OR B"],
              ["0", "0", "0"],
              ["0", "1", "1"],
              ["1", "0", "1"],
              ["1", "1", "1"],
            ]}
          />

          <GateCard
            title="Poarta NAND"
            accent="rose"
            description="Poarta NAND este opusul porții AND. Ea dă 0 doar atunci când toate intrările sunt 1. În rest, dă 1."
            table={[
              ["A", "B", "A NAND B"],
              ["0", "0", "1"],
              ["0", "1", "1"],
              ["1", "0", "1"],
              ["1", "1", "0"],
            ]}
          />

          <GateCard
            title="Poarta NOR"
            accent="rose"
            description="Poarta NOR este opusul porții OR. Ea dă 1 doar atunci când toate intrările sunt 0."
            table={[
              ["A", "B", "A NOR B"],
              ["0", "0", "1"],
              ["0", "1", "0"],
              ["1", "0", "0"],
              ["1", "1", "0"],
            ]}
          />

          <GateCard
            title="Poarta XOR"
            accent="violet"
            description="Poarta XOR dă 1 atunci când intrările sunt diferite. Dacă intrările sunt egale, rezultatul este 0."
            table={[
              ["A", "B", "A XOR B"],
              ["0", "0", "0"],
              ["0", "1", "1"],
              ["1", "0", "1"],
              ["1", "1", "0"],
            ]}
          />

          <GateCard
            title="Poarta XNOR"
            accent="violet"
            description="Poarta XNOR este opusul porții XOR. Ea dă 1 atunci când intrările sunt egale și 0 când sunt diferite."
            table={[
              ["A", "B", "A XNOR B"],
              ["0", "0", "1"],
              ["0", "1", "0"],
              ["1", "0", "0"],
              ["1", "1", "1"],
            ]}
          />
        </section>
      </main>
    </div>
  );
}