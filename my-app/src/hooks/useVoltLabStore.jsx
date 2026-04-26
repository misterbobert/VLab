import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import {
  defaultPropsForType,
  makeItemWithNodes,
  recalcAllNodes,
} from "../core/defaults";

import { clamp, uid } from "../core/utils";
import { screenToWorld } from "../core/coords";
import { solveNormalDC, applySolutionToItems } from "../core/circuitBuilder";
import { useHistoryCore } from "./useHistory";
import { detectCircuitWarnings } from "../core/safetyChecks";

const Ctx = createContext(null);

const initialState = {
  mode: "select",
  running: false,
  isRunning: false,
  statusText: "Ready",

  items: [],
  nodes: [],
  wires: [],

  selectedId: null,

  cam: { x: 0, y: 0, z: 1 },

  wire: {
    startNodeId: null,
    points: [],
    previewWorld: null,
  },

  sol: null,
  safetyDialog: null,
};

function makeJunctionNode(x, y) {
  return {
    id: uid("j"),
    itemId: null,
    name: "junction",
    kind: "junction",
    x,
    y,
  };
}

function makeWire(aNodeId, bNodeId, points = []) {
  return {
    id: uid("w"),
    aNodeId,
    bNodeId,
    points,
  };
}

function getElectricalSignature(items, nodes, wires) {
  return JSON.stringify({
    items: items.map((it) => {
      const base = {
        id: it.id,
        type: it.type,
        x: it.x,
        y: it.y,
        rot: it.rot,
        sizePct: it.sizePct,
      };

      if (it.type === "battery") {
        return {
          ...base,
          V: it.V,
          Rint: it.Rint,
        };
      }

      if (it.type === "resistor") {
        return {
          ...base,
          R: it.R,
        };
      }

      if (it.type === "switch") {
        return {
          ...base,
          closed: !!it.closed,
        };
      }

      if (it.type === "bulb") {
        return {
          ...base,
          R: it.R,
          Vnom: it.Vnom,
          Pnom: it.Pnom,
          ratedPowerW: it.ratedPowerW,
          polaritySensitive: it.polaritySensitive,
        };
      }

      if (it.type === "voltmeter") return base;
      if (it.type === "ammeter") return base;
      if (it.type === "ohmmeter") return base;

      return base;
    }),

    nodes: nodes.map((n) => ({
      id: n.id,
      itemId: n.itemId,
      name: n.name,
      kind: n.kind,
      x: n.x,
      y: n.y,
      lx: n.lx,
      ly: n.ly,
    })),

    wires: wires.map((w) => ({
      id: w.id,
      aNodeId: w.aNodeId,
      bNodeId: w.bNodeId,
      points: w.points ?? [],
    })),
  });
}

function solveAndApply(items, nodes, wires) {
  const sol = solveNormalDC(items, nodes, wires);
  const solvedItems = applySolutionToItems(items, nodes, sol);

  return { sol, solvedItems };
}

function resetCalculatedValues(items) {
  return items.map((it) => {
    const copy = { ...it };

    if (
      copy.type === "voltmeter" ||
      copy.type === "ammeter" ||
      copy.type === "ohmmeter"
    ) {
      copy.display = "—";
    }

    if (copy.type === "bulb") {
      copy.brightness = 0;
      copy.displayVoltage = "—";
      copy.displayCurrent = "—";
      copy.displayPower = "—";
    }

    if (copy.type === "battery") {
      copy.displayCurrent = "—";
      copy.displayPower = "—";
    }

    return copy;
  });
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        wire:
          action.mode === "wire"
            ? state.wire
            : { startNodeId: null, points: [], previewWorld: null },
      };

    case "SET_STATUS":
      return {
        ...state,
        statusText: action.text,
      };

    case "SET_CAM":
      return {
        ...state,
        cam: action.cam,
      };

    case "SET_SELECTED":
      return {
        ...state,
        selectedId: action.id,
      };

    case "SET_ITEMS_NODES_WIRES": {
      const nodes = recalcAllNodes(action.items, action.nodes);

      return {
        ...state,
        items: action.items,
        nodes,
        wires: action.wires,
      };
    }

    case "SET_WIRE_STATE":
      return {
        ...state,
        wire: {
          ...state.wire,
          ...action.wire,
        },
      };

    case "SET_RUNNING":
      return {
        ...state,
        running: action.running,
        isRunning: action.running,
      };

    case "SET_SOLUTION":
      return {
        ...state,
        sol: action.sol,
      };

    case "SET_SAFETY_DIALOG":
      return {
        ...state,
        safetyDialog: action.dialog,
      };

    default:
      return state;
  }
}

