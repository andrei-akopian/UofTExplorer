import { useEffect, useState } from "react";
import type { GraphData } from "../types";
import GraphQuery from "../components/graph/GraphQuery";
import GraphVis3D from "../components/graph/GraphVis3D";
import Settings from "../components/graph/Settings";

export default function Graph3D() {
  const [settings, setSettings] = useState<React.ReactNode[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [_messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );
  const [useShellLayout, setUseShellLayout] = useState(true);

  useEffect(() => {
    console.log("Graph data updated:", graphData);
  }, [graphData]);

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      <div className="h-full min-w-0 flex-1">
        <GraphVis3D
          graphData={graphData}
          loading={isLoading}
          setLoading={setIsLoading}
          useShellLayout={useShellLayout}
          setMessage={setMessage}
          setMessageType={setMessageType}
          setSettings={setSettings}
        />
      </div>

      <Settings useShellLayout={useShellLayout} setUseShellLayout={setUseShellLayout} settings={settings}></Settings>

      <GraphQuery
        data={graphData}
        setData={setGraphData}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setMessage={setMessage}
        setMessageType={setMessageType}
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
    </div>
  );
}
