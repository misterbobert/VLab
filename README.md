# ⚡ VoltLab

**VoltLab** este o platformă educațională interactivă pentru construirea, simularea și înțelegerea circuitelor electrice și a logicii digitale, direct din browser.

Proiectul pornește de la o idee simplă: electricitatea este mult mai ușor de înțeles atunci când o poți vedea, testa și modifica în timp real. În loc ca elevul să învețe doar formule și scheme statice, VoltLab transformă teoria într-un laborator digital unde greșeala devine parte din învățare.

🌐 **Live demo:** [www.voltlab.website](https://www.voltlab.website)

---

## ✨ Ce este VoltLab?

VoltLab nu este doar un simulator de circuite. Este un mic ecosistem educațional care combină:

- un laborator interactiv pentru circuite electrice;
- componente vizuale și componente schematice;
- simulare în timp real;
- exemple gata construite;
- teste și exerciții;
- logică digitală prin porți logice;
- explicații simple pentru elevi;
- autentificare și conturi;
- suport PWA pentru instalare și utilizare offline.

Scopul proiectului este să ajute elevii să înțeleagă mai ușor concepte precum tensiunea, curentul, rezistența, puterea, condensatorul, măsurătorile electrice și comportamentul circuitelor.

---

## 🚀 Funcționalități principale

### 🔌 Simulator de circuite DC

Utilizatorul poate construi circuite electrice de curent continuu printr-o interfață vizuală, folosind drag-and-drop și conectarea componentelor prin fire.

Componente disponibile:

- baterie;
- rezistor;
- bec;
- întrerupător;
- condensator;
- diodă;
- tranzistor;
- potențiometru;
- voltmetru;
- ampermetru;
- ohmmetru.

---

### 🧠 Rezolvare automată a circuitului

VoltLab analizează circuitul construit și calculează valorile electrice folosind un motor intern bazat pe **Modified Nodal Analysis**.

Aplicația poate afișa valori precum:

- tensiunea pe componente;
- curentul prin ramuri;
- puterea disipată;
- luminozitatea becului;
- încărcarea și descărcarea condensatorului;
- starea bateriei;
- valori măsurate de aparate.

---

### 🟦 Mod schematic

Pe lângă reprezentarea vizuală a componentelor, VoltLab include și un **mod schematic**, în care componentele sunt afișate prin simboluri convenționale folosite la clasă.

Acest mod ajută elevii să facă legătura dintre:

- circuitul construit vizual;
- schema electrică din caiet/manual;
- simbolurile standard folosite în fizică și electronică.

---

### 🔵 Vizualizarea curentului

Pentru a face circuitul mai ușor de înțeles, VoltLab folosește cerculețe animate pe fire pentru a sugera circulația curentului electric.

Această funcționalitate are rol educațional: ajută utilizatorul să vadă traseul curentului și să înțeleagă mai bine ce se întâmplă într-un circuit închis.

---

### 🧪 Exemple interactive

Platforma include o pagină de exemple unde utilizatorul poate încărca rapid circuite predefinite.

Exemplele acoperă situații precum:

- circuit simplu cu baterie și bec;
- rezistor în serie cu bec;
- voltmetru conectat corect;
- ampermetru conectat corect;
- rezistori în serie și paralel;
- divizor de tensiune;
- legile lui Kirchhoff;
- încărcarea condensatorului;
- descărcarea condensatorului;
- conectări greșite intenționate pentru învățare.

---

### 🧩 Logică digitală

VoltLab include și o zonă dedicată logicii digitale, unde pot fi explorate concepte precum porțile logice.

Această extensie duce proiectul dincolo de circuitele electrice simple și îl apropie de zona de electronică digitală și informatică.

---

### ⚠️ Avertizări inteligente

Aplicația nu doar calculează valori, ci încearcă să explice greșelile.

VoltLab poate avertiza utilizatorul în situații precum:

- ampermetru conectat greșit în paralel;
- voltmetru conectat greșit în serie;
- scurtcircuit;
- supratensionarea unui condensator;
- configurații periculoase sau incorecte.

Scopul acestor avertizări nu este doar blocarea simulării, ci explicarea problemei într-un mod ușor de înțeles.

---

### 🌍 Traduceri

VoltLab include suport pentru mai multe limbi, astfel încât interfața și explicațiile să poată fi accesibile unui număr mai mare de utilizatori.

---

### 🔐 Conturi și autentificare

Platforma include sistem de login/register și autentificare cu Google, folosind Firebase.

Prin această integrare, aplicația poate fi extinsă cu funcții precum salvarea progresului, personalizarea experienței și accesul la resurse educaționale asociate contului.

---

### 📲 PWA

VoltLab este și o aplicație de tip **Progressive Web App**.

Asta înseamnă că poate fi:

- instalată din browser;
- deschisă ca aplicație separată;
- folosită mai ușor pe diferite dispozitive;
- accesată parțial și fără conexiune la internet, în funcție de resursele salvate local.

---

## 🛠️ Tehnologii folosite

Proiectul este construit folosind tehnologii web moderne:

- **React** – interfață component-based;
- **React Router** – navigare între pagini;
- **Tailwind CSS** – stilizare rapidă și responsive;
- **Canvas 2D** – randarea laboratorului și a componentelor;
- **SVG** – simboluri și reprezentări schematice;
- **Firebase** – autentificare și servicii backend;
- **Google Auth** – login rapid cu cont Google;
- **PWA** – instalare și acces offline;
- **JavaScript modules** – separarea logicii în fișiere clare;
- **Modified Nodal Analysis** – calculul circuitelor electrice.

---

## 🧱 Structura proiectului

Structura principală a proiectului este organizată pe pagini, componente, hook-uri și module de logică.

```txt
src/
├── pages/
│   ├── LabPage.jsx
│   ├── Theory.jsx
│   ├── HowItWorks.jsx
│   ├── Examples.jsx
│   └── About.jsx
│
├── components/
│   ├── lab/
│   ├── layout/
│   └── accounts/
│
├── hooks/
│   ├── useVoltLabStore.jsx
│   ├── useCanvasRenderer.js
│   ├── useWorkspaceEvents.js
│   └── useHistory.js
│
├── core/
│   ├── mnaSolver.js
│   ├── circuitBuilder.js
│   ├── nets.js
│   ├── safetyChecks.js
│   ├── powerDynamics.js
│   ├── capacitorDynamics.js
│   ├── defaults.js
│   ├── coords.js
│   ├── formatting.js
│   └── utils.js
│
└── styles/
    └── globals.css
