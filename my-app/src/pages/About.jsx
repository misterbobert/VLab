import React from "react";
import { Link } from "react-router-dom";

function Pill({ children }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {children}
    </span>
  );
}

function InfoCard({ title, children, accent = "cyan" }) {
  const cls =
    accent === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : accent === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : accent === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : accent === "violet"
      ? "border-violet-300/20 bg-violet-300/10 text-violet-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-[26px] border p-5 ${cls}`}>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="mt-3 text-sm leading-7 opacity-85">{children}</div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
    </div>
  );
}

function TimelineItem({ n, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-sm font-black text-slate-950">
        {n}
      </div>
      <div>
        <div className="font-bold text-white">{title}</div>
        <p className="mt-1 text-sm leading-6 text-white/62">{text}</p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0b0f17] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
          <div className="grid gap-8 p-7 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>About VoltLab</Pill>
                <Pill>Simulator educațional</Pill>
                <Pill>Circuite DC</Pill>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                VoltLab transformă circuitele electrice în experimente vizuale.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                VoltLab este o aplicație educațională pentru construirea,
                testarea și înțelegerea circuitelor electrice de curent continuu.
                Utilizatorul poate plasa componente pe canvas, le poate conecta
                prin fire și poate observa în timp real valori precum tensiunea,
                curentul, puterea, descărcarea bateriei și comportamentul unui
                condensator.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                >
                  Deschide laboratorul
                </Link>

                <Link
                  to="/examples"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  Vezi exemplele
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold text-white/80">
                Pe scurt
              </div>

              <div className="mt-4 grid gap-3">
                <Feature
                  title="Interactiv"
                  text="Componentele pot fi mutate, conectate și modificate direct din Inspector."
                />
                <Feature
                  title="Didactic"
                  text="Avertizările explică greșelile, nu doar blochează simularea."
                />
                <Feature
                  title="Vizual"
                  text="Becul luminează, bateria se descarcă, iar condensatorul se umple și se golește."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoCard title="Scopul proiectului" accent="cyan">
            Scopul principal este să ofere o metodă rapidă și clară prin care
            elevii pot testa circuite electrice fără echipamente fizice.
            Aplicația ajută la înțelegerea legii lui Ohm, a legilor lui
            Kirchhoff și a modului în care componentele influențează un circuit.
          </InfoCard>

          <InfoCard title="Pentru cine este VoltLab?" accent="emerald">
            VoltLab este potrivit pentru elevi care învață fizică sau
            electronică, profesori care vor demonstrații la clasă și pasionați
            care doresc un sandbox simplu pentru circuite electrice.
          </InfoCard>

          <InfoCard title="Ce îl face util?" accent="violet">
            În loc să afișeze doar formule, VoltLab arată efectele direct:
            modifici o rezistență și vezi cum se schimbă becul; descarci bateria
            și vezi cum scade tensiunea; conectezi greșit un aparat și primești o
            explicație.
          </InfoCard>

          <InfoCard title="Caracter educațional" accent="amber">
            Unele modele sunt simplificate intenționat pentru a fi ușor de
            înțeles vizual. Aplicația nu înlocuiește un simulator industrial, ci
            este gândită pentru învățare, demonstrații și prezentări.
          </InfoCard>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
            Funcționalități
          </div>
          <h2 className="text-2xl font-bold text-white">
            Ce poate face aplicația
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="Construire pe canvas"
              text="Utilizatorul poate trage componente pe spațiul de lucru și le poate conecta prin fire."
            />
            <Feature
              title="Inspector pentru componente"
              text="Valorile electrice pot fi editate: rezistență, tensiune, capacitate, putere nominală și altele."
            />
            <Feature
              title="Simulare live"
              text="Circuitul se recalculează în timp real cât timp simularea rulează."
            />
            <Feature
              title="Aparate de măsură"
              text="Voltmetrul, ampermetrul și ohmmetrul pot fi folosite în circuite pentru citiri directe."
            />
            <Feature
              title="Baterie cu mAh"
              text="Bateria are capacitate și procent de încărcare, iar tensiunea scade pe măsură ce se descarcă."
            />
            <Feature
              title="Condensator dinamic"
              text="Condensatorul se poate încărca de la baterie și descărca progresiv prin consumatori."
            />
            <Feature
              title="Exemple gata făcute"
              text="Pagina de exemple permite încărcarea rapidă a circuitelor pentru testare."
            />
            <Feature
              title="Avertizări inteligente"
              text="Aplicația detectează conectări greșite și explică de ce sunt problematice."
            />
            <Feature
              title="Interfață modernă"
              text="Designul este dark, responsive și gândit pentru demonstrații vizuale."
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
              Tehnologii
            </div>
            <h2 className="text-2xl font-bold text-white">
              Cu ce este construit
            </h2>

            <div className="mt-5 grid gap-3">
              <Feature
                title="React"
                text="Structura aplicației este împărțită în pagini și componente reutilizabile."
              />
              <Feature
                title="React Router"
                text="Navigarea între laborator, teorie, exemple și paginile informative se face rapid."
              />
              <Feature
                title="TailwindCSS"
                text="Interfața este stilizată prin clase utilitare, cu layout responsive."
              />
              <Feature
                title="Canvas 2D + SVG"
                text="Componentele sunt randate vizual pe canvas, iar formele sunt generate prin SVG."
              />
              <Feature
                title="Algoritmi de circuit"
                text="Aplicația identifică nodurile electrice și folosește analiză nodală modificată."
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
              Cum a fost gândit
            </div>
            <h2 className="text-2xl font-bold text-white">
              Etapele principale ale aplicației
            </h2>

            <div className="mt-5 grid gap-3">
              <TimelineItem
                n="1"
                title="Modelarea componentelor"
                text="Fiecare componentă are proprietăți, pini și valori afișate în Inspector."
              />
              <TimelineItem
                n="2"
                title="Conectarea prin fire"
                text="Firele unesc noduri, iar aplicația grupează automat punctele conectate."
              />
              <TimelineItem
                n="3"
                title="Calculul circuitului"
                text="Circuitul este transformat într-un sistem matematic și rezolvat numeric."
              />
              <TimelineItem
                n="4"
                title="Afișarea rezultatelor"
                text="Valorile calculate sunt puse pe componente: tensiuni, curenți, puteri și procente."
              />
              <TimelineItem
                n="5"
                title="Validarea greșelilor"
                text="Conexiunile periculoase sau incorecte sunt detectate și explicate prin dialoguri."
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
            Limitări și dezvoltare viitoare
          </div>
          <h2 className="text-2xl font-bold text-white">
            Ce poate fi extins mai departe
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard title="Export / import" accent="cyan">
              Salvarea circuitelor în fișiere JSON și reîncărcarea lor ulterior.
            </InfoCard>

            <InfoCard title="Grafice live" accent="emerald">
              Reprezentarea tensiunilor și curenților în timp pe grafice.
            </InfoCard>

            <InfoCard title="Curent alternativ" accent="violet">
              Surse sinusoidale, condensatori și bobine în regim AC.
            </InfoCard>

            <InfoCard title="Tutorial interactiv" accent="amber">
              Lecții pas cu pas integrate direct în laborator.
            </InfoCard>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-cyan-300/20 bg-cyan-300/10 p-7 text-center">
          <h2 className="text-2xl font-black text-white">
            VoltLab este făcut pentru a învăța prin testare.
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-cyan-50/75">
            Cel mai bun mod de a înțelege aplicația este să deschizi
            laboratorul, să alegi un exemplu și să modifici valorile
            componentelor. Fiecare schimbare produce un efect vizibil.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Mergi la laborator
            </Link>

            <Link
              to="/theory"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
            >
              Citește teoria
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}