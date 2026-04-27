import React from "react";
import { Link } from "react-router-dom";

function Pill({ children }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {children}
    </span>
  );
}

function Formula({ children }) {
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-cyan-100 shadow-inner">
      {children}
    </div>
  );
}

function SectionCard({ id, eyebrow, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur"
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/70">
        {eyebrow}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/72">
        {children}
      </div>
    </section>
  );
}

function MiniCard({ title, children, accent = "cyan" }) {
  const color =
    accent === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : accent === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : accent === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 opacity-85">{children}</div>
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

export default function Theory() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0b0f17] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

     <main className="relative mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        
         <div className="grid gap-8 p-7 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>VoltLab Theory</Pill>
                <Pill>Circuite electrice</Pill>
                <Pill>Explicații rapide</Pill>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Înțelege ce se întâmplă în circuit, nu doar conecta fire.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                Aici găsești teoria din spatele componentelor din VoltLab:
                baterii, rezistori, becuri, condensatori și aparate de măsură.
                Pagina este făcută ca un ghid rapid: citești ideea, vezi formula
                și apoi testezi direct în laborator.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                >
                  Înapoi la laborator
                </Link>

                <a
                  href="#greseli"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  Vezi greșeli frecvente
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold text-white/80">
                Navigare rapidă
              </div>

              <div className="mt-4 grid gap-3">
                <JumpButton href="#marimi">Mărimi electrice</JumpButton>
                <JumpButton href="#ohm">Legea lui Ohm</JumpButton>
                <JumpButton href="#baterie">Baterie</JumpButton>
                <JumpButton href="#rezistor">Rezistor</JumpButton>
                <JumpButton href="#bec">Bec</JumpButton>
                <JumpButton href="#condensator">Condensator</JumpButton>
                <JumpButton href="#masuratori">Aparate de măsură</JumpButton>
                <JumpButton href="#mna">Cum calculează VoltLab</JumpButton>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden h-fit rounded-[28px] border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-24 lg:block">
            <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
              Capitole
            </div>

            <nav className="grid gap-2">
              {[
                ["#marimi", "Mărimi electrice"],
                ["#ohm", "Legea lui Ohm"],
                ["#baterie", "Baterie"],
                ["#rezistor", "Rezistor"],
                ["#bec", "Bec"],
                ["#condensator", "Condensator"],
                ["#masuratori", "Măsurători"],
                ["#greseli", "Greșeli frecvente"],
                ["#mna", "MNA"],
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
            <SectionCard
              id="marimi"
              eyebrow="01 · bază"
              title="Mărimi electrice importante"
            >
              <p>
                Într-un circuit electric, cele mai importante mărimi sunt
                tensiunea, curentul, rezistența și puterea. Dacă le înțelegi pe
                acestea, poți interpreta aproape orice circuit simplu.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard title="Tensiunea — U sau V">
                  Tensiunea arată diferența de potențial dintre două puncte.
                  Intuitiv, este „forța” cu care sursa împinge sarcinile prin
                  circuit.
                </MiniCard>

                <MiniCard title="Curentul — I">
                  Curentul arată câtă sarcină electrică trece printr-un punct
                  într-o secundă. Se măsoară în amperi.
                </MiniCard>

                <MiniCard title="Rezistența — R">
                  Rezistența se opune trecerii curentului. Cu cât rezistența e
                  mai mare, cu atât curentul devine mai mic.
                </MiniCard>

                <MiniCard title="Puterea — P">
                  Puterea arată câtă energie se consumă pe secundă. Un bec cu
                  putere mai mare poate lumina mai tare, dar consumă mai mult.
                </MiniCard>
              </div>

              <Formula>U = tensiune · I = curent · R = rezistență · P = putere</Formula>
            </SectionCard>

            <SectionCard
              id="ohm"
              eyebrow="02 · lege fundamentală"
              title="Legea lui Ohm"
            >
              <p>
                Legea lui Ohm spune că tensiunea pe un rezistor este egală cu
                produsul dintre rezistență și curent. Este una dintre cele mai
                folosite relații din electricitate.
              </p>

              <Formula>U = R · I</Formula>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniCard title="Dacă R crește">
                  Curentul scade, dacă tensiunea rămâne aceeași.
                </MiniCard>

                <MiniCard title="Dacă U crește">
                  Curentul crește, dacă rezistența rămâne aceeași.
                </MiniCard>

                <MiniCard title="Dacă I e mare">
                  Componentele se pot încălzi sau deteriora.
                </MiniCard>
              </div>
            </SectionCard>

            <SectionCard
              id="baterie"
              eyebrow="03 · sursă de energie"
              title="Bateria"
            >
              <p>
                Bateria este o sursă de tensiune. În VoltLab, bateria are
                tensiune nominală, rezistență internă, capacitate în mAh și
                procent de încărcare.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard title="Tensiunea nominală">
                  Este valoarea setată în Inspector, de exemplu 9V. Aceasta
                  decide cât de mult poate alimenta circuitul.
                </MiniCard>

                <MiniCard title="Capacitatea în mAh">
                  Arată cât curent poate oferi bateria în timp. O baterie de
                  2000mAh ține mai mult decât una de 100mAh.
                </MiniCard>

                <MiniCard title="Procentul bateriei">
                  În simulator, procentul scade în funcție de consumatori. Când
                  procentul scade, tensiunea efectivă scade și ea.
                </MiniCard>

                <MiniCard title="Rezistența internă">
                  Orice baterie reală are o rezistență internă. Aceasta limitează
                  curentul și influențează puterea livrată.
                </MiniCard>
              </div>

              <Formula>capacitate folosită ≈ I · timp</Formula>
            </SectionCard>

            <SectionCard
              id="rezistor"
              eyebrow="04 · componentă pasivă"
              title="Rezistorul"
            >
              <p>
                Rezistorul limitează curentul într-un circuit. În VoltLab poți
                modifica valoarea rezistenței, iar benzile colorate de pe
                componentă se schimbă automat.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard title="Rol principal">
                  Reduce curentul și protejează componentele sensibile.
                </MiniCard>

                <MiniCard title="Codul culorilor">
                  Benzile colorate reprezintă cifrele și multiplicatorul
                  valorii rezistenței.
                </MiniCard>
              </div>

              <Formula>Exemplu: 220Ω = roșu · roșu · maro · auriu</Formula>
            </SectionCard>

            <SectionCard id="bec" eyebrow="05 · consumator" title="Becul">
              <p>
                Becul este tratat în VoltLab ca o rezistență care transformă
                energia electrică în lumină. Luminozitatea depinde de puterea
                primită.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniCard title="Putere mică">
                  Becul luminează slab sau deloc.
                </MiniCard>

                <MiniCard title="Putere potrivită">
                  Becul luminează normal, aproape de valoarea nominală.
                </MiniCard>

                <MiniCard title="Putere prea mare" accent="rose">
                  Apare avertizare de suprasolicitare. În realitate, becul s-ar
                  putea arde.
                </MiniCard>
              </div>

              <Formula>P = U · I</Formula>
              <Formula>P = U² / R</Formula>
            </SectionCard>

            <SectionCard
              id="condensator"
              eyebrow="06 · stocare temporară"
              title="Condensatorul"
            >
              <p>
                Condensatorul stochează energie electrică. În VoltLab se poate
                încărca de la o baterie și apoi se poate descărca printr-un
                consumator, de exemplu printr-un bec.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard title="Capacitatea — C">
                  Capacitatea se măsoară în farazi. În Inspector o modifici în
                  µF, pentru că valorile uzuale sunt mici.
                </MiniCard>

                <MiniCard title="Tensiunea maximă — Vmax">
                  Este limita admisă. Dacă tensiunea depășește această valoare,
                  apare avertizare de supratensiune.
                </MiniCard>

                <MiniCard title="Încărcare">
                  Când îl conectezi la baterie, se încarcă progresiv spre
                  tensiunea sursei.
                </MiniCard>

                <MiniCard title="Descărcare">
                  Când alimentează un consumator, tensiunea scade progresiv, iar
                  umplerea din SVG scade odată cu ea.
                </MiniCard>
              </div>

              <Formula>Q = C · U</Formula>
              <Formula>E = 1/2 · C · U²</Formula>
            </SectionCard>

            <SectionCard
              id="masuratori"
              eyebrow="07 · instrumente"
              title="Aparate de măsură"
            >
              <p>
                Voltmetrul, ampermetrul și ohmmetrul trebuie conectate corect.
                Dacă sunt puse greșit, simulatorul afișează o fereastră cu
                explicația problemei.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniCard title="Voltmetru" accent="cyan">
                  Se conectează în paralel cu elementul pe care vrei să măsori
                  tensiunea.
                </MiniCard>

                <MiniCard title="Ampermetru" accent="amber">
                  Se conectează în serie cu circuitul. Dacă îl pui în paralel,
                  poate produce scurtcircuit.
                </MiniCard>

                <MiniCard title="Ohmmetru" accent="emerald">
                  Se folosește pentru rezistență, ideal fără surse active în
                  circuit.
                </MiniCard>
              </div>
            </SectionCard>

            <SectionCard
              id="greseli"
              eyebrow="08 · avertizări"
              title="Greșeli frecvente detectate de VoltLab"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <MiniCard title="Ampermetru în paralel" accent="rose">
                  Ampermetrul are rezistență foarte mică. Dacă îl pui în paralel
                  cu o componentă, poate scurtcircuita circuitul.
                </MiniCard>

                <MiniCard title="Voltmetru în serie" accent="amber">
                  Voltmetrul are rezistență foarte mare. Dacă îl pui în serie,
                  circuitul devine aproape întrerupt.
                </MiniCard>

                <MiniCard title="Bec suprasolicitat" accent="rose">
                  Dacă puterea primită este mai mare decât puterea nominală,
                  becul se poate deteriora.
                </MiniCard>

                <MiniCard title="Condensator invers" accent="rose">
                  Condensatorii polarizați trebuie conectați cu plus la
                  potențial mai mare și minus la potențial mai mic.
                </MiniCard>

                <MiniCard title="Baterie scurtcircuitată" accent="rose">
                  Plusul și minusul bateriei nu trebuie legate direct între ele.
                  Curentul poate deveni foarte mare.
                </MiniCard>

                <MiniCard title="Surse diferite în paralel" accent="amber">
                  Două baterii cu tensiuni diferite în paralel pot forța curent
                  una prin cealaltă.
                </MiniCard>
              </div>
            </SectionCard>

            <SectionCard
              id="mna"
              eyebrow="09 · calcul intern"
              title="Cum calculează VoltLab circuitul"
            >
              <p>
                VoltLab folosește o metodă numită analiză nodală modificată
                pentru circuitele de curent continuu. Pe scurt, simulatorul
                identifică nodurile, construiește o matrice și calculează
                tensiunile și curenții.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniCard title="1. Noduri">
                  Firele unesc pini și creează noduri electrice comune.
                </MiniCard>

                <MiniCard title="2. Ecuații">
                  Componentele sunt transformate în relații matematice.
                </MiniCard>

                <MiniCard title="3. Rezultate">
                  Se calculează tensiuni, curenți, puteri și afișaje.
                </MiniCard>
              </div>

              <p>
                Condensatorul este modelat didactic: se încarcă și se descarcă
                progresiv în timp, iar când este încărcat poate funcționa ca o
                sursă temporară pentru consumatori.
              </p>
            </SectionCard>

            <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
              <h2 className="text-2xl font-bold text-white">
                Gata de testat teoria?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cyan-50/75">
                Întoarce-te în laborator, conectează componentele și vezi cum se
                schimbă tensiunea, curentul, luminozitatea, bateria și
                condensatorul.
              </p>

              <Link
                to="/"
                className="mt-5 inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Deschide laboratorul
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}