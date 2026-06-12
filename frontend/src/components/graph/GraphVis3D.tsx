import SpriteText from "three-spritetext";
import ForceGraph3D from "3d-force-graph";
import type { GraphData, GraphNode } from "../../types";
import { useRef, useEffect } from "react";

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
        .linkDirectionalArrowLength(4)
        .linkDirectionalArrowRelPos(0.5)
        .nodeThreeObjectExtend(true)
        .nodeThreeObject(createNodeLabelSprite)
        .onNodeClick((node: any) => {
          focusNode(graphRef.current, node);
          if (onNodeClickRef.current) {
            onNodeClickRef.current(node as GraphNode);
          }
        })
        .linkHoverPrecision(10)
        .linkColor(() => "#999999")
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
