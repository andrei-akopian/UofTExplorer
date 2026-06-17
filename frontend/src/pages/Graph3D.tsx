import { useEffect, useState } from "react";
import type { GraphData, GraphNode } from "../types";
import GraphQuery from "../components/graph/GraphQuery";
import GraphVis3D from "../components/graph/GraphVis3D";
import MobileWarning from "../components/MobileWarning";
import GraphBottomInfo from "../components/graph/GraphBottomInfo";
import { useSearchParams } from "react-router-dom";
import HelpMenu from "../components/HelpMenu";
import { helpTemplateGraph3D } from "../components/HelpMenu";

export default function Graph3D() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );

  const [searchParams] = useSearchParams();
  const [manualFetch, setManualFetch] = useState<string>("MAT332H1");

  useEffect(() => {
    if (searchParams.has("search")) {
      setManualFetch(searchParams.get("search") ?? "");
    }
  }, [searchParams]);

  useEffect(() => {
    console.log("Graph data updated:", graphData);
  }, [graphData]);

  const [nodesOpen, setNodesOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);

  const handleNodeSelect = (node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) setNodesOpen(true);
  };

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <MobileWarning />

      <div className="relative z-50 flex justify-end px-2 pt-2 sm:hidden">
        <HelpMenu>{helpTemplateGraph3D}</HelpMenu>
      </div>

      <div className="h-full min-w-0 flex-1">
        <GraphVis3D
          graphData={graphData}
          loading={isLoading}
          setLoading={setIsLoading}
          setMessage={setMessage}
          setMessageType={setMessageType}
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
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setMessage={setMessage}
        setMessageType={setMessageType}
        manualFetch={manualFetch}
      />

      <div className="absolute top-4 right-4 z-40 hidden sm:block">
        <HelpMenu>{helpTemplateGraph3D}</HelpMenu>
      </div>
    </div>
  );
}
