import { useEffect, useRef, useState } from "react";
import type { GraphData, GraphEdge, GraphNode, QueryInfo } from "../../types";

interface Node extends GraphNode {
  id: string;
  label: string;
  code?: string;
  depth?: number;
  x?: number;
  y?: number;
  targetRadius?: number;
  size: number;
  color: string;
  font?: { size: number };
}

const convertGenericNode = (node: GraphNode): Node => {
  return {
    id: node.id,
    label: node.label,
    code: node.code,
    depth: node.depth,
    x: node.x,
    y: node.y,
    targetRadius: node.targetRadius,
    size: node.size,
    color: node.color,
    font: node.font,
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

const PHYSICS_DAMPING = 0.4;
const PHYSICS_SPRING_CONST = 0.1;
const PHYSICS_GRAV_CONSTANT = -4000;
const PHYSICS_SPRING_LENGTH = 300;

interface GraphVis2DProps {
  graphData: GraphData;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  onNodeClickCallback?: (node: GraphNode) => void;
  onEdgeClickCallback?: (edge: GraphEdge) => void;
  useShellLayout?: boolean;
}

export default function GraphVis2D({
  graphData,
  setLoading,
  useShellLayout,
}: GraphVis2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [_activeNodes, setActiveNodes] = useState<Node[]>([]);

  useEffect(() => {
    const initNetwork = async () => {
      try {
        const { Network } =
          await import("vis-network/standalone/esm/vis-network.min.js");

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
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            width: 2,
            smooth: {
              type: "cubicBezier",
              forceDirection: "horizontal",
              enabled: false,
              roundness: 0.4,
            },
          },
          physics: {
            enabled: true,
            solver: "barnesHut",
            barnesHut: {
              gravitationalConstant: PHYSICS_GRAV_CONSTANT,
              centralGravity: 0.05,
              springLength: PHYSICS_SPRING_LENGTH,
              springConstant: PHYSICS_SPRING_CONST,
              damping: PHYSICS_DAMPING,
              avoidOverlap: 0.8,
            },
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

    if (useShellLayout) {
      nodes.forEach((n) => {
        const depth =
          n.depth !== null && n.depth !== undefined
            ? parseInt(String(n.depth))
            : null;
        if (depth !== null) {
          if (!levels[depth]) levels[depth] = [];
          levels[depth].push(n);
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

    let sumX = 0;
    let sumY = 0;

    const processedNodes = nodes.map((n) => {
      const depth =
        n.depth !== null && n.depth !== undefined
          ? parseInt(String(n.depth))
          : undefined;
      const processedNode = { ...n, depth };

      if (useShellLayout && depth !== undefined && levelRadii[depth]) {
        const radius = levelRadii[depth];
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 2;
        processedNode.x = Math.cos(angle) * radius;
        processedNode.y = Math.sin(angle) * radius;
        processedNode.targetRadius = radius;
      } else {
        processedNode.x = (Math.random() - 0.5) * 200;
        processedNode.y = (Math.random() - 0.5) * 200;
        processedNode.targetRadius = undefined;
      }

      sumX += processedNode.x || 0;
      sumY += processedNode.y || 0;

      return processedNode;
    });

    return {
      nodes: processedNodes,
      edges,
      avgX: sumX / (nodes.length || 1),
      avgY: sumY / (nodes.length || 1),
    };
  };

  /* Graph Updating */
  useEffect(() => {
    console.log("Graph data updated:", graphData);
    const data2D = convertGenericGraph(graphData);
    const prepared = prepareData(data2D.nodes, data2D.edges);
    setActiveNodes(prepared.nodes);

    if (networkRef.current) {
      networkRef.current.setData({
        nodes: prepared.nodes,
        edges: prepared.edges,
      });
      networkRef.current.startSimulation();
    }

    setLoading && setLoading(false);
  }, [graphData]);

  return (
    <div
      ref={containerRef}
      id="mynetwork"
      className="relative h-full w-full overflow-hidden"
    ></div>
  );
}
