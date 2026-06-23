import { useEffect, useRef, useState, useCallback } from "react";
import type { GraphData, GraphEdge, GraphNode, QueryInfo } from "../../types";
import { useCreateDirectedGraph } from "../../hooks/useGraph";
import {
  DataSet,
  Network,
} from "vis-network/standalone/esm/vis-network.min.js";
import { graphlib, layout } from "@dagrejs/dagre";
import LoadingOverlay from "../LoadingOverlay";

interface Node extends GraphNode {
  id: string;
  label: string;
  code?: string;
  depth?: number;
  x?: number;
  y?: number;
  targetRadius?: number;
  mass: number;
  color: string;
  font?: { size: number };
}

const convertGenericNode = (node: GraphNode): Node => {
  return {
    ...node,
    id: node.id,
    label: node.label,
    code: node.code,
    depth: node.depth,
    size: node.size,
    shape: node.shape ? node.shape : "circle",
    x: node.x,
    y: node.y,
    targetRadius: node.targetRadius,
    color: node.color,
    mass: 10,
    font: {
      size:
        20 + node["class_size"]
          ? Math.log(node["class_size"]) / Math.log(1.3)
          : 20,
    },
  };
};

interface Edge extends GraphEdge {
  from: string;
  to: string;
}

const convertGenericEdge = (edge: GraphEdge): Edge => {
  return {
    from: edge.from,
    to: edge.to,
  };
};

interface Graph2DData extends GraphData {
  nodes: Node[];
  edges: Edge[];
  search?: string;
  curr_query?: QueryInfo;
  should_open_course_panel?: boolean;
}

const convertGenericGraph = (data: GraphData): Graph2DData => {
  return {
    nodes: data.nodes.map(convertGenericNode),
    edges: data.edges.map(convertGenericEdge),
    search: data.search,
    curr_query: data.curr_query,
    should_open_course_panel: data.should_open_course_panel,
  };
};

const PHYSICS_DAMPING = 0.9;
const PHYSICS_SPRING_CONST = 0.02;
const PHYSICS_GRAV_CONSTANT = -4000;
const PHYSICS_SPRING_LENGTH = 50;

interface GraphVis2DProps {
  graphData: GraphData;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  onNodeClickCallback?: (node: GraphNode) => void;
  onEdgeClickCallback?: (edge: GraphEdge) => void;
}

