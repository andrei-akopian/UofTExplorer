import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import GraphQuery from "../components/graph/GraphQuery";

import type { GraphNode, GraphEdge, GraphData } from "../types";
import { fetchGraphData } from "../lib/api";
import GraphVis2D from "../components/graph/GraphVis2D";

export default function Graph2D() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info",
  );
  const [query, setQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState<{
    type: string;
    code: string;
    name: string;
  }>({
    type: "",
    code: "",
    name: "",
  });
  const [useShellLayout, setUseShellLayout] = useState(true);
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; label: string; code?: string }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [breadthCategories, setBreadthCategories] = useState<string[]>([]);
  const [activeNodes, setActiveNodes] = useState<Node[]>([]);

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const messageTypeClass =
    messageType === "success"
      ? "ml-7 text-sm font-sans text-[#2e7d32]"
      : messageType === "error"
        ? "ml-7 text-sm font-sans text-[#6969d6]"
        : "ml-7 text-sm font-sans text-[#0066cc]";

  useEffect(() => {
    if (loading) {
      setMessage("Loading graph...");
      setMessageType("info");
    } else {
      setMessage("LOADED");
      setMessageType("success");
    }
  }, [loading]);

  return (
    <div className="relative h-screen w-screen">
      <GraphVis2D
        graphData={graphData}
        loading={loading}
        setLoading={setLoading}
        useShellLayout={useShellLayout}
      />

      <details className="close-on-outclick absolute top-0 right-0 z-2 h-[4.7rem] w-[4.7rem] bg-transparent">
        <summary className="m-0 flex h-full w-full list-none items-center justify-center p-0 [&::-webkit-details-marker]:hidden">
          <svg
            width="2.5rem"
            height="2.5rem"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              id="out"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <path
                d="M18.1125649,13.0304195 C18.1454626,12.7672379 18.1701359,12.5040563 18.1701359,12.2244258 C18.1701359,11.9447953 18.1454626,11.6816137 18.1125649,11.4184321 L19.8479188,10.0614018 C20.0041828,9.93803541 20.045305,9.71597592 19.9466119,9.53503855 L18.3017267,6.68938723 C18.2030336,6.50844986 17.9809741,6.44265446 17.8000367,6.50844986 L15.7521547,7.33089244 C15.3244846,7.00191541 14.8639167,6.73050936 14.3622268,6.52489871 L14.0496986,4.34542588 C14.0250253,4.14803966 13.8523124,4 13.6467017,4 L10.3569314,4 C10.1513208,4 9.97860782,4.14803966 9.95393455,4.34542588 L9.64140637,6.52489871 C9.13971639,6.73050936 8.67914855,7.01013984 8.25147841,7.33089244 L6.20359639,6.50844986 C6.0144346,6.43443003 5.80059953,6.50844986 5.70190642,6.68938723 L4.05702126,9.53503855 C3.95010373,9.71597592 3.99945028,9.93803541 4.15571437,10.0614018 L5.89106821,11.4184321 C5.85817051,11.6816137 5.83349723,11.9530197 5.83349723,12.2244258 C5.83349723,12.4958318 5.85817051,12.7672379 5.89106821,13.0304195 L4.15571437,14.3874498 C3.99945028,14.5108161 3.95832815,14.7328756 4.05702126,14.913813 L5.70190642,17.7594643 C5.80059953,17.9404017 6.02265902,18.0061971 6.20359639,17.9404017 L8.25147841,17.1179591 C8.67914855,17.4469361 9.13971639,17.7183422 9.64140637,17.9239528 L9.95393455,20.1034257 C9.97860782,20.3008119 10.1513208,20.4488516 10.3569314,20.4488516 L13.6467017,20.4488516 C13.8523124,20.4488516 14.0250253,20.3008119 14.0496986,20.1034257 L14.3622268,17.9239528 C14.8639167,17.7183422 15.3244846,17.4387117 15.7521547,17.1179591 L17.8000367,17.9404017 C17.9891985,18.0144215 18.2030336,17.9404017 18.3017267,17.7594643 L19.9466119,14.913813 C20.045305,14.7328756 20.0041828,14.5108161 19.8479188,14.3874498 L18.1125649,13.0304195 Z M12.0018166,15.1029748 C10.4145024,15.1029748 9.12326754,13.81174 9.12326754,12.2244258 C9.12326754,10.6371116 10.4145024,9.34587676 12.0018166,9.34587676 C13.5891307,9.34587676 14.8803656,10.6371116 14.8803656,12.2244258 C14.8803656,13.81174 13.5891307,15.1029748 12.0018166,15.1029748 Z"
                fill="#000000"
              />
            </g>
          </svg>
        </summary>
        <div className="absolute top-[calc(100%+6px)] right-0 left-auto z-1200 flex max-h-[20em] w-[20em] flex-col gap-1.5 overflow-y-scroll rounded-md border border-[#ccc] bg-white p-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.16)]">
          <label className="flex max-h-none w-max min-w-[5em] items-center gap-2 overflow-visible text-sm">
            <input
              type="checkbox"
              checked={useShellLayout}
              onChange={(e) => setUseShellLayout(e.target.checked)}
            />
            <span>Use shell layout</span>
          </label>
        </div>
      </details>

      <div className="absolute bottom-10 left-5 flex min-w-[20rem] flex-col gap-1">
        <div className="overflow-hidden text-[0.84rem] leading-[1.3] font-semibold text-ellipsis whitespace-nowrap text-[#24324a]">
          {currentQuery.code &&
            `Currently displaying: ${currentQuery.code} — ${currentQuery.name}`}
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
      />
    </div>
  );
}
