import { useEffect, useRef } from "react";
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

function isJunctionNode(n) {
  return n?.kind === "junction" || n?.itemId == null || n?.name === "junction";
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

function findNearestJunction(nodes, worldPoint, radiusWorld) {
  let best = null;
  let bestD = Infinity;

  for (const n of nodes) {
    if (!isJunctionNode(n)) continue;

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

function isInsideItemApprox(item, worldPoint) {
  const size = (item.sizePct ?? 100) / 100;

  const halfW = 115 * size;
  const halfH = 75 * size;

  const dx = worldPoint.x - item.x;
  const dy = worldPoint.y - item.y;

  return Math.abs(dx) <= halfW && Math.abs(dy) <= halfH;
}

function findItemAtWorld(items, worldPoint) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];

    if (isInsideItemApprox(it, worldPoint)) {
      return it;
    }
  }

  return null;
}

export function useWorkspaceEvents(workspaceRef, overlayRef) {
  const { state, actions, dispatch } = useVoltLab();

  const junctionDragRef = useRef(null);

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

    function isComponentTarget(target) {
      if (!target || !el.contains(target)) return false;

      if (target.closest?.("[data-voltlab-item='true']")) return true;
      if (target.closest?.("[data-item-id]")) return true;
      if (target.closest?.(".voltlab-item")) return true;

      return false;
    }

    function isWorkspaceTarget(target) {
      if (!target) return false;

      if (isComponentTarget(target)) return false;

      if (target === el) return true;
      if (target === overlayRef.current) return true;

      if (el.contains(target)) return true;

      return false;
    }

    function onMouseDown(e) {
      const loc = getLocal(e);
      const worldPoint = screenToWorld(loc.x, loc.y, state.cam);

      const targetIsComponent = isComponentTarget(e.target);
      const itemUnderMouse = findItemAtWorld(state.items, worldPoint);

      // Dacă apăsăm pe componentă, NU pornim pan.
      // Componenta este gestionată de onItemMouseDown din Overlay/useVoltLabStore.
      if (targetIsComponent || itemUnderMouse) {
        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __panCandidate: null,
            __pan: null,
          },
        });

        return;
      }

      if (!isWorkspaceTarget(e.target)) return;

      if (e.button === 0 && state.mode === "select") {
        const junctionHitRadiusWorld = 22 / state.cam.z;

        const hitJunction = findNearestJunction(
          state.nodes,
          worldPoint,
          junctionHitRadiusWorld
        );

        if (hitJunction) {
          e.preventDefault();
          e.stopPropagation();

          junctionDragRef.current = {
            id: hitJunction.id,
            dx: worldPoint.x - hitJunction.x,
            dy: worldPoint.y - hitJunction.y,
          };

          dispatch({ type: "SET_SELECTED", id: null });

          return;
        }
      }

      if (state.mode === "select") {
        dispatch({ type: "SET_SELECTED", id: null });
      }

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
      const junctionDrag = junctionDragRef.current;

      // 1. Mutare joncțiune — prioritate maximă.
      if (junctionDrag) {
        const loc = getLocal(e);
        const w = screenToWorld(loc.x, loc.y, state.cam);

        const nodes = state.nodes.map((n) => {
          if (n.id !== junctionDrag.id) return n;

          return {
            ...n,
            x: w.x - junctionDrag.dx,
            y: w.y - junctionDrag.dy,
          };
        });

        dispatch({
          type: "SET_ITEMS_NODES_WIRES",
          items: state.items,
          nodes,
          wires: state.wires,
        });

        return;
      }

      const drag = state.cam.__drag;

      // 2. Mutare componentă — înainte de pan.
      if (drag) {
        const loc = getLocal(e);
        const w = screenToWorld(loc.x, loc.y, state.cam);

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

        return;
      }

      // 3. Pan doar dacă nu tragem nimic.
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
      junctionDragRef.current = null;

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

      const loc = getLocal(e);
      const w = screenToWorld(loc.x, loc.y, state.cam);

      const delta = -e.deltaY;
      const newZ = clamp(state.cam.z * (delta > 0 ? 1.08 : 0.92), 0.25, 3.0);

      const newX = loc.x - w.x * newZ;
      const newY = loc.y - w.y * newZ;

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
      if (e.button !== 0) return;

      if (isComponentTarget(e.target)) return;

      const loc = getLocal(e);
      const worldPoint = screenToWorld(loc.x, loc.y, state.cam);
      const screenPoint = { x: loc.x, y: loc.y };

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

      actions.addJunctionAndUseAsWireTarget(worldPoint.x, worldPoint.y);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        junctionDragRef.current = null;

        dispatch({
          type: "SET_WIRE_STATE",
          wire: {
            startNodeId: null,
            points: [],
            previewWorld: null,
          },
        });

        dispatch({
          type: "SET_CAM",
          cam: {
            ...state.cam,
            __panCandidate: null,
            __pan: null,
            __drag: null,
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