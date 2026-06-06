import { useState } from "react";
import GraphQuery from "../components/graph/GraphQuery";
import type { GraphData } from "../types";
import GraphVis2D from "../components/graph/GraphVis2D";
import Settings, { Slider } from "../components/graph/Settings";

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
  const [useShellLayout, setUseShellLayout] = useState(true);
  const [loading, setLoading] = useState(false);

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  // Settings
  const [size, setSize] = useState(26);
  const config = {
    "size": size,
    "useShellLayout": useShellLayout
  };
  const settings = [
    <Slider title="Size" size={size} setSize={setSize}/>
  ];

  const messageTypeClass =
    messageType === "success"
      ? "ml-7 text-sm font-sans text-(--color-success)"
      : messageType === "error"
        ? "ml-7 text-sm font-sans text-(--color-primary)"
        : "ml-7 text-sm font-sans text-(--color-primary-info)";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="flex h-full w-full items-start">
        <div className="h-full min-w-0 flex-1">
          <GraphVis2D
            graphData={graphData}
            setLoading={setLoading}
            config={config}
          />
        </div>
        <Settings useShellLayout={useShellLayout} setUseShellLayout={setUseShellLayout} settings={settings}></Settings>
      </div>

      <div className="fixed bottom-10 left-5 z-20 flex min-w-[20rem] flex-col gap-1">
        <div className="overflow-hidden text-[0.84rem] leading-[1.3] font-semibold text-ellipsis whitespace-nowrap text-(--color-text-query)">
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
      />
    </div>
  );
}
