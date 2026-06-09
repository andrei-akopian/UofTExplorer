import { useEffect, useState } from "react";
import GraphQuery from "../components/graph/GraphQuery";
import type { GraphData } from "../types";
import GraphVis2D from "../components/graph/GraphVis2D";
import MobileWarning from "../components/MobileWarning";
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
  const [useShellLayout, setUseShellLayout] = useState(true);
  const [loading, setLoading] = useState(false);
  const [manualFetch, setManualFetch] = useState<string>("");

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

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
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MobileWarning />

      <div className="flex h-full w-full items-start">
        <div className="h-full min-w-0 flex-1">
          <GraphVis2D
            graphData={graphData}
            loading={loading}
            setLoading={setLoading}
            useShellLayout={useShellLayout}
          />
        </div>

        <details className="close-on-outclick absolute right-0 z-2 mt-3 mr-2 h-[4.7rem] w-[4.7rem] shrink-0 self-start bg-transparent">
          <summary className="m-0 flex h-full w-full list-none items-center justify-center p-0 [&::-webkit-details-marker]:hidden">
            <img src="/settings_gear.svg"></img>
          </summary>
          <div className="border-border-dropdown bg-panel-bg text-text-body shadow-dropdown absolute top-[calc(100%+6px)] right-0 left-auto z-1200 flex max-h-[20em] w-[20em] flex-col gap-1.5 overflow-y-auto rounded-md border p-2.5">
            <label className="flex max-h-none w-max min-w-[5em] items-center gap-2 overflow-visible font-sans text-sm">
              <input
                type="checkbox"
                checked={useShellLayout}
                onChange={(e) => setUseShellLayout(e.target.checked)}
              />
              <span>Use shell layout</span>
            </label>
          </div>
        </details>
      </div>

      <div className="fixed bottom-10 left-5 z-20 flex min-w-[20rem] flex-col gap-1">
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
    </div>
  );
}
