import { useEffect, useState } from "react";
import type { GraphData, GraphNode } from "../types";
import GraphQuery from "../components/graph/GraphQuery";
import GraphVis3D from "../components/graph/GraphVis3D";
import GraphStatsPanel from "../components/graph/GraphStatsPanel";
import GraphInfoPanel from "../components/graph/GraphInfoPanel";
import MobileWarning from "../components/MobileWarning";
import Settings from "../components/graph/Settings";
import { useSearchParams } from "react-router-dom";

export default function Graph3D() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [_messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );

  const [searchParams] = useSearchParams();
  const [manualFetch, setManualFetch] = useState<string>("");
  const settings: React.ReactNode[] = [];

  useEffect(() => {
    if (searchParams.has("search")) {
      setManualFetch(searchParams.get("search") ?? "");
    }
  }, []);

  useEffect(() => {
    console.log("Graph data updated:", graphData);
  }, [graphData]);

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      <MobileWarning />

      <div className="h-full min-w-0 flex-1">
        <GraphVis3D
          graphData={graphData}
          loading={isLoading}
          setLoading={setIsLoading}
          setMessage={setMessage}
          setMessageType={setMessageType}
          onNodeClickCallback={setSelectedNode}
        />
      </div>

      <Settings settings={settings}></Settings>

      <GraphQuery
        data={graphData}
        setData={setGraphData}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setMessage={setMessage}
        setMessageType={setMessageType}
        manualFetch={manualFetch}
      />

      <GraphInfoPanel
        graphData={graphData}
        selectedNode={selectedNode}
        onNodeSelect={setSelectedNode}
      />
      <div className="fixed bottom-10 left-5 z-20 flex min-w-[20rem] flex-col gap-1">
        <div
          id="currQueryDisplay"
          className="text-text-query overflow-hidden text-[0.84rem] leading-[1.3] font-semibold text-ellipsis whitespace-nowrap"
        ></div>
        <div id="message" className="m-0 min-h-6 text-[0.84rem] font-medium">
          {message}
        </div>
      </div>

      <div className="fixed right-10 bottom-10 flex h-120 w-80">
        <GraphStatsPanel data={graphData}></GraphStatsPanel>
      </div>
    </div>
  );
}
