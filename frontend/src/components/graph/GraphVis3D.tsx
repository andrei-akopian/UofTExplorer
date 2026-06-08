import SpriteText from "three-spritetext";
import ForceGraph3D from "3d-force-graph";
import type { GraphData } from "../../types";
import { useRef, useEffect } from "react";

// ───────────────────────────────────────────────
//   TUNABLE CONSTANTS
// ───────────────────────────────────────────────
const MIN_RADIUS_STEP = 50;
const NODE_GIRTH = 60;
const DEPTH_STRENGTH = 0.12;
const PENDULUM_BIAS = 0.0;
const DOWN_VECTOR_FORCE = 5.0;

interface ProcessedGraphData {
  nodes: Array<any>;
  links: Array<{ source: string; target: string }>;
}

function processGraphData(
  data: GraphData,
  useShellLayout: boolean,
): ProcessedGraphData {
  if (!data?.nodes) return { nodes: [], links: [] };

  const validNodeIds = new Set(data.nodes.map((n) => String(n.id)));
  const levels: Record<number, any[]> = {};

  if (useShellLayout) {
    data.nodes.forEach((n) => {
      const d =
        n.depth !== null && n.depth !== undefined
          ? parseInt(String(n.depth))
          : null;
      if (d !== null) {
        if (!levels[d]) levels[d] = [];
        levels[d].push(n);
      }
    });
  }

  const levelRadii: Record<number, number> = {};
  let currentRadius = 0;
  const sortedDepths = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  sortedDepths.forEach((depth) => {
    const nodeCount = levels[depth].length;
    const requiredRadius = (nodeCount * NODE_GIRTH) / (2 * Math.PI);
    currentRadius += Math.max(MIN_RADIUS_STEP, requiredRadius);
    levelRadii[depth] = currentRadius;
  });

  const nodes = data.nodes.map((n) => {
    const depth =
      n.depth !== null && n.depth !== undefined
        ? parseInt(String(n.depth))
        : null;
    const targetRadius = depth !== null ? levelRadii[depth] : null;

    return {
      ...n,
      id: String(n.id),
      depth,
      targetRadius: useShellLayout ? targetRadius : null,
      x: (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * 120,
      y:
        useShellLayout && depth !== null
          ? -levelRadii[depth]
          : (Math.random() - 0.5) * 120,
    };
  });

  const links = (data.edges || [])
    .filter((e) => {
      const hasSource =
        e.from !== null && e.from !== undefined && e.from !== "None";
      const hasTarget = e.to !== null && e.to !== undefined && e.to !== "None";
      const exists =
        validNodeIds.has(String(e.from)) && validNodeIds.has(String(e.to));
      return hasSource && hasTarget && exists;
    })
    .map((e) => ({
      source: String(e.from),
      target: String(e.to),
    }));

  return { nodes, links };
}

function radialPendulumForce(useShellLayout: boolean) {
  let nodes: any;
  function force(alpha: number) {
    if (!useShellLayout || !nodes) return;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const rTarget = node.targetRadius;

      if (rTarget === null || rTarget === undefined) continue;

      const x = node.x;
      const y = node.y;
      const z = node.z;
      const rCurrent = Math.sqrt(x * x + y * y + z * z) || 1;

      const rDelta = (rTarget - rCurrent) * DEPTH_STRENGTH * alpha;
      node.vx += (x / rCurrent) * rDelta;
      node.vy += (y / rCurrent) * rDelta;
      node.vz += (z / rCurrent) * rDelta;

      node.vx -= x * PENDULUM_BIAS * alpha;
      node.vz -= z * PENDULUM_BIAS * alpha;
      node.vy -= DOWN_VECTOR_FORCE * PENDULUM_BIAS * alpha;
    }
  }
  force.initialize = (_: any) => (nodes = _);
  return force;
}

function focusNode(graph: any, node: any) {
  if (!node) return;

  const nodeX = Number.isFinite(node.x) ? node.x : 0;
  const nodeY = Number.isFinite(node.y) ? node.y : 0;
  const nodeZ = Number.isFinite(node.z) ? node.z : 0;
  const distance = 140;
  const length = Math.hypot(nodeX, nodeY, nodeZ);

  let cameraTarget;
  if (length > 0) {
    const scale = 1 + distance / length;
    cameraTarget = {
      x: nodeX * scale,
      y: nodeY * scale,
      z: nodeZ * scale,
    };
  } else {
    cameraTarget = { x: distance, y: distance * 0.35, z: distance };
  }

  graph.cameraPosition(cameraTarget, node, 1200);
}

export default function GraphVis3D({
  graphData,
  useShellLayout,
  loading,
}: {
  graphData: GraphData;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  useShellLayout: boolean;
  setMessage: (message: string) => void;
  setMessageType: (messageType: "success" | "error" | "info") => void;
}) {
  const graphFrame = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (!graphFrame.current || !graphData?.nodes?.length) return;

    const processedData = processGraphData(graphData, useShellLayout);
    if (!graphRef.current) {
      graphRef.current = new ForceGraph3D(graphFrame.current)
        .graphData(processedData)
        .nodeLabel((n: any) => `${n.label}: ${n.title}`)
        .nodeVal((node: any) => (node.depth === 0 ? 10 : 5))
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(0.5)
        .nodeThreeObjectExtend(true)
        .nodeThreeObject((node: any) => {
          const sprite = new SpriteText(node.code || node.label || node.id);
          sprite.color = "#1a1a1a";
          sprite.strokeWidth = 1;
          sprite.strokeColor = "#ffffff";
          sprite.textHeight = 8;
          // @ts-expect-error: position is not typed on SpriteText, but it exists at runtime
          sprite.position.y = -10;
          return sprite;
        })
        .onNodeClick((node: any) => {
          focusNode(graphRef.current, node);
        })
        .linkHoverPrecision(10)
        .linkColor(() => "#999999")
        .backgroundColor("#f5f5f5");

      graphRef.current.d3Force("radial", radialPendulumForce(useShellLayout));
      graphRef.current.d3Force("charge").strength(-150);
      graphRef.current.d3Force("link").distance(100);
    } else {
      graphRef.current.graphData(processedData);
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData, useShellLayout]);

  return (
    <>
      <div
        ref={graphFrame}
        id="graph"
        className="h-full w-full overflow-hidden"
      ></div>
      <div className={loading ? "" : "hidden"}>
        <div className="absolute top-0 flex h-full w-full">
          <div className="m-auto flex h-60 w-60 animate-spin items-center justify-center rounded-[50%] border-8 border-blue-100 border-t-blue-500"></div>
        </div>
        <div className="absolute top-0 flex h-full w-full">
          <div className="m-auto text-center text-5xl">Loading</div>
        </div>
      </div>
    </>
  );
}
