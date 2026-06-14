import SpriteText from "three-spritetext";
import ForceGraph3D from "3d-force-graph";
import type { GraphData, GraphNode } from "../../types";
import { useRef, useEffect, useCallback } from "react";
import { useCreateDirectedGraph } from "../../hooks/useGraph";

// ───────────────────────────────────────────────
//   TUNABLE CONSTANTS
// ───────────────────────────────────────────────
const MIN_RADIUS_STEP = 50;
const NODE_GIRTH = 60;

function getGraphBackgroundColor(): string {
  const cssColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-page-bg")
    .trim();
  return cssColor || "#f5f5f5";
}

function isDarkThemeEnabled(): boolean {
  const explicitTheme = document.documentElement.getAttribute("data-theme");
  if (explicitTheme === "dark") {
    return true;
  }
  if (explicitTheme === "light") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function createNodeLabelSprite(node: any): SpriteText {
  const sprite = new SpriteText(node.code || node.label || node.id);
  const darkMode = isDarkThemeEnabled();
  sprite.color = darkMode ? "#ffffff" : "#1a1a1a";
  sprite.strokeWidth = 1;
  sprite.strokeColor = darkMode ? "#000000" : "#ffffff";
  sprite.textHeight = 8;

  // Offset the label toward the camera each frame (sunflower effect).
  // 3d-force-graph sizes spheres as r = cbrt(nodeVal) * 4.
  const nodeVal = node["class_size"] ? node["class_size"] / 10 : 5;
  const nodeRadius = Math.cbrt(nodeVal) * 4 + 2;
  const obj = sprite as any;
  obj.onBeforeRender = (_renderer: any, _scene: any, camera: any) => {
    // node.x/y/z are updated in-place by the force simulation each tick.
    const dx = camera.position.x - (node.x || 0);
    const dy = camera.position.y - (node.y || 0);
    const dz = camera.position.z - (node.z || 0);
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    obj.position.set(
      (dx / len) * nodeRadius,
      (dy / len) * nodeRadius,
      (dz / len) * nodeRadius,
    );
  };

  return sprite;
}

interface ProcessedGraphData {
  nodes: Array<any>;
  links: Array<{ source: string; target: string }>;
}

function processGraphData(data: GraphData): ProcessedGraphData {
  if (!data?.nodes) return { nodes: [], links: [] };

  const validNodeIds = new Set(data.nodes.map((n) => String(n.id)));
  const levels: Record<number, any[]> = {};

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

    return {
      ...n,
      id: String(n.id),
      depth,
      x: (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
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

function focusNode(graph: any, node: any) {
  if (!node) return;

  const nodeX = Number.isFinite(node.x) ? node.x : 0;
  const nodeY = Number.isFinite(node.y) ? node.y : 0;
  const nodeZ = Number.isFinite(node.z) ? node.z : 0;

  const cam = graph.camera();
  console.log(cam);
  const q = cam.quaternion;

  const forwardX = 2 * (q.x * q.z + q.w * q.y);
  const forwardY = 2 * (q.y * q.z - q.w * q.x);
  const forwardZ = 1 - 2 * (q.x * q.x + q.y * q.y);

  const forwardLength = Math.hypot(forwardX, forwardY, forwardZ) || 1;
  const normalizedForward = {
    x: forwardX / forwardLength,
    y: forwardY / forwardLength,
    z: forwardZ / forwardLength,
  };

  const currentDistance = Math.hypot(
    cam.position.x - nodeX,
    cam.position.y - nodeY,
    cam.position.z - nodeZ,
  );
  const focusDistance = Math.min(240, currentDistance);

  const cameraTarget = {
    x: nodeX + normalizedForward.x * focusDistance,
    y: nodeY + normalizedForward.y * focusDistance,
    z: nodeZ + normalizedForward.z * focusDistance,
  };

  graph.cameraPosition(cameraTarget, node, 1200);
}

export default function GraphVis3D({
  graphData,
  loading,
  onNodeClickCallback,
}: {
  graphData: GraphData;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
  setMessageType: (messageType: "success" | "error" | "info") => void;
  onNodeClickCallback?: (node: GraphNode) => void;
}) {
  const graphFrame = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const onNodeClickRef = useRef(onNodeClickCallback);
  useEffect(() => {
    onNodeClickRef.current = onNodeClickCallback;
  }, [onNodeClickCallback]);

  const lastHoverNodeRef = useRef<string>("");

  const lastClickNodeRef = useRef<string>("");
  const lastClickTimeRef = useRef<number>(Date.now());
  const mouseDownXRef = useRef<number>(0);
  const mouseDownYRef = useRef<number>(0);

  const { directedGraph, findConnected } = useCreateDirectedGraph(
    graphData,
    true,
  );
  const highlightedNodesRef = useRef<Set<string>>(new Set());
  const highlightGraphRef = useRef<(origin: string) => void>(null);
  const hoverHighlightTimeRef = useRef<number>(Date.now());
  const isHoveringRef = useRef<boolean>(false);
  const isNodePinnedRef = useRef<boolean>(false);

  const highlightGraph = useCallback(
    (origin: string) => {
      const connected = findConnected(origin);
      highlightedNodesRef.current = connected;
      graphRef.current.nodeColor(graphRef.current.nodeColor());
      graphRef.current.linkColor(graphRef.current.linkColor());
    },
    [directedGraph, findConnected],
  );

  useEffect(() => {
    highlightGraphRef.current = highlightGraph;
  }, [highlightGraph]);

  const hoverHighlightGraph = useCallback((origin: string) => {
    if (isNodePinnedRef.current) {
      return;
    }
    const currTime = Date.now();
    const deltaTime = currTime - hoverHighlightTimeRef.current;
    if (deltaTime > 32) {
      hoverHighlightTimeRef.current = currTime;
      highlightGraphRef.current?.(origin);
    } else {
      setTimeout(() => {
        if (lastHoverNodeRef.current == origin) {
          highlightGraphRef.current?.(origin);
        }
      }, deltaTime + 1);
    }
  }, []);

  const handleFrameClick = useCallback(() => {
    if (isHoveringRef.current) {
      isNodePinnedRef.current = true;
    } else {
      isNodePinnedRef.current = false;
      highlightGraphRef.current?.("");
    }
  }, []);

  useEffect(() => {
    const applyThemeStyles = () => {
      if (graphRef.current) {
        graphRef.current.backgroundColor(getGraphBackgroundColor());
        graphRef.current.nodeThreeObject(createNodeLabelSprite);
        if (typeof graphRef.current.refresh === "function") {
          graphRef.current.refresh();
        }
      }
    };

    applyThemeStyles();

    const observer = new MutationObserver(() => {
      applyThemeStyles();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!graphFrame.current || !graphData?.nodes?.length) return;

    const processedData = processGraphData(graphData);
    if (!graphRef.current) {
      graphRef.current = new ForceGraph3D(graphFrame.current)
        .graphData(processedData)
        .nodeLabel((n: any) => `${n.label}: ${n.title}`)
        .nodeVal((node: any) =>
          node["class_size"] ? node["class_size"] / 10 : 5,
        )
        .nodeColor((n: any) =>
          highlightedNodesRef.current.has(n.id) ? "#ffdd63" : n.color,
        )
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(0.5)
        .nodeThreeObjectExtend(true)
        .nodeThreeObject(createNodeLabelSprite)
        .onNodeClick((node: any) => {
          const now = Date.now();
          if (
            now - lastClickTimeRef.current < 500 &&
            lastClickNodeRef.current == node.id
          ) {
            focusNode(graphRef.current, node);
          } else {
            lastClickNodeRef.current = node.id;
            highlightGraphRef.current?.(node.id);
          }
          lastClickTimeRef.current = now;
          if (onNodeClickRef.current) {
            onNodeClickRef.current(node as GraphNode);
          }
        })
        .onNodeHover((node: any) => {
          if (node) {
            isHoveringRef.current = true;
            lastHoverNodeRef.current = node.id;
            hoverHighlightGraph(node.id);
          } else {
            isHoveringRef.current = false;
            lastHoverNodeRef.current = "";
            hoverHighlightGraph("");
          }
        })
        .linkHoverPrecision(10)
        .linkColor((link: any) =>
          highlightedNodesRef.current.has(link.source.id) &&
          highlightedNodesRef.current.has(link.target.id)
            ? "#ffdd63"
            : "#999999",
        )
        .backgroundColor(getGraphBackgroundColor());

      graphRef.current.d3Force("charge").strength(-150);
      graphRef.current.d3Force("link").distance(100);
    } else {
      graphRef.current.graphData(processedData);
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  return (
    <>
      <div
        ref={graphFrame}
        id="graph"
        className="h-full w-full overflow-hidden"
        onMouseDown={(e) => {
          mouseDownXRef.current = e.clientX;
          mouseDownYRef.current = e.clientY;
        }}
        onMouseUp={(e) => {
          const diffX = Math.abs(e.clientX - mouseDownXRef.current);
          const diffY = Math.abs(e.clientY - mouseDownYRef.current);
          if (diffX > 5 || diffY > 5) {
            return;
          }
          handleFrameClick();
        }}
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
