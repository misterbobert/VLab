import React from "react";

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
    >
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/72">
        {children}
      </div>
    </section>
  );
}

function Formula({ children }) {
  return (
    <div className="my-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center font-mono text-base text-cyan-100">
      {children}
    </div>
  );
}

function Example({ children }) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100/85">
      {children}
    </div>
  );
}

function CompareRow({ left, right }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-sky-300/15 bg-sky-300/10 p-4">
        {left}
      </div>
      <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
        {right}
      </div>
    </div>
  );
}

const menuItems = [
  ["intro", "Circuitul electric"],
  ["apa", "Analogia cu apa"],
  ["tensiune", "Tensiunea"],
  ["curent", "Curentul"],
  ["rezistenta", "Rezistența"],
  ["ohm", "Legea lui Ohm"],
  ["putere", "Puterea"],
  ["baterie", "Bateria reală"],
  ["bec", "Becul"],
  ["serie", "Serie"],
  ["paralel", "Paralel"],
  ["scurtcircuit", "Scurtcircuit"],
  ["voltmetru", "Voltmetrul"],
  ["ampermetru", "Ampermetrul"],
  ["ohmmetru", "Ohmmetrul"],
  ["noduri", "Noduri și fire"],
  ["kirchhoff", "Kirchhoff"],
  ["simulator", "În simulator"],
];

