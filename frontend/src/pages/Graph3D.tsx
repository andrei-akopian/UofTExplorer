import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { GraphData } from "../types";
import GraphQuery from "../components/graph/GraphQuery";
import GraphVis3D from "../components/graph/GraphVis3D";

export default function Graph3D() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
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
        />
      </div>

      <details className="close-on-outclick absolute right-0 z-2 mt-3 mr-2 h-[4.7rem] w-[4.7rem] shrink-0 self-start bg-transparent">
        <summary className="m-0 flex h-full w-full list-none items-center justify-center p-0 [&::-webkit-details-marker]:hidden">
          <img src="/settings_gear.svg"></img>
        </summary>
        <div className="border-border-dropdown shadow-dropdown absolute top-[calc(100%+6px)] right-0 left-auto z-1200 flex max-h-[20em] w-[20em] flex-col gap-1.5 overflow-y-auto rounded-md border bg-white p-2.5">
          <label className="flex max-h-none w-max min-w-[5em] items-center gap-2 overflow-visible font-sans text-sm">
            <input
              type="checkbox"
              defaultChecked
              onChange={(e) => setUseShellLayout(e.target.checked)}
            />
            <span>Use shell layout</span>
          </label>
        </div>
      </details>

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
