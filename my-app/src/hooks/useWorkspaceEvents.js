import { useEffect } from "react";
import { useVoltLab } from "./useVoltLabStore.jsx";
import { screenToWorld, worldToScreen } from "../core/coords";
import { clamp } from "../core/utils";
import { recalcItemNodes } from "../core/defaults";

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function distancePointToSegment(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;

  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLen2 = abx * abx + aby * aby;

  if (abLen2 <= 0.000001) {
    return Math.sqrt(dist2(p, a));
  }

  let t = (apx * abx + apy * aby) / abLen2;
  t = Math.max(0, Math.min(1, t));

  const proj = {
    x: a.x + abx * t,
    y: a.y + aby * t,
  };

  return Math.sqrt(dist2(p, proj));
}

function findNearestNode(nodes, worldPoint, radiusWorld) {
  let best = null;
  let bestD = Infinity;

  for (const n of nodes) {
    const d = dist2(n, worldPoint);

    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }

  if (!best) return null;

  return bestD <= radiusWorld * radiusWorld ? best : null;
}

function findNearestWire(wires, nodes, cam, screenPoint, radiusPx = 12) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  let best = null;
  let bestD = Infinity;

  for (let i = 0; i < wires.length; i++) {
    const wire = wires[i];

    const aNode = nodeMap.get(wire.aNodeId);
    const bNode = nodeMap.get(wire.bNodeId);

    if (!aNode || !bNode) continue;

    const points = [
      { x: aNode.x, y: aNode.y },
      ...(wire.points ?? []),
      { x: bNode.x, y: bNode.y },
    ];

    for (let j = 0; j < points.length - 1; j++) {
      const a = worldToScreen(points[j].x, points[j].y, cam);
      const b = worldToScreen(points[j + 1].x, points[j + 1].y, cam);

      const d = distancePointToSegment(screenPoint, a, b);

      if (d < bestD) {
        bestD = d;
        best = {
          wire,
          wireIndex: i,
          segmentIndex: j,
          distance: d,
        };
      }
    }
  }

  return best && bestD <= radiusPx ? best : null;
}

