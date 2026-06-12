import { useEffect, useState } from "react";
import type { GraphData, GraphNode } from "../types";
import GraphQuery from "../components/graph/GraphQuery";
import GraphVis3D from "../components/graph/GraphVis3D";
import {
  GraphStatsPanel,
  GraphNodesPanel,
} from "../components/graph/GraphInfoPanel";
import GraphInfoMenu from "../components/graph/GraphInfoMenu";
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

      <GraphInfoMenu>
        <GraphStatsPanel graphData={graphData} />
        <GraphNodesPanel
          graphData={graphData}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />
      </GraphInfoMenu>
      <div className="fixed right-3 bottom-3 left-3 z-20 flex min-w-0 flex-col gap-1 sm:right-auto sm:bottom-10 sm:left-5 sm:min-w-[20rem]">
        <div
          id="currQueryDisplay"
          className="text-text-query overflow-hidden text-[0.84rem] leading-[1.3] font-semibold text-ellipsis whitespace-nowrap"
        ></div>
        <div id="message" className="m-0 min-h-6 text-[0.84rem] font-medium">
          {message}
        </div>
      </div>
    </div>
  );
}
