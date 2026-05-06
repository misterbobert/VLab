import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const MAX_ITEMS = 120;
const MAX_NODES = 350;
const MAX_WIRES = 350;
const MAX_GATES = 180;
const MAX_TITLE_LENGTH = 60;

function getUserOrThrow() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Trebuie să fii conectat pentru această acțiune.");
  }

  return user;
}

function cleanTitle(value) {
  const text = String(value ?? "").trim();

  if (!text) return "Circuit VoltLab";

  return text.replace(/[<>]/g, "").slice(0, MAX_TITLE_LENGTH);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanCam(cam) {
  if (!isObject(cam)) {
    return { x: 0, y: 0, z: 1 };
  }

  return {
    x: cleanNumber(cam.x, 0),
    y: cleanNumber(cam.y, 0),
    z: Math.max(0.1, Math.min(5, cleanNumber(cam.z, 1))),
  };
}

function validateElectricSnapshot(snapshot) {
  if (!Array.isArray(snapshot.items)) {
    throw new Error("Componentele circuitului sunt invalide.");
  }

  if (!Array.isArray(snapshot.nodes)) {
    throw new Error("Nodurile circuitului sunt invalide.");
  }

  if (!Array.isArray(snapshot.wires)) {
    throw new Error("Firele circuitului sunt invalide.");
  }

  if (snapshot.items.length > MAX_ITEMS) {
    throw new Error("Circuitul are prea multe componente.");
  }

  if (snapshot.nodes.length > MAX_NODES) {
    throw new Error("Circuitul are prea multe noduri.");
  }

  if (snapshot.wires.length > MAX_WIRES) {
    throw new Error("Circuitul are prea multe fire.");
  }

  return {
    kind: "electric-lab",
    version: Number(snapshot.version) || 1,

    items: snapshot.items,
    nodes: snapshot.nodes,
    wires: snapshot.wires,

    selectedId: snapshot.selectedId ?? null,
    selectedWireSegment: snapshot.selectedWireSegment ?? null,
    lastTouched: snapshot.lastTouched ?? null,

    cam: cleanCam(snapshot.cam),
    mode: snapshot.mode === "wire" ? "wire" : "select",

    savedAt: snapshot.savedAt ?? Date.now(),
  };
}

function validateLogicSnapshot(snapshot) {
  if (!Array.isArray(snapshot.gates)) {
    throw new Error("Componentele circuitului logic sunt invalide.");
  }

  if (!Array.isArray(snapshot.wires)) {
    throw new Error("Firele circuitului logic sunt invalide.");
  }

  if (snapshot.gates.length > MAX_GATES) {
    throw new Error("Circuitul logic are prea multe componente.");
  }

  if (snapshot.wires.length > MAX_WIRES) {
    throw new Error("Circuitul logic are prea multe fire.");
  }

  const gates = snapshot.gates.map((gate) => {
    if (!isObject(gate)) {
      throw new Error("O poartă logică este invalidă.");
    }

    if (typeof gate.id !== "string" || !gate.id.trim()) {
      throw new Error("O poartă logică nu are ID valid.");
    }

    if (typeof gate.type !== "string" || !gate.type.trim()) {
      throw new Error("O poartă logică nu are tip valid.");
    }

    return {
      id: gate.id,
      type: gate.type,
      x: cleanNumber(gate.x, 0),
      y: cleanNumber(gate.y, 0),
      label: String(gate.label ?? gate.type).slice(0, 60),
      value: gate.type === "input" ? Boolean(gate.value) : gate.value ?? null,
    };
  });

  const wires = snapshot.wires.map((wire) => {
    if (!isObject(wire)) {
      throw new Error("Un fir logic este invalid.");
    }

    if (typeof wire.id !== "string" || !wire.id.trim()) {
      throw new Error("Un fir logic nu are ID valid.");
    }

    if (typeof wire.from !== "string" || !wire.from.trim()) {
      throw new Error("Un fir logic nu are pin de pornire valid.");
    }

    if (typeof wire.to !== "string" || !wire.to.trim()) {
      throw new Error("Un fir logic nu are pin de destinație valid.");
    }

    return {
      id: wire.id,
      from: wire.from,
      to: wire.to,
    };
  });

  return {
    kind: "logic-lab",
    version: Number(snapshot.version) || 1,

    gates,
    wires,

    selectedId: snapshot.selectedId ?? null,
    activePin: null,

    cam: cleanCam(snapshot.cam),
    mode: snapshot.mode === "wire" ? "wire" : "select",

    savedAt: snapshot.savedAt ?? Date.now(),
  };
}

export function validateCircuitSnapshot(snapshot) {
  if (!isObject(snapshot)) {
    throw new Error("Circuit invalid.");
  }

  if (snapshot.kind === "logic-lab") {
    return validateLogicSnapshot(snapshot);
  }

  return validateElectricSnapshot(snapshot);
}

export async function saveCircuitToCloud({ title, snapshot }) {
  const user = getUserOrThrow();
  const safeSnapshot = validateCircuitSnapshot(snapshot);

  const ref = await addDoc(collection(db, "circuits"), {
    ownerUid: user.uid,
    title: cleanTitle(title),
    kind: safeSnapshot.kind,
    snapshot: safeSnapshot,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listMyCircuits(kind = null) {
  const user = getUserOrThrow();

  const q = query(collection(db, "circuits"), where("ownerUid", "==", user.uid));

  const snap = await getDocs(q);

  let circuits = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  if (kind === "logic-lab") {
    circuits = circuits.filter((circuit) => circuit.kind === "logic-lab");
  }

  if (kind === "electric-lab") {
    circuits = circuits.filter(
      (circuit) =>
        circuit.kind === "electric-lab" ||
        circuit.kind == null ||
        circuit.snapshot?.kind === "electric-lab" ||
        circuit.snapshot?.items
    );
  }

  return circuits.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() ?? 0;
    const bTime = b.updatedAt?.toMillis?.() ?? 0;

    return bTime - aTime;
  });
}
export async function loadCircuitFromCloud(circuitId) {
  const user = getUserOrThrow();

  const ref = doc(db, "circuits", circuitId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Circuitul nu există.");
  }

  const data = snap.data();

  if (data.ownerUid !== user.uid) {
    throw new Error("Nu ai acces la acest circuit.");
  }

  return validateCircuitSnapshot(data.snapshot);
}

export async function deleteCircuitFromCloud(circuitId) {
  const user = getUserOrThrow();

  const ref = doc(db, "circuits", circuitId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  if (data.ownerUid !== user.uid) {
    throw new Error("Nu poți șterge acest circuit.");
  }

  await deleteDoc(ref);
}

function makeTransferCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  let code = "";

  for (const byte of bytes) {
    code += alphabet[byte % alphabet.length];
  }

  return code;
}

export async function createTransferCodeFromCircuit(circuitId) {
  const user = getUserOrThrow();

  const circuitRef = doc(db, "circuits", circuitId);
  const circuitSnap = await getDoc(circuitRef);

  if (!circuitSnap.exists()) {
    throw new Error("Circuitul salvat nu există.");
  }

  const circuit = circuitSnap.data();

  if (circuit.ownerUid !== user.uid) {
    throw new Error("Nu ai acces la acest circuit.");
  }

  const snapshot = validateCircuitSnapshot(circuit.snapshot);
  const code = makeTransferCode();

  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 1000 * 60 * 60 * 24)
  );

  await setDoc(doc(db, "transferCodes", code), {
    ownerUid: user.uid,
    circuitId,
    title: circuit.title || "Circuit VoltLab",
    kind: snapshot.kind,
    snapshot,
    createdAt: serverTimestamp(),
    expiresAt,
  });

  return code;
}

export async function loadCircuitByTransferCode(code) {
  const safeCode = String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (safeCode.length < 6 || safeCode.length > 12) {
    throw new Error("Codul introdus nu este valid.");
  }

  const ref = doc(db, "transferCodes", safeCode);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Codul nu există.");
  }

  const data = snap.data();

  if (data.expiresAt?.toDate && data.expiresAt.toDate() < new Date()) {
    throw new Error("Codul a expirat.");
  }

  return validateCircuitSnapshot(data.snapshot);
}