export default function Theory() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-24">
        <div className="mb-8 rounded-[30px] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[0.04] to-indigo-500/10 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/70">
            VoltLab Theory
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Noțiuni de bază despre circuite electrice
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70">
            Electricitatea poate părea abstractă, pentru că nu o vedem direct.
            De aceea, o putem compara cu apa care curge prin țevi. Această
            comparație nu este perfectă, dar ajută foarte mult la înțelegerea
            tensiunii, curentului și rezistenței.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-bold text-white">
                Cuprins teorie
              </div>

              <nav className="max-h-[calc(100vh-150px)] space-y-1 overflow-auto pr-1">
                {menuItems.map(([id, label], index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block rounded-xl px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="mr-2 text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="space-y-5">
            <div className="lg:hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-bold text-white">
                Cuprins teorie
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {menuItems.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <Section id="intro" title="1. Circuitul electric, pe scurt">
              <p>
                Un circuit electric este un drum închis prin care se pot deplasa
                sarcinile electrice. Ca să circule curent, circuitul trebuie să
                aibă o sursă de energie, cum ar fi o baterie, conductoare de
                legătură și unul sau mai mulți consumatori, cum ar fi un bec sau
                un rezistor.
              </p>

              <p>
                Dacă drumul este întrerupt, curentul nu mai are pe unde să
                circule. De aceea, un întrerupător deschis oprește circuitul,
                iar un întrerupător închis permite trecerea curentului.
              </p>

              <Example>
                Gândește-te la un circuit ca la un traseu pentru apă. Dacă țeava
                este completă, apa curge. Dacă țeava este tăiată sau robinetul
                este închis, apa se oprește.
              </Example>
            </Section>

            <Section id="apa" title="2. Analogia cu apa">
              <CompareRow
                left={
                  <>
                    <h3 className="font-semibold text-sky-100">
                      Circuit cu apă
                    </h3>
                    <p className="mt-2 text-white/70">
                      Pompa împinge apa prin țevi. Dacă presiunea este mai mare,
                      apa are tendința să curgă mai puternic. Țevile înguste
                      opun rezistență și limitează debitul apei.
                    </p>
                  </>
                }
                right={
                  <>
                    <h3 className="font-semibold text-emerald-100">
                      Circuit electric
                    </h3>
                    <p className="mt-2 text-white/70">
                      Bateria împinge sarcinile electrice prin conductoare.
                      Tensiunea este asemănătoare cu presiunea, curentul este
                      asemănător cu debitul, iar rezistența este asemănătoare cu
                      îngustarea țevii.
                    </p>
                  </>
                }
              />

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-bold text-cyan-100">
                    Tensiunea U
                  </div>
                  <p className="mt-2">
                    Este ca presiunea apei. Cu cât tensiunea este mai mare, cu
                    atât sursa împinge mai puternic sarcinile electrice.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-bold text-cyan-100">
                    Curentul I
                  </div>
                  <p className="mt-2">
                    Este ca debitul apei. Arată câtă sarcină electrică trece
                    printr-un punct al circuitului într-o secundă.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-bold text-cyan-100">
                    Rezistența R
                  </div>
                  <p className="mt-2">
                    Este ca o țeavă mai îngustă. Cu cât rezistența este mai
                    mare, cu atât curentul trece mai greu.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="tensiune" title="3. Tensiunea electrică">
              <p>
                Tensiunea electrică se notează cu <b>U</b> și se măsoară în{" "}
                <b>volți</b>, adică <b>V</b>. Ea arată câtă energie primește o
                sarcină electrică pentru a se deplasa prin circuit.
              </p>

              <p>
                Într-o explicație simplă, tensiunea este „forța de împingere” a
                bateriei. O baterie de 9V împinge mai puternic sarcinile decât o
                baterie de 1.5V.
              </p>

              <Formula>U = tensiune electrică, unitate: volt (V)</Formula>
            </Section>

            <Section id="curent" title="4. Intensitatea curentului electric">
              <p>
                Intensitatea curentului electric se notează cu <b>I</b> și se
                măsoară în <b>amperi</b>, adică <b>A</b>. Ea arată cât de multă
                sarcină electrică trece printr-un conductor într-un anumit timp.
              </p>

              <p>
                În analogia cu apa, curentul este ca debitul: câtă apă trece
                prin țeavă într-o secundă. Dacă trece multă apă, debitul e mare.
                Dacă trece multă sarcină electrică, curentul e mare.
              </p>

              <Formula>I = intensitatea curentului, unitate: amper (A)</Formula>
            </Section>

            <Section id="rezistenta" title="5. Rezistența electrică">
              <p>
                Rezistența electrică se notează cu <b>R</b> și se măsoară în{" "}
                <b>ohmi</b>, adică <b>Ω</b>. Ea arată cât de mult se opune o
                componentă trecerii curentului electric.
              </p>

              <p>
                Un rezistor este o componentă făcută special ca să limiteze
                curentul. Cu cât rezistența este mai mare, cu atât curentul este
                mai mic, dacă tensiunea rămâne aceeași.
              </p>

              <Formula>R = rezistență electrică, unitate: ohm (Ω)</Formula>
            </Section>

            <Section id="ohm" title="6. Legea lui Ohm">
              <p>
                Legea lui Ohm este una dintre cele mai importante formule din
                electricitate. Ea leagă tensiunea, curentul și rezistența.
              </p>

              <Formula>U = R · I</Formula>

              <p>Din această formulă putem scoate și celelalte două forme:</p>

              <div className="grid gap-3 md:grid-cols-2">
                <Formula>I = U / R</Formula>
                <Formula>R = U / I</Formula>
              </div>

              <Example>
                Dacă ai o baterie de 9V și un rezistor de 100Ω, curentul este:
                I = 9 / 100 = 0.09A. Adică 90mA.
              </Example>
            </Section>

            <Section id="putere" title="7. Puterea electrică">
              <p>
                Puterea electrică arată cât de repede se consumă sau se
                transformă energia electrică. Se notează cu <b>P</b> și se
                măsoară în <b>wați</b>, adică <b>W</b>.
              </p>

              <Formula>P = U · I</Formula>

              <p>
                Pentru un rezistor sau un bec, puterea ne spune câtă energie se
                transformă în căldură și lumină. La bec, o putere mai mare
                înseamnă de obicei lumină mai puternică, dar și încălzire mai
                mare.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <Formula>P = R · I²</Formula>
                <Formula>P = U² / R</Formula>
              </div>
            </Section>

            <Section id="baterie" title="8. Bateria reală și rezistența internă">
              <p>
                În teorie, o baterie ideală ar da mereu aceeași tensiune, oricât
                curent i-ai cere. În realitate, orice baterie are o{" "}
                <b>rezistență internă</b>. Aceasta se notează uneori cu{" "}
                <b>r</b> sau <b>Rint</b>.
              </p>

              <p>
                Rezistența internă se comportă ca un mic rezistor ascuns în
                interiorul bateriei. Când curentul este mare, o parte din
                tensiune se pierde pe această rezistență internă.
              </p>

              <Formula>Uborne = E - I · Rint</Formula>
            </Section>

            <Section id="bec" title="9. Becul electric">
              <p>
                Într-un model simplificat, un bec poate fi tratat ca o
                rezistență. Curentul trece prin filament, filamentul se
                încălzește și începe să lumineze.
              </p>

              <p>
                Un bec are de obicei o <b>tensiune nominală</b> și o{" "}
                <b>putere nominală</b>. Tensiunea nominală spune la ce tensiune
                este proiectat să funcționeze, iar puterea nominală spune câtă
                energie consumă normal.
              </p>

              <Formula>Rbec ≈ Vnom² / Pnom</Formula>

              <Example>
                Un bec de 6V și 0.5W are aproximativ R = 6² / 0.5 = 72Ω.
              </Example>
            </Section>

            <Section id="serie" title="10. Circuit în serie">
              <p>
                Într-un circuit în serie, componentele sunt legate una după
                alta, ca niște obstacole puse pe același drum.
              </p>

              <p>
                În serie, prin toate componentele trece același curent.
                Tensiunea sursei se împarte între componente.
              </p>

              <Formula>Rtotal = R1 + R2 + R3 + ...</Formula>
            </Section>

            <Section id="paralel" title="11. Circuit în paralel">
              <p>
                Într-un circuit în paralel, componentele sunt legate pe ramuri
                diferite. Curentul se poate împărți pe mai multe drumuri.
              </p>

              <p>
                În paralel, toate componentele au aceeași tensiune la borne.
                Curentul total se împarte între ramuri.
              </p>

              <Formula>1 / Rtotal = 1 / R1 + 1 / R2 + 1 / R3 + ...</Formula>
            </Section>

            <Section id="scurtcircuit" title="12. Scurtcircuitul">
              <p>
                Scurtcircuitul apare când curentul găsește un drum cu rezistență
                foarte mică, de obicei aproape zero. Atunci curentul poate
                deveni foarte mare.
              </p>

              <Example>
                Dacă legi direct plusul și minusul unei baterii cu un fir, fără
                rezistor sau consumator, faci scurtcircuit. În realitate, asta
                poate încălzi firul sau bateria.
              </Example>
            </Section>

            <Section id="voltmetru" title="13. Voltmetrul">
              <p>
                Voltmetrul măsoară tensiunea între două puncte ale circuitului.
                El se leagă în <b>paralel</b> cu elementul pe care vrei să îl
                măsori.
              </p>

              <Formula>Voltmetrul se leagă în paralel</Formula>
            </Section>

            <Section id="ampermetru" title="14. Ampermetrul">
              <p>
                Ampermetrul măsoară curentul care trece printr-o ramură a
                circuitului. El se leagă în <b>serie</b> cu elementul prin care
                vrei să măsori curentul.
              </p>

              <Formula>Ampermetrul se leagă în serie</Formula>
            </Section>

            <Section id="ohmmetru" title="15. Ohmmetrul">
              <p>
                Ohmmetrul măsoară rezistența electrică. El se folosește pe o
                componentă sau pe o porțiune de circuit, de preferat fără sursă
                de tensiune activă.
              </p>

              <p>
                În principiu, ohmmetrul trimite un curent mic de test și vede ce
                tensiune apare. Apoi folosește legea lui Ohm ca să determine
                rezistența.
              </p>

              <Formula>R = U / I</Formula>
            </Section>

            <Section id="noduri" title="16. Noduri, fire și ramificații">
              <p>
                Un nod electric este un punct unde se întâlnesc două sau mai
                multe fire. Toate punctele unite direct prin fire ideale au
                aceeași tensiune electrică.
              </p>

              <Formula>
                Curentul care intră într-un nod = curentul care iese
              </Formula>
            </Section>

            <Section id="kirchhoff" title="17. Regulile lui Kirchhoff">
              <p>
                Prima regulă se referă la noduri: suma curenților care intră
                într-un nod este egală cu suma curenților care ies.
              </p>

              <Formula>ΣIintrare = ΣIeșire</Formula>

              <p>
                A doua regulă se referă la bucle: într-un traseu închis, suma
                creșterilor de tensiune este egală cu suma căderilor de
                tensiune.
              </p>

              <Formula>ΣU = 0 într-o buclă închisă</Formula>
            </Section>

            <Section id="simulator" title="18. Ce se întâmplă în simulator">
              <p>
                În VoltLab, componentele sunt reprezentate ca elemente de
                circuit: bateria oferă tensiune, rezistorul limitează curentul,
                becul se aprinde în funcție de puterea primită, întrerupătorul
                deschide sau închide circuitul, iar instrumentele măsoară valori
                electrice.
              </p>

              <p>
                Firele conectează nodurile circuitului. Dacă două puncte sunt
                unite prin fir, simulatorul le consideră parte din aceeași
                conexiune electrică.
              </p>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}