export default function GraphVis2D({
  graphData,
  loading,
  setLoading,
  onNodeClickCallback,
}: GraphVis2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);

  const { directedGraph, findConnected } = useCreateDirectedGraph(
    graphData,
    true,
  );
  const visNodesRef = useRef<any>(null);
  const colorMapRef = useRef<Map<string, string>>(null);
  const previousColorPacketRef = useRef<any>(null);
  const isNodePinnedRef = useRef<boolean>(false);
  const hoverHighlightDebounce = useRef<number>(Date.now());

  const [_activeNodes, setActiveNodes] = useState<Node[]>([]);
  const activeNodesRef = useRef<Node[]>([]);
  const onNodeClickRef = useRef(onNodeClickCallback);
  const highlightGraphRef = useRef<(origin: string) => Set<string> | void>(
    () => new Set<string>(),
  );
  useEffect(() => {
    onNodeClickRef.current = onNodeClickCallback;
  }, [onNodeClickCallback]);

  const lastHoverNodeRef = useRef<string>("");

  const lastClickNodeRef = useRef<string>("");
  const lastClickTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const initNetwork = async () => {
      try {
        if (!containerRef.current) return;

        const options = {
          layout: { hierarchical: { enabled: false } },
          nodes: {
            shape: "circle",
            size: 26,
            font: { size: 14, face: "system-ui", color: "#000000" },
            borderWidth: 1,
            color: "#A0B9DB",
          },
          edges: {
            arrows: { to: { enabled: true, scaleFactor: 2 } },
            width: 2,
            smooth: {
              type: "cubicBezier",
              forceDirection: "horizontal",
              enabled: false,
              roundness: 0.4,
            },
          },
          physics: {
            enabled: false,
            solver: "barnesHut",
            barnesHut: {
              gravitationalConstant: PHYSICS_GRAV_CONSTANT,
              centralGravity: 0.2,
              springLength: PHYSICS_SPRING_LENGTH,
              springConstant: PHYSICS_SPRING_CONST,
              damping: PHYSICS_DAMPING,
              avoidOverlap: 0.8,
            },
            minVelocity: 5,
            maxVelocity: 140,
            timestep: 0.35,
            adaptiveTimestep: true,
            stabilization: { enabled: true, iterations: 150, fit: false },
          },
          interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true,
            selectable: true,
            hover: true,
          },
        };

        const network = new Network(
          containerRef.current,
          { nodes: [], edges: [] },
          options,
        );

        network.on("click", (params: any) => {
          if (params.nodes?.length > 0) {
            const nodeId = String(params.nodes[0]);
            const node = activeNodesRef.current.find(
              (n) => String(n.id) === nodeId,
            );

            if (node) {
              let now = Date.now();
              if (
                now - lastClickTimeRef.current < 500 &&
                lastClickNodeRef.current == nodeId
              ) {
                lastClickTimeRef.current = now;
                networkRef.current.fit({ nodes: [node.id], animation: true });
              } else {
                lastClickTimeRef.current = now;
                lastClickNodeRef.current = nodeId;
                isNodePinnedRef.current = true;
                highlightGraphRef.current?.(node.id);
              }
            }

            if (node && onNodeClickRef.current) {
              onNodeClickRef.current(node);
            }
          } else {
            isNodePinnedRef.current = false;
            highlightGraphRef.current?.("");
            lastClickTimeRef.current = Date.now();
            lastClickNodeRef.current = "";
          }
        });

        network.on("hoverNode", (params: any) => {
          lastHoverNodeRef.current = params.node.id;
          if (!isNodePinnedRef.current) {
            hoverHighlightGraph(params.node);
          }
        });

        network.on("blurNode", (_params: any) => {
          lastHoverNodeRef.current = "";
          if (!isNodePinnedRef.current) {
            hoverHighlightGraph("");
          }
        });

        networkRef.current = network;
      } catch (err) {
        console.error("Failed to initialize network:", err);
      }
    };

    initNetwork();
    console.log("GraphVis2D mounted");
  }, []);

  const prepareData = (nodes: Node[], edges: Edge[]): Graph2DData => {
    if (!nodes.length) return { nodes: [], edges };

    const levels: Record<number, Node[]> = {};
    const MIN_RADIUS_STEP = 300;
    const NODE_GIRTH = 120;

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

    let sumX = 0;
    let sumY = 0;

    const processedNodes = nodes.map((n) => {
      const depth =
        n.depth !== null && n.depth !== undefined
          ? parseInt(String(n.depth))
          : undefined;
      const processedNode = { ...n, depth };

      if (typeof processedNode.x === "undefined") {
        processedNode.x = (Math.random() - 0.5) * 200;
        processedNode.y = (Math.random() - 0.5) * 200;
        processedNode.targetRadius = undefined;
      }

      sumX += processedNode.x || 0;
      sumY += processedNode.y || 0;

      return processedNode;
    });

    console.log("pnodes", processedNodes);
    return {
      nodes: processedNodes,
      edges,
      avgX: sumX / (nodes.length || 1),
      avgY: sumY / (nodes.length || 1),
    };
  };

  /* Graph Updating */
  useEffect(() => {
    // initial node positioning using dagre.js
    const g: graphlib.Graph = new graphlib.Graph();
    g.setGraph({ nodesep: 150, edgesep: 100, ranksep: 200, rankdir: "BT" });
    g.setDefaultEdgeLabel(function () {
      return {};
    });
    for (const node of graphData.nodes) {
      g.setNode(node.id, node);
    }
    for (const edge of graphData.edges) {
      g.setEdge(edge.from, edge.to);
    }
    layout(g);
    // visualize using nodejs
    const data2D = convertGenericGraph(graphData);
    const prepared = prepareData(data2D.nodes, data2D.edges);
    setActiveNodes(prepared.nodes);
    activeNodesRef.current = prepared.nodes;

    visNodesRef.current = new DataSet(prepared.nodes);

    colorMapRef.current = new Map();
    for (const node of prepared.nodes) {
      colorMapRef.current.set(node.id, node.color);
    }

    if (networkRef.current) {
      networkRef.current.setData({
        nodes: visNodesRef.current,
        edges: prepared.edges,
      });
      networkRef.current.startSimulation();
    }

    setLoading && setLoading(false);
  }, [graphData]);

  const hightlightGraph = useCallback(
    (origin: string) => {
      if (previousColorPacketRef.current) {
        if (visNodesRef.current) {
          visNodesRef.current.update(previousColorPacketRef.current);
        }
      }

      const connected = findConnected(origin);

      previousColorPacketRef.current = [];
      const updatePacket: any[] = [];
      for (const item of connected) {
        updatePacket.push({ id: item, color: "#ffdd63" });
        previousColorPacketRef.current.push({
          id: item,
          color: colorMapRef.current?.get(item),
        });
      }

      if (visNodesRef.current) {
        visNodesRef.current.update(updatePacket);
        //networkRef.current?.redraw();
      }

      return connected;
    },
    [directedGraph, findConnected],
  );

  useEffect(() => {
    highlightGraphRef.current = hightlightGraph;
  }, [hightlightGraph]);

  const hoverHighlightGraph = useCallback((origin: string) => {
    const currTime = Date.now();
    const deltaTime = currTime - hoverHighlightDebounce.current;
    if (deltaTime > 32) {
      hoverHighlightDebounce.current = currTime;
      highlightGraphRef.current(origin);
    } else {
      setTimeout(() => {
        if (lastHoverNodeRef.current == origin) {
          highlightGraphRef.current(origin);
        }
      }, deltaTime + 1);
    }
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        id="mynetwork"
        className="relative h-full w-full overflow-hidden"
      ></div>
      <LoadingOverlay visible={Boolean(loading)} />
    </>
  );
}
