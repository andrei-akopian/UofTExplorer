import { useEffect, useState } from "react";
import GraphQuery from "../components/graph/GraphQuery";
import type { GraphData, GraphNode } from "../types";
import GraphVis2D from "../components/graph/GraphVis2D";
import MobileWarning from "../components/MobileWarning";
import GraphBottomInfo from "../components/graph/GraphBottomInfo";
import { useSearchParams } from "react-router-dom";

export default function Graph2D() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );
  const [loading, setLoading] = useState(false);
  const [manualFetch, setManualFetch] = useState<string>("MAT332H1");

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("search")) {
      setManualFetch(searchParams.get("search") ?? "");
    }
  }, [searchParams]);

  const [nodesOpen, setNodesOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);

  const handleNodeSelect = (node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) setNodesOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MobileWarning />

      <div className="h-full min-w-0 flex-1">
        <GraphVis2D
          graphData={graphData}
          loading={loading}
          setLoading={setLoading}
          onNodeClickCallback={handleNodeSelect}
        />
      </div>

      <GraphBottomInfo
        message={message}
        messageType={messageType}
        graphData={graphData}
        selectedNode={selectedNode}
        onNodeSelect={handleNodeSelect}
        nodesOpen={nodesOpen}
        onNodesOpenChange={setNodesOpen}
        statsOpen={statsOpen}
        onStatsOpenChange={setStatsOpen}
      />

      <GraphQuery
        data={graphData}
        setData={setGraphData}
        isLoading={loading}
        setIsLoading={setLoading}
        setMessage={setMessage}
        setMessageType={setMessageType}
        manualFetch={manualFetch}
      />
    </div>
  );
}
