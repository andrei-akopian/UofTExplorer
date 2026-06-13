import { useEffect, useState } from "react";
import GraphQuery from "../components/graph/GraphQuery";
import type { GraphData, GraphNode } from "../types";
import GraphVis2D from "../components/graph/GraphVis2D";
import {
  GraphStatsPanel,
  GraphNodesPanel,
} from "../components/graph/GraphInfoPanel";
import GraphInfoMenu from "../components/graph/GraphInfoMenu";
import MobileWarning from "../components/MobileWarning";
import Settings from "../components/graph/Settings";
import { useSearchParams } from "react-router-dom";

export default function Graph2D() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );
  const [currentQuery] = useState<{
    type: string;
    code: string;
    name: string;
  }>({
    type: "",
    code: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [manualFetch, setManualFetch] = useState<string>("MAT332H1");
  const settings: React.ReactNode[] = [];

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const messageTypeClass =
    messageType === "success"
      ? "ml-7 text-sm font-sans text-(--color-success)"
      : messageType === "error"
        ? "ml-7 text-sm font-sans text-(--color-primary)"
        : "ml-7 text-sm font-sans text-(--color-primary-info)";

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("search")) {
      setManualFetch(searchParams.get("search") ?? "");
    }
  }, [searchParams]);

  const [nodesOpen, setNodesOpen] = useState(true);

  const handleNodeSelect = (node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) setNodesOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MobileWarning />

      <div className="flex h-full w-full items-start">
        <div className="h-full min-w-0 flex-1">
          <GraphVis2D
            graphData={graphData}
            loading={loading}
            setLoading={setLoading}
            onNodeClickCallback={handleNodeSelect}
          />
        </div>

        <Settings settings={settings}></Settings>
      </div>

      <div className="fixed right-3 bottom-3 left-3 z-20 flex min-w-0 flex-col gap-1 sm:right-auto sm:bottom-10 sm:left-5 sm:min-w-[20rem]">
        <div className="text-text-query overflow-hidden text-[0.84rem] leading-[1.3] font-semibold text-ellipsis whitespace-nowrap">
          {currentQuery.code &&
            `Currently displaying: ${currentQuery.code} - ${currentQuery.name}`}
        </div>
        <div
          id="message"
          className={`m-0 min-h-6 text-[0.84rem] font-medium ${messageTypeClass}`}
        >
          {message}
        </div>
      </div>

      <GraphQuery
        data={graphData}
        setData={setGraphData}
        isLoading={loading}
        setIsLoading={setLoading}
        setMessage={setMessage}
        setMessageType={setMessageType}
        manualFetch={manualFetch}
      />

      <GraphInfoMenu>
        <GraphStatsPanel graphData={graphData} />
        <GraphNodesPanel
          graphData={graphData}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
          isOpen={nodesOpen}
          onOpenChange={setNodesOpen}
        />
      </GraphInfoMenu>
    </div>
  );
}
