import React from "react";
import { Link } from "react-router-dom";

function Pill({ children }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {children}
    </span>
  );
}

function StepCard({ n, title, text, children }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.22)]">
          {n}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}

function MiniCard({ title, children, accent = "cyan" }) {
  const cls =
    accent === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : accent === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : accent === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 opacity-85">{children}</div>
    </div>
  );
}

function FlowItem({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="mt-2 text-xs leading-6 text-white/60">{text}</div>
    </div>
  );
}

function JumpButton({ href, children }) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {children}
    </a>
  );
}

export default function HowItWorks() {
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
                <Pill>How it works</Pill>
                <Pill>Pașii simulatorului</Pill>
                <Pill>Atestat</Pill>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                De la componente pe canvas la rezultate electrice.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                Această pagină explică traseul complet al aplicației: cum sunt
                plasate componentele, cum se formează firele, cum se construiesc
                nodurile electrice, cum se rezolvă circuitul și cum apar
                valorile afișate pe instrumente.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                >
                  Deschide laboratorul
                </Link>

                <a
                  href="#flux"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  Vezi fluxul aplicației
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold text-white/80">
                Navigare rapidă
              </div>

              <div className="mt-4 grid gap-3">
                <JumpButton href="#flux">Flux general</JumpButton>
                <JumpButton href="#pasi">Pașii interni</JumpButton>
                <JumpButton href="#solver">Solver MNA</JumpButton>
                <JumpButton href="#dinamic">Baterie & condensator</JumpButton>
                <JumpButton href="#siguranta">Avertizări</JumpButton>
              </div>
            </div>
          </div>
        </section>

        <section
          id="flux"
          className="mt-8 scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
            Privire de ansamblu
          </div>
          <h2 className="text-2xl font-bold">Fluxul aplicației</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FlowItem
              title="1. Plasare"
              text="Utilizatorul trage componente din bibliotecă pe canvas."
            />
            <FlowItem
              title="2. Conectare"
              text="Firele unesc pini și creează legături electrice."
            />
            <FlowItem
              title="3. Calcul"
              text="Circuitul este transformat într-un sistem matematic."
            />
            <FlowItem
              title="4. Afișare"
              text="Valorile calculate sunt afișate pe componente și instrumente."
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden h-fit rounded-[28px] border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-24 lg:block">
            <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
              Secțiuni
            </div>

            <nav className="grid gap-2">
              {[
                ["#pasi", "Pașii aplicației"],
                ["#solver", "Solverul"],
                ["#dinamic", "Componente dinamice"],
                ["#siguranta", "Siguranță"],
                ["#observatii", "Observații"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-2xl px-3 py-2 text-sm text-white/65 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <div id="pasi" className="scroll-mt-24 space-y-4">
              <StepCard
                n="1"
                title="Plasarea componentelor"
                text="Utilizatorul alege componente din meniul lateral: baterie, rezistor, bec, condensator, întrerupător sau aparate de măsură. Fiecare componentă este creată cu poziție, dimensiune, rotație și proprietăți electrice."
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <MiniCard title="Componentă">Are tip, poziție și valori proprii.</MiniCard>
                  <MiniCard title="Pini">Majoritatea componentelor au doi pini: a și b.</MiniCard>
                  <MiniCard title="Inspector">Proprietățile se pot modifica live.</MiniCard>
                </div>
              </StepCard>

              <StepCard
                n="2"
                title="Crearea firelor"
                text="În modul Cablu, utilizatorul selectează un pin de pornire și apoi un pin de destinație. Aplicația creează un fir între cele două noduri. Dacă se apasă pe un fir, se poate crea și o joncțiune."
              />

              <StepCard
                n="3"
                title="Gruparea nodurilor electrice"
                text="După conectare, aplicația verifică ce pini sunt legați direct prin fire. Toate punctele conectate fără rezistență sunt considerate același nod electric, numit și net."
              >
                <MiniCard title="Ideea de net" accent="emerald">
                  Dacă două puncte sunt unite prin fir ideal, ele au aceeași
                  tensiune electrică.
                </MiniCard>
              </StepCard>

              <StepCard
                n="4"
                title="Construirea circuitului pentru calcul"
                text="Fiecare componentă este tradusă într-un model matematic. Rezistorul devine o rezistență, bateria devine sursă de tensiune cu rezistență internă, iar ampermetrul este modelat ca o rezistență foarte mică."
              />

              <StepCard
                n="5"
                title="Rezolvarea circuitului"
                text="VoltLab construiește un sistem liniar de ecuații și îl rezolvă. Rezultatul conține tensiunile nodurilor și curenții prin sursele de tensiune."
              />

              <StepCard
                n="6"
                title="Afișarea rezultatelor"
                text="După calcul, aplicația actualizează afișajele: voltmetrul arată tensiunea, ampermetrul arată curentul, becul își schimbă luminozitatea, bateria scade ca procent, iar condensatorul se umple sau se golește."
              />
            </div>

            <section
              id="solver"
              className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
                Calcul intern
              </div>
              <h2 className="text-2xl font-bold">Cum funcționează solverul</h2>

              <p className="mt-4 text-sm leading-7 text-white/70">
                Solverul folosește analiza nodală modificată. Practic,
                simulatorul caută tensiunile în noduri și curenții prin sursele
                de tensiune. Pentru fiecare componentă se adaugă contribuția ei
                în matricea sistemului.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MiniCard title="Rezistor">
                  Este introdus prin relația dintre tensiune, curent și
                  rezistență.
                </MiniCard>

                <MiniCard title="Baterie">
                  Este modelată ca sursă de tensiune plus rezistență internă.
                </MiniCard>

                <MiniCard title="Întrerupător">
                  Dacă este închis, se comportă ca o rezistență foarte mică.
                  Dacă este deschis, nu conduce.
                </MiniCard>

                <MiniCard title="Instrumente">
                  Voltmetrul nu influențează circuitul, ampermetrul este aproape
                  un scurtcircuit, iar ohmmetrul măsoară separat rezistența.
                </MiniCard>
              </div>
            </section>

            <section
              id="dinamic"
              className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
                Simulare în timp
              </div>
              <h2 className="text-2xl font-bold">
                Bateria și condensatorul se actualizează continuu
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/70">
                După apăsarea butonului Start, VoltLab nu face un singur calcul
                și gata. La un interval scurt, circuitul este recalculat, iar
                componentele dinamice își schimbă starea.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MiniCard title="Bateria" accent="emerald">
                  Procentul scade în funcție de curentul consumat. Pe măsură ce
                  bateria se descarcă, tensiunea efectivă scade și becul poate
                  lumina mai slab.
                </MiniCard>

                <MiniCard title="Condensatorul" accent="cyan">
                  Se încarcă progresiv când este conectat la o sursă și se
                  descarcă progresiv când alimentează un consumator.
                </MiniCard>
              </div>
            </section>

            <section
              id="siguranta"
              className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
                Validare
              </div>
              <h2 className="text-2xl font-bold">
                Sistemul de avertizări explică greșelile
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/70">
                VoltLab detectează mai multe situații greșite și afișează un
                dialog explicativ. Astfel, aplicația nu este doar un simulator,
                ci și un instrument de învățare.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MiniCard title="Ampermetru în paralel" accent="rose">
                  Poate produce scurtcircuit, deoarece are rezistență foarte
                  mică.
                </MiniCard>

                <MiniCard title="Voltmetru în serie" accent="amber">
                  Poate întrerupe practic circuitul, deoarece are rezistență
                  foarte mare.
                </MiniCard>

                <MiniCard title="Baterie scurtcircuitată" accent="rose">
                  Plusul și minusul nu trebuie legate direct între ele.
                </MiniCard>

                <MiniCard title="Condensator supratensionat" accent="rose">
                  Apare când tensiunea depășește limita setată în Inspector.
                </MiniCard>
              </div>
            </section>

            <section
              id="observatii"
              className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
                Note pentru prezentare
              </div>
              <h2 className="text-2xl font-bold">Observații importante</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <MiniCard title="Model didactic">
                  Unele comportamente sunt simplificate ca să fie mai ușor de
                  înțeles vizual.
                </MiniCard>

                <MiniCard title="Rezultate aproximative">
                  Valorile sunt utile pentru învățare și demonstrații, nu pentru
                  proiectare industrială.
                </MiniCard>

                <MiniCard title="Interactivitate">
                  Scopul principal este ca elevul să vadă imediat efectul unei
                  modificări în circuit.
                </MiniCard>
              </div>
            </section>

            <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
              <h2 className="text-2xl font-bold text-white">
                Acum poți testa pașii în laborator.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cyan-50/75">
                Plasează o baterie, un bec și un condensator, apoi urmărește cum
                se schimbă valorile în timp real.
              </p>

              <Link
                to="/"
                className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Mergi la laborator
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}