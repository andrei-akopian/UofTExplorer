import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData } from "../types";
import CourseSearchBar from "../components/search/CourseSearchBar";
import GraphVis2D from "../components/graph/GraphVis2D";
import MobileWarning from "../components/MobileWarning";
import {
  useImmediatePostreqs,
  usePathFinderSolution,
  useLocalStorage,
} from "../hooks/useGraph";
import HelpMenu, { helpTemplatePathExplorer } from "../components/HelpMenu";

interface HistoryPacket {
  desired: string[];
  completed: string[];
  avoided: string[];
  solution: string[];
  tool: string;
  timestamp: number;
}

const MaxHistoryCount = 10;

export default function PathExplorer() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [avoidedCourses, setAvoidedCourses] = useState<string[]>([]);
  const [desiredCourses, setDesiredCourses] = useState<string[]>([]);
  const [solutionDisplay, setSolutionDisplay] = useState<string[]>([]);
  const [placeholderText, setPlaceholderText] = useState<string>("");
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [isResultBarOpen, setIsResultBarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [lastTool, setLastTool] = useState<string>("");
  const [resultVisibility, setResultVisibility] = useState<string>("all");
  const isHistoryLoadFetchRef = useRef<boolean>(false);
  const [historyLoadFetchTrigger, setHistoryLoadFetchTrigger] = useState<any[]>(
    [false, ""],
  );

  const { data: graphDataPostreqs, fetch: fetchImmediatePostreqs } =
    useImmediatePostreqs();

  const {
    data: graphDataPathfind,
    fetch: fetchPathfindSolution,
    error: pathfindError,
  } = usePathFinderSolution();

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const { value: historyList, set: setHistoryList } = useLocalStorage<
    HistoryPacket[]
  >("PathExplorerHistory", []);

  useEffect(() => {
    console.log(historyList);
  }, [historyList]);

  const updateHistory = useCallback(
    (newPacket: HistoryPacket) => {
      const newList = historyList.slice(0, MaxHistoryCount - 1);
      newList.unshift(newPacket);
      setHistoryList(newList);
    },
    [historyList],
  );

  const captureHistory = useCallback((): HistoryPacket => {
    return {
      completed: completedCourses,
      desired: desiredCourses,
      avoided: avoidedCourses,
      solution: solutionDisplay,
      tool: lastTool,
      timestamp: Date.now(),
    };
  }, [
    completedCourses,
    avoidedCourses,
    desiredCourses,
    solutionDisplay,
    lastTool,
  ]);

  useEffect(() => {
    if (completedCourses.length == 0 && desiredCourses.length == 0) {
      return;
    }
    if (!isHistoryLoadFetchRef.current) {
      updateHistory(captureHistory());
    } else {
      isHistoryLoadFetchRef.current = false;
    }
  }, [graphData]);

  const loadHistory = useCallback((packet: HistoryPacket) => {
    setCompletedCourses(packet.completed);
    setDesiredCourses(packet.desired);
    setAvoidedCourses(packet.avoided);
    isHistoryLoadFetchRef.current = true;
    setHistoryLoadFetchTrigger([!historyLoadFetchTrigger[0], packet.tool]);
  }, []);

  useEffect(() => {
    switch (historyLoadFetchTrigger[1]) {
      case "pathfind": {
        handleRunPathFinder();
        return;
      }
      case "postreqs": {
        handleGetImmediatePostreqs();
        return;
      }
      default: {
        isHistoryLoadFetchRef.current = false;
        return;
      }
    }
  }, [historyLoadFetchTrigger]);

  const exportHistory = useCallback((packets: HistoryPacket[]) => {
    const stringed = JSON.stringify(packets);
    const blob = new Blob([stringed], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const blobLink = document.createElement("a");
    blobLink.href = url;
    blobLink.download =
      packets.length == 1
        ? "pathexplorer-snapshot.json"
        : "pathexplorer-history.json";

    document.body.appendChild(blobLink);
    blobLink.click();
    document.body.removeChild(blobLink);
    URL.revokeObjectURL(url);
  }, []);

  const importHistory = useCallback(
    async (file: File) => {
      try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText) as HistoryPacket[] | HistoryPacket;

        const packets = Array.isArray(parsed) ? parsed : [parsed];

        const isValidHistoryPacket = (value: unknown): value is HistoryPacket =>
          typeof value === "object" &&
          value !== null &&
          Array.isArray((value as HistoryPacket).completed) &&
          Array.isArray((value as HistoryPacket).desired) &&
          Array.isArray((value as HistoryPacket).avoided) &&
          Array.isArray((value as HistoryPacket).solution) &&
          typeof (value as HistoryPacket).tool === "string";

        if (!packets.every(isValidHistoryPacket)) {
          window.alert(
            "The selected file is not a valid HistoryPacket[] JSON export.",
          );
          return;
        }

        const existing = Array.isArray(historyList) ? historyList : [];
        const merged = [...packets, ...existing].slice(0, MaxHistoryCount);

        setHistoryList(merged);
      } catch (error) {
        console.error("Failed to import history:", error);
        window.alert(
          "Could not import history. Please choose a valid JSON file.",
        );
      }
    },
    [historyList, setHistoryList],
  );

  const historyCard = useCallback((packet: HistoryPacket) => {
    const formatList = (values: string[]) =>
      values.length > 0 ? values.join(", ") : "None";

    return (
      <details
        className="hover:bg-surface-1 border-border-card bg-panel-bg shadow-card mt-0.5 mb-1.5 rounded-lg border p-2 hover:shadow-sm"
        onClick={(e) => {
          const details = e.currentTarget as HTMLDetailsElement;
          const summary = details.querySelector("summary");
          const clickTarget = e.target as HTMLElement;

          // If click is on summary or inside summary, allow default toggle behavior
          if (summary && summary.contains(clickTarget)) {
            return;
          }

          // If open and click is inside content, close it
          if (details.open) {
            details.removeAttribute("open");
          }
        }}
      >
        <summary className="cursor-pointer list-none rounded-md transition-colors duration-150">
          <span className="flex items-start justify-between gap-2">
            <span className="text-text-body min-w-0 flex-1">
              <span className="text-sm font-semibold">{`Result`}</span>
              <span className="text-text-subtle mx-2 font-mono text-xs">
                {packet.timestamp
                  ? new Date(packet.timestamp).toLocaleTimeString()
                  : "Unknown Date"}
              </span>
              <span className="block text-xs leading-snug">
                {packet.tool == "postreqs" ? "Find next courses" : "Find path"}
              </span>
            </span>
            <button
              type="button"
              className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 cursor-pointer rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
              onClick={() => loadHistory(packet)}
            >
              Load
            </button>
            <button
              type="button"
              className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 cursor-pointer rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
              onClick={() => exportHistory([packet])}
            >
              Export
            </button>

            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="m2 4 4 4 4-4" stroke="currentColor" />
            </svg>
          </span>
        </summary>
        <div className="flex cursor-pointer flex-col gap-3 overflow-y-auto pt-4 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted font-semibold tracking-wide uppercase">
              Courses to Target
            </span>
            <span className="text-text-body font-mono wrap-break-word whitespace-normal">
              {formatList(packet.solution)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted font-semibold tracking-wide uppercase">
              Completed Courses
            </span>
            <span className="text-text-body font-mono wrap-break-word whitespace-normal">
              {formatList(packet.completed)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted font-semibold tracking-wide uppercase">
              Desired Courses
            </span>
            <span className="text-text-body font-mono wrap-break-word whitespace-normal">
              {formatList(packet.desired)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted font-semibold tracking-wide uppercase">
              Avoided Courses
            </span>
            <span className="text-text-body font-mono wrap-break-word whitespace-normal">
              {formatList(packet.avoided)}
            </span>
          </div>
        </div>
      </details>
    );
  }, []);

  const courseCard = useCallback(
    (code: string, dataDict: Map<string, any>, highlight: boolean) => {
      return (
        <details
          className={
            highlight
              ? "border-border-card shadow-card hover:bg-green-bg-hover bg-green-bg rounded-lg border p-2 hover:shadow-sm"
              : "border-border-card hover:bg-surface-1 bg-panel-bg shadow-card rounded-lg border p-2 hover:shadow-sm"
          }
          onClick={(e) => {
            const details = e.currentTarget as HTMLDetailsElement;
            const summary = details.querySelector("summary");
            const clickTarget = e.target as HTMLElement;

            // If click is on summary or inside summary, allow default toggle behavior
            if (summary && summary.contains(clickTarget)) {
              return;
            }

            // If open and click is inside content, close it
            if (details.open) {
              details.removeAttribute("open");
            }
          }}
        >
          <summary
            className={
              highlight
                ? "list-none rounded-md transition-colors duration-150"
                : "cursor-pointer list-none rounded-md transition-colors duration-150"
            }
          >
            <span className="flex items-start justify-between gap-3">
              <span
                className={
                  highlight
                    ? "text-text-body min-w-0 flex-1"
                    : "text-text-muted min-w-0 flex-1"
                }
              >
                <span className="block font-mono text-sm font-semibold">
                  {code}
                </span>
                <span className="block text-xs leading-snug wrap-break-word whitespace-normal">
                  {dataDict.get(code).title}
                </span>
              </span>

              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="m2 4 4 4 4-4" stroke="currentColor" />
              </svg>
            </span>
          </summary>
          <div className="flex flex-col gap-3 overflow-y-auto pt-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted font-semibold tracking-wide uppercase">
                Description
              </span>
              <span className="text-text-body wrap-break-word whitespace-normal">
                {dataDict.get(code).description}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted font-semibold tracking-wide uppercase">
                Prerequisites
              </span>
              <span className="text-text-body font-mono wrap-break-word whitespace-normal">
                {dataDict.get(code).prerequisites}
              </span>
            </div>
            {dataDict.get(code).corequisites && (
              <div className="flex flex-col gap-0.5">
                <span className="text-text-muted font-semibold tracking-wide uppercase">
                  Corequisites
                </span>
                <span className="text-text-body font-mono wrap-break-word whitespace-normal">
                  {dataDict.get(code).corequisites}
                </span>
              </div>
            )}
            {dataDict.get(code).exclusions && (
              <div className="flex flex-col gap-0.5">
                <span className="text-text-muted font-semibold tracking-wide uppercase">
                  Exclusions
                </span>
                <span className="text-text-body font-mono wrap-break-word whitespace-normal">
                  {dataDict.get(code).exclusions}
                </span>
              </div>
            )}
          </div>
        </details>
      );
    },
    [],
  );

  const resultsDisplay = useMemo(() => {
    const dataDict = new Map();
    const topList = [];
    const bottomList = [];
    for (const node of graphData.nodes) {
      if (node.label == "AND" || node.label == "OR") {
        continue;
      }
      dataDict.set(node.id, node);
      if (solutionDisplay.find((v) => v == node.id)) {
        topList.push(node.id);
      } else {
        bottomList.push(node.id);
      }
    }
    topList.sort();
    bottomList.sort();
    return (
      <>
        {resultVisibility == "all" || resultVisibility == "target" ? (
          topList.map((code) => courseCard(code, dataDict, true))
        ) : (
          <></>
        )}
        {resultVisibility == "all" &&
        topList.length > 0 &&
        bottomList.length > 0 ? (
          <hr></hr>
        ) : (
          <></>
        )}
        {resultVisibility == "all" || resultVisibility == "side" ? (
          bottomList.map((code) => courseCard(code, dataDict, false))
        ) : (
          <></>
        )}
      </>
    );
  }, [graphData, resultVisibility]);

  const handleGetImmediatePostreqs = async () => {
    console.log("Completed courses:", completedCourses);
    try {
      await fetchImmediatePostreqs(completedCourses);
    } catch (err) {
      console.error("Error fetching immediate postreqs:", err);
    }
  };

  useEffect(() => {
    setLastTool("postreqs");
    if (graphDataPostreqs) {
      setGraphData(graphDataPostreqs);

      console.log(
        "Immediate postreqs graph data in PathExplorer.tsx:",
        graphDataPostreqs,
      );

      if (graphDataPostreqs.solution_display) {
        const filtered = Object.keys(graphDataPostreqs.solution_display).filter(
          (ele: string) =>
            !(completedCourses.includes(ele) || desiredCourses.includes(ele)),
        );
        setSolutionDisplay(filtered);
        console.log("filtered: ", filtered);
        if (filtered.length == 0) {
          setPlaceholderText(
            "There are no courses which are immediately unlocked by your completed courses.",
          );
        } else {
          setPlaceholderText("");
        }
      }
    }
  }, [graphDataPostreqs]);

  const handleRunPathFinder = async () => {
    try {
      await fetchPathfindSolution({
        completed: completedCourses,
        avoided: avoidedCourses,
        desired: desiredCourses,
      });
    } catch (err) {
      console.error("Error running path finder:", err);
    }
  };

  useEffect(() => {
    setLastTool("pathfind");
    if (graphDataPathfind) {
      setPlaceholderText("");
      setGraphData(graphDataPathfind?.graph_data);
      console.log(
        "Path finder solution graph data in PathExplorer.tsx:",
        graphDataPathfind,
      );
      if (graphDataPathfind.solution) {
        const filtered = graphDataPathfind.solution.filter(
          (ele: string) =>
            !(completedCourses.includes(ele) || desiredCourses.includes(ele)),
        );
        setSolutionDisplay(filtered);
      }
    }
  }, [graphDataPathfind]);

  useEffect(() => {
    if (pathfindError !== null) {
      setPlaceholderText("No path found.");
    }
  }, [[pathfindError]]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden font-sans lg:flex-1 lg:flex-row">
      <MobileWarning />

      {/* Mobile top bar - Results toggle*/}
      <div className="border-border-panel bg-panel-bg z-40 flex shrink-0 items-center justify-between border-b px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setIsResultBarOpen((prev) => !prev)}
          className="text-text-body flex items-center gap-1 text-xs font-semibold"
        >
          {isResultBarOpen ? "Hide Results " : "Show Results"}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="m2 4 4 4 4-4" stroke="currentColor" />
          </svg>
        </button>
        <HelpMenu>{helpTemplatePathExplorer}</HelpMenu>
      </div>

      <div id="vis graph" className="relative min-h-0 w-full flex-1 lg:h-full">
        <GraphVis2D graphData={graphData} />
        <div inert className="absolute top-0 left-0 h-full w-full">
          <div className="text-error absolute top-20 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 p-5 text-center text-xl sm:text-2xl lg:left-10 lg:translate-x-0 lg:text-left lg:text-4xl">
            {placeholderText}
          </div>
        </div>
      </div>

      {/* Result + History panel */}
      <div
        id="resultBar"
        className={`border-border-panel bg-surface-1 z-30 flex w-full shrink-0 flex-col overflow-hidden border-b shadow-sm transition-[height] duration-200 lg:order-first lg:h-full lg:w-96 lg:border-t-0 lg:border-r lg:transition-none ${isResultBarOpen ? "h-[45vh]" : "h-0"} absolute top-10.25 right-0 left-0 lg:relative lg:top-auto lg:h-full`}
      >
        <section className="border-border-panel flex min-h-0 flex-[0_0_62%] flex-col overflow-hidden border-b">
          <header className="border-border-panel text-text-body flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 text-sm font-semibold">
            <span>Result</span>
            <div className="text-text-secondary flex items-center gap-2 text-xs font-medium">
              <span>Show</span>
              <details className="group close-on-outclick relative">
                <summary className="border-input-border bg-panel-bg text-text-body flex cursor-pointer list-none items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-sm select-none [&::-webkit-details-marker]:hidden">
                  {resultVisibility === "all"
                    ? "All"
                    : resultVisibility === "target"
                      ? "Target Courses"
                      : "Other Courses"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="m2 4 4 4 4-4" stroke="currentColor" />
                  </svg>
                </summary>
                <div className="border-border-dropdown bg-surface-1 text-text-body shadow-dropdown absolute top-[calc(100%+6px)] right-0 z-50 flex min-w-40 flex-col rounded-md border p-1.5">
                  <button
                    type="button"
                    className="hover:bg-surface-2 cursor-pointer rounded px-2 py-1 text-left text-sm"
                    onClick={(e) => {
                      setResultVisibility("all");
                      (
                        e.currentTarget.closest(
                          "details",
                        ) as HTMLDetailsElement | null
                      )?.removeAttribute("open");
                    }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="hover:bg-surface-2 cursor-pointer rounded px-2 py-1 text-left text-sm"
                    onClick={(e) => {
                      setResultVisibility("target");
                      (
                        e.currentTarget.closest(
                          "details",
                        ) as HTMLDetailsElement | null
                      )?.removeAttribute("open");
                    }}
                  >
                    Target Courses
                  </button>
                  <button
                    type="button"
                    className="hover:bg-surface-2 cursor-pointer rounded px-2 py-1 text-left text-sm"
                    onClick={(e) => {
                      setResultVisibility("side");
                      (
                        e.currentTarget.closest(
                          "details",
                        ) as HTMLDetailsElement | null
                      )?.removeAttribute("open");
                    }}
                  >
                    Other Courses
                  </button>
                </div>
              </details>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="text-text-body flex flex-col gap-2 text-[0.84rem] font-medium">
              {resultsDisplay}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-[0_0_38%] flex-col overflow-hidden">
          <header className="border-border-panel text-text-body flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3 text-sm font-semibold">
            <span>History</span>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (event) => {
                  const [file] = event.target.files ?? [];
                  if (!file) return;
                  await importHistory(file);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 cursor-pointer rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Importing history will overwrite the current history after the ${MaxHistoryCount}th entry. Continue?`,
                  );
                  if (confirmed) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                Import
              </button>
              <button
                type="button"
                className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 cursor-pointer rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
                onClick={() => exportHistory(historyList)}
              >
                Export
              </button>
            </div>
          </header>
          <div className="text-text-secondary min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
            {historyList.length > 0
              ? historyList.map((packet: HistoryPacket) => historyCard(packet))
              : "No history to display yet. Try running Path Explorer."}
          </div>
        </section>
      </div>

      {/* Controls */}
      <div
        id="controls"
        className="border-border-panel bg-panel-bg fixed right-2 bottom-2 left-2 z-30 overflow-hidden rounded-2xl border backdrop-blur-[10px] lg:relative lg:right-auto lg:bottom-auto lg:left-auto lg:mr-auto lg:flex lg:h-full lg:w-96 lg:flex-col lg:gap-4 lg:rounded-none lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:border-l lg:p-4"
      >
        <button
          type="button"
          onClick={() => setIsMobileControlsOpen((prev) => !prev)}
          className="text-text-body flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold lg:hidden"
          aria-expanded={isMobileControlsOpen}
          aria-controls="path-explorer-mobile-controls"
        >
          <span>Path Explorer Controls</span>
          <span className="text-lg leading-none">
            {isMobileControlsOpen ? "−" : "+"}
          </span>
        </button>

        <div
          id="path-explorer-mobile-controls"
          className={`flex min-h-0 flex-1 flex-col items-center gap-3 overflow-x-hidden px-3 lg:px-0 ${isMobileControlsOpen ? "max-h-[58vh] overflow-y-auto pb-3" : "max-h-0 overflow-hidden lg:max-h-none lg:overflow-y-auto"}`}
          aria-hidden={!isMobileControlsOpen && undefined}
          aria-live="polite"
          aria-atomic="true"
          role="region"
          aria-label="Path explorer controls"
          data-expanded={isMobileControlsOpen}
          style={{ transition: "max-height 220ms ease" }}
        >
          <CourseSearchBar
            searchResults={completedCourses}
            setSearchResults={setCompletedCourses}
            title="Courses you have completed"
            placeholder="Add a course you completed"
          />
          <CourseSearchBar
            searchResults={desiredCourses}
            setSearchResults={setDesiredCourses}
            title="Courses you want to take"
            placeholder="Add a course to take"
          />
          <CourseSearchBar
            searchResults={avoidedCourses}
            setSearchResults={setAvoidedCourses}
            title="Courses you want to avoid"
            placeholder="Add a course to avoid"
          />
        </div>

        <div
          id="bottomSection"
          className="mb-4 flex shrink-0 flex-col items-center gap-2.5 px-3 text-xs"
        >
          <h1 className="w-full text-sm leading-snug">
            <b>
              Discover courses you can take next from courses you have
              completed:
            </b>
          </h1>
          <button
            id="postreqsButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-md border-0 bg-linear-to-br px-3 py-2 text-sm text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleGetImmediatePostreqs}
          >
            Find unlocked courses
          </button>
          <h1 className="mt-4 w-full text-sm leading-snug">
            <b>
              Find the optimal path to courses you want to take from courses you
              have completed and want to avoid:
            </b>
          </h1>
          <button
            id="demoSendButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-md border-0 bg-linear-to-br px-3 py-2 text-sm text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleRunPathFinder}
          >
            Find your path
          </button>
        </div>
      </div>

      {/* Desktop help button */}
      <div className="absolute top-4 right-100 z-40 hidden lg:block">
        <HelpMenu>{helpTemplatePathExplorer}</HelpMenu>
      </div>
    </div>
  );
}