export function VoltLabProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const workspaceElRef = useRef(null);

  const history = useHistoryCore({
    getSnapshot: () => ({
      items: state.items,
      nodes: state.nodes,
      wires: state.wires,
      selectedId: state.selectedId,
      cam: state.cam,
      mode: state.mode,
    }),

    restoreSnapshot: (snap) => {
      dispatch({ type: "SET_RUNNING", running: false });
      dispatch({ type: "SET_SOLUTION", sol: null });
      dispatch({ type: "SET_SAFETY_DIALOG", dialog: null });

      const cleanItems = resetCalculatedValues(snap.items ?? state.items);

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: cleanItems,
        nodes: snap.nodes ?? state.nodes,
        wires: snap.wires ?? state.wires,
      });

      dispatch({ type: "SET_SELECTED", id: snap.selectedId ?? null });
      dispatch({ type: "SET_CAM", cam: snap.cam ?? state.cam });
      dispatch({ type: "SET_MODE", mode: snap.mode ?? "select" });

      dispatch({
        type: "SET_WIRE_STATE",
        wire: { startNodeId: null, points: [], previewWorld: null },
      });

      dispatch({ type: "SET_STATUS", text: "Restored snapshot" });
    },
  });

  const electricalSignature = useMemo(
    () => getElectricalSignature(state.items, state.nodes, state.wires),
    [state.items, state.nodes, state.wires]
  );

  useEffect(() => {
    if (!state.running) return;

    const { sol, solvedItems } = solveAndApply(
      state.items,
      state.nodes,
      state.wires
    );

    dispatch({ type: "SET_SOLUTION", sol });

    dispatch({
      type: "SET_ITEMS_NODES_WIRES",
      items: solvedItems,
      nodes: state.nodes,
      wires: state.wires,
    });

    const warnings = detectCircuitWarnings(
      solvedItems,
      state.nodes,
      state.wires,
      sol
    );

    if (warnings.length > 0 && !state.safetyDialog) {
      dispatch({
        type: "SET_SAFETY_DIALOG",
        dialog: {
          warnings,
        },
      });
    }

    dispatch({
      type: "SET_STATUS",
      text: sol?.ok ? "Running" : "Solve failed",
    });
  }, [state.running, electricalSignature]);

  const actions = useMemo(() => {
    function pushHistory(label) {
      history.push(label);
    }

    function setStatus(text) {
      dispatch({ type: "SET_STATUS", text });
    }

    function setMode(mode) {
      dispatch({ type: "SET_MODE", mode });
      setStatus(mode === "wire" ? "Wire mode" : "Select mode");
    }

    function setCam(patch) {
      const cam = {
        ...state.cam,
        ...patch,
        z: clamp(patch.z ?? state.cam.z, 0.25, 3.0),
      };

      dispatch({ type: "SET_CAM", cam });
    }

    function addItemAt(type, worldX, worldY) {
      pushHistory("add");

      const base = defaultPropsForType(type);
      const { item, nodes } = makeItemWithNodes(type, worldX, worldY, base);

      const items = [...state.items, item];
      const allNodes = [...state.nodes, ...nodes];

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items,
        nodes: allNodes,
        wires: state.wires,
      });

      dispatch({ type: "SET_SELECTED", id: item.id });
      setStatus(`Placed ${type}`);
    }

    function updateItem(id, patch) {
      pushHistory("edit");

      const items = state.items.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      );

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items,
        nodes: state.nodes,
        wires: state.wires,
      });
    }

    function deleteItem(id) {
      const item = state.items.find((x) => x.id === id);
      if (!item) return;

      pushHistory("delete");

      const items = state.items.filter((x) => x.id !== id);
      const nodes = state.nodes.filter((n) => n.itemId !== id);

      const alive = new Set(nodes.map((n) => n.id));

      const wires = state.wires.filter(
        (w) => alive.has(w.aNodeId) && alive.has(w.bNodeId)
      );

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items,
        nodes,
        wires,
      });

      dispatch({ type: "SET_SELECTED", id: null });

      dispatch({
        type: "SET_WIRE_STATE",
        wire: { startNodeId: null, points: [], previewWorld: null },
      });

      setStatus(state.running ? "Running" : "Deleted item");
    }

    function clearWires() {
      pushHistory("clear wires");

      const nodes = state.nodes.filter((n) => n.itemId);

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: state.items,
        nodes,
        wires: [],
      });

      dispatch({
        type: "SET_WIRE_STATE",
        wire: { startNodeId: null, points: [], previewWorld: null },
      });

      setStatus(state.running ? "Running" : "Cleared wires");
    }

    function handleDrop(...args) {
      if (args[0] && typeof args[0] === "object" && "dataTransfer" in args[0]) {
        const e = args[0];
        const workspaceRef = args[1];

        e.preventDefault();

        const el = workspaceRef?.current ?? workspaceElRef.current;
        if (!el) return;

        workspaceElRef.current = el;

        let payload = null;

        try {
          payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
        } catch {
          payload = null;
        }

        if (!payload?.type) return;

        const rect = el.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const w = screenToWorld(sx, sy, state.cam);

        addItemAt(payload.type, w.x, w.y);
        return;
      }

      const [type, clientX, clientY, workspaceEl] = args;

      if (!type || !workspaceEl) return;

      workspaceElRef.current = workspaceEl;

      const rect = workspaceEl.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const w = screenToWorld(sx, sy, state.cam);

      addItemAt(type, w.x, w.y);
    }

    function onItemMouseDown(itemId, e) {
      e.preventDefault?.();
      e.stopPropagation?.();

      dispatch({ type: "SET_SELECTED", id: itemId });

      if (state.mode !== "select") return;

      const el = workspaceElRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const w = screenToWorld(sx, sy, state.cam);

      const it = state.items.find((x) => x.id === itemId);
      if (!it) return;

      dispatch({
        type: "SET_CAM",
        cam: {
          ...state.cam,

          __panCandidate: null,
          __pan: null,

          __drag: {
            id: itemId,
            dx: w.x - it.x,
            dy: w.y - it.y,
          },
        },
      });
    }

    function addWire(aNodeId, bNodeId, points = []) {
      if (!aNodeId || !bNodeId || aNodeId === bNodeId) return;

      pushHistory("wire");

      const normA = aNodeId;
      const normB = bNodeId;

      let replaced = false;

      const nextWires = state.wires.map((w) => {
        const same =
          (w.aNodeId === normA && w.bNodeId === normB) ||
          (w.aNodeId === normB && w.bNodeId === normA);

        if (!same) return w;

        replaced = true;

        return {
          ...w,
          aNodeId: normA,
          bNodeId: normB,
          points,
        };
      });

      const wires = replaced
        ? nextWires
        : [...state.wires, makeWire(normA, normB, points)];

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: state.items,
        nodes: state.nodes,
        wires,
      });
    }

    function addJunctionAt(worldX, worldY) {
      pushHistory("junction");

      const junction = makeJunctionNode(worldX, worldY);

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: state.items,
        nodes: [...state.nodes, junction],
        wires: state.wires,
      });

      setStatus("Added junction");

      return junction.id;
    }

    function useNodeAsWireTarget(nodeId) {
      if (!nodeId) return;

      if (!state.wire.startNodeId) {
        dispatch({
          type: "SET_WIRE_STATE",
          wire: { startNodeId: nodeId, points: [], previewWorld: null },
        });

        setStatus("Wire start selected");
        return;
      }

      if (state.wire.startNodeId === nodeId) {
        dispatch({
          type: "SET_WIRE_STATE",
          wire: { startNodeId: null, points: [], previewWorld: null },
        });

        setStatus("Wire cancelled");
        return;
      }

      addWire(state.wire.startNodeId, nodeId, state.wire.points ?? []);

      dispatch({
        type: "SET_WIRE_STATE",
        wire: { startNodeId: null, points: [], previewWorld: null },
      });

      setStatus(state.running ? "Running" : "Wire connected");
    }

    function addJunctionAndUseAsWireTarget(worldX, worldY) {
      pushHistory("junction wire");

      const junction = makeJunctionNode(worldX, worldY);

      let wires = state.wires;

      if (state.wire.startNodeId && state.wire.startNodeId !== junction.id) {
        wires = [
          ...state.wires,
          makeWire(state.wire.startNodeId, junction.id, state.wire.points ?? []),
        ];
      }

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: state.items,
        nodes: [...state.nodes, junction],
        wires,
      });

      dispatch({
        type: "SET_WIRE_STATE",
        wire: state.wire.startNodeId
          ? { startNodeId: null, points: [], previewWorld: null }
          : { startNodeId: junction.id, points: [], previewWorld: null },
      });

      setStatus(
        state.wire.startNodeId
          ? state.running
            ? "Running"
            : "Wire connected"
          : "Junction selected"
      );

      return junction.id;
    }

    function insertJunctionOnWire(wireIndex, worldX, worldY) {
      const oldWire = state.wires[wireIndex];
      if (!oldWire) return null;

      pushHistory("split wire");

      const junction = makeJunctionNode(worldX, worldY);

      const wires = [];

      for (let i = 0; i < state.wires.length; i++) {
        const w = state.wires[i];

        if (i !== wireIndex) {
          wires.push(w);
          continue;
        }

        wires.push(makeWire(w.aNodeId, junction.id));
        wires.push(makeWire(junction.id, w.bNodeId));
      }

      if (state.wire.startNodeId && state.wire.startNodeId !== junction.id) {
        wires.push(
          makeWire(state.wire.startNodeId, junction.id, state.wire.points ?? [])
        );
      }

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: state.items,
        nodes: [...state.nodes, junction],
        wires,
      });

      dispatch({
        type: "SET_WIRE_STATE",
        wire: state.wire.startNodeId
          ? { startNodeId: null, points: [], previewWorld: null }
          : { startNodeId: junction.id, points: [], previewWorld: null },
      });

      setStatus(
        state.wire.startNodeId
          ? state.running
            ? "Running"
            : "Wire connected to junction"
          : "Wire split"
      );

      return junction.id;
    }

    function play() {
      dispatch({ type: "SET_RUNNING", running: true });
      dispatch({ type: "SET_STATUS", text: "Solving..." });
      dispatch({ type: "SET_SAFETY_DIALOG", dialog: null });

      const { sol, solvedItems } = solveAndApply(
        state.items,
        state.nodes,
        state.wires
      );

      dispatch({ type: "SET_SOLUTION", sol });

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items: solvedItems,
        nodes: state.nodes,
        wires: state.wires,
      });

      const warnings = detectCircuitWarnings(
        solvedItems,
        state.nodes,
        state.wires,
        sol
      );

      if (warnings.length > 0) {
        dispatch({
          type: "SET_SAFETY_DIALOG",
          dialog: {
            warnings,
          },
        });
      }

      dispatch({
        type: "SET_STATUS",
        text: sol?.ok ? "Running" : "Solve failed",
      });
    }

    function stop() {
      dispatch({ type: "SET_RUNNING", running: false });
      dispatch({ type: "SET_SOLUTION", sol: null });
      dispatch({ type: "SET_SAFETY_DIALOG", dialog: null });

      const items = resetCalculatedValues(state.items);

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items,
        nodes: state.nodes,
        wires: state.wires,
      });

      dispatch({ type: "SET_STATUS", text: "Stopped" });
    }

    function closeSafetyDialog() {
      dispatch({ type: "SET_SAFETY_DIALOG", dialog: null });

      dispatch({ type: "SET_RUNNING", running: false });
      dispatch({ type: "SET_SOLUTION", sol: null });

      const items = resetCalculatedValues(state.items);

      dispatch({
        type: "SET_ITEMS_NODES_WIRES",
        items,
        nodes: state.nodes,
        wires: state.wires,
      });

      dispatch({ type: "SET_STATUS", text: "Stopped after warning" });
    }

    function undo() {
      history.undo();
    }

    function redo() {
      history.redo();
    }

    return {
      setMode,
      setStatus,
      setCam,

      handleDrop,
      onItemMouseDown,

      addWire,
      addJunctionAt,
      useNodeAsWireTarget,
      addJunctionAndUseAsWireTarget,
      insertJunctionOnWire,

      updateItem,
      deleteItem,
      clearWires,

      play,
      stop,

      closeSafetyDialog,

      undo,
      redo,
    };
  }, [state, history]);

  const value = useMemo(
    () => ({ state, dispatch, actions, history }),
    [state, actions, history]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVoltLab() {
  const v = useContext(Ctx);

  if (!v) {
    throw new Error("useVoltLab must be used inside VoltLabProvider");
  }

  return v;
}