export function useWorkspaceEvents(workspaceRef, overlayRef) {
  const { state, actions, dispatch } = useVoltLab();

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    function getLocal(e) {
      const r = el.getBoundingClientRect();

      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      };
    }

    function isBackgroundTarget(target) {
      return target === el || target === overlayRef.current;
    }

    function onMouseDown(e) {
      if (!isBackgroundTarget(e.target)) return;

      if (state.mode === "select") {
        dispatch({ type: "SET_SELECTED", id: null });
      }

      // PAN cu left-drag doar în select mode
      if (e.button === 0 && state.mode === "select") {
        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __panCandidate: {
              sx: e.clientX,
              sy: e.clientY,
              x: state.cam.x,
              y: state.cam.y,
              started: false,
            },
          },
        });

        return;
      }

      // pan start cu middle/right click
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();

        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __pan: {
              sx: e.clientX,
              sy: e.clientY,
              x: state.cam.x,
              y: state.cam.y,
            },
          },
        });
      }
    }

    function onMouseMove(e) {
      const cand = state.cam.__panCandidate;

      if (cand) {
        const dx = e.clientX - cand.sx;
        const dy = e.clientY - cand.sy;

        if (!cand.started) {
          if (Math.abs(dx) + Math.abs(dy) > 3) {
            dispatch({
              type: "SET_CAM",
              cam: {
                ...state.cam,
                __panCandidate: {
                  ...cand,
                  started: true,
                },
              },
            });
          }
        }

        if (cand.started) {
          actions.setCam({
            x: cand.x + dx,
            y: cand.y + dy,
          });
        }
      }

      const pan = state.cam.__pan;

      if (pan) {
        const dx = e.clientX - pan.sx;
        const dy = e.clientY - pan.sy;

        actions.setCam({
          x: pan.x + dx,
          y: pan.y + dy,
        });
      }

      const drag = state.cam.__drag;

      if (drag) {
        const r = el.getBoundingClientRect();
        const sx = e.clientX - r.left;
        const sy = e.clientY - r.top;
        const w = screenToWorld(sx, sy, state.cam);

        const movedItem = state.items.find((it) => it.id === drag.id);
        if (!movedItem) return;

        const nextItem = {
          ...movedItem,
          x: w.x - drag.dx,
          y: w.y - drag.dy,
        };

        const items = state.items.map((it) =>
          it.id === drag.id ? nextItem : it
        );

        const nodes = recalcItemNodes(nextItem, state.nodes);

        dispatch({
          type: "SET_ITEMS_NODES_WIRES",
          items,
          nodes,
          wires: state.wires,
        });
      }

      if (state.mode === "wire") {
        const loc = getLocal(e);
        const w = screenToWorld(loc.x, loc.y, state.cam);

        dispatch({
          type: "SET_WIRE_STATE",
          wire: { previewWorld: w },
        });
      }
    }

    function onMouseUp() {
      if (state.cam.__panCandidate) {
        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __panCandidate: null,
          },
        });
      }

      if (state.cam.__pan) {
        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __pan: null,
          },
        });
      }

      if (state.cam.__drag) {
        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __drag: null,
          },
        });
      }
    }

    function onWheel(e) {
      e.preventDefault();

      const r = el.getBoundingClientRect();
      const sx = e.clientX - r.left;
      const sy = e.clientY - r.top;

      const w = screenToWorld(sx, sy, state.cam);

      const delta = -e.deltaY;
      const newZ = clamp(state.cam.z * (delta > 0 ? 1.08 : 0.92), 0.25, 3.0);

      const newX = sx - w.x * newZ;
      const newY = sy - w.y * newZ;

      actions.setCam({
        x: newX,
        y: newY,
        z: newZ,
      });
    }

    function onContextMenu(e) {
      e.preventDefault();
    }

    function onClick(e) {
      if (state.mode !== "wire") return;

      // doar left click
      if (e.button !== 0) return;

      const loc = getLocal(e);
      const worldPoint = screenToWorld(loc.x, loc.y, state.cam);
      const screenPoint = { x: loc.x, y: loc.y };

      // 1. Mai întâi încercăm să prindem un nod existent.
      // Radius în world scade când zoom-ul crește, ca vizual să rămână constant.
      const nodeHitRadiusWorld = 18 / state.cam.z;

      const hitNode = findNearestNode(
        state.nodes,
        worldPoint,
        nodeHitRadiusWorld
      );

      if (hitNode) {
        actions.useNodeAsWireTarget(hitNode.id);
        return;
      }

      // 2. Dacă nu am prins nod, verificăm dacă am dat click pe un fir existent.
      // Dacă da, firul se sparge: A ---- B devine A ---- J ---- B.
      const hitWire = findNearestWire(
        state.wires,
        state.nodes,
        state.cam,
        screenPoint,
        12
      );

      if (hitWire) {
        actions.insertJunctionOnWire(
          hitWire.wireIndex,
          worldPoint.x,
          worldPoint.y
        );

        return;
      }

      // 3. Dacă am dat click pe spațiu gol, creăm un nod liber.
      // Dacă nu exista fir început, nodul devine început de fir.
      // Dacă exista fir început, se creează fir până la acest nod.
      actions.addJunctionAndUseAsWireTarget(worldPoint.x, worldPoint.y);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        dispatch({
          type: "SET_WIRE_STATE",
          wire: {
            startNodeId: null,
            points: [],
            previewWorld: null,
          },
        });

        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();

        if (e.shiftKey) actions.redo();
        else actions.undo();

        return;
      }

      if (e.key === "Delete") {
        if (state.selectedId) {
          actions.deleteItem(state.selectedId);
        }
      }

      if (e.key.toLowerCase() === "w") {
        actions.setMode("wire");
      }

      if (e.key.toLowerCase() === "s") {
        actions.setMode("select");
      }
    }

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("click", onClick);
    el.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("click", onClick);
      el.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [workspaceRef, overlayRef, state, actions, dispatch]);
}