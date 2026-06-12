import { useCallback, useEffect, useMemo, useState } from "react";
import type { GraphData } from "../types";
import CourseSearchBar from "../components/search/CourseSearchBar";
import GraphVis2D from "../components/graph/GraphVis2D";
import MobileWarning from "../components/MobileWarning";
import {
  useImmediatePostreqs,
  usePathFinderSolution,
  useLocalStorage,
} from "../hooks/useGraph";

interface HistoryPacket {
  desired: string[];
  completed: string[];
  avoided: string[];
  solution: string[];
  tool: string;
}

const MaxHistoryCount = 10;

export default function PathExplorer() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [avoidedCourses, setAvoidedCourses] = useState<string[]>([]);
  const [desiredCourses, setDesiredCourses] = useState<string[]>([]);
  const [solutionDisplay, setSolutionDisplay] = useState<string[]>([]);
  const [placeholderText, setPlaceholderText] = useState<string>("");
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  const [lastTool, setLastTool] = useState<string>("");
  const [resultVisibility, setResultVisibility] = useState<string>("all");

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
    updateHistory(captureHistory());
  }, [graphData]);

  const loadHistory = useCallback((packet: HistoryPacket) => {
    setCompletedCourses(packet.completed);
    setDesiredCourses(packet.desired);
    setAvoidedCourses(packet.avoided);
  }, []);

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

  const historyCard = useCallback((packet: HistoryPacket) => {
    return (
      <details className="border-border-card bg-panel-bg shadow-card mt-0.5 mb-1.5 rounded-lg border p-1">
        <summary className="hover:bg-surface-1 cursor-pointer list-none rounded-md p-0.5 transition-colors duration-150 hover:shadow-sm">
          <span className="flex items-start justify-between gap-3">
            <span className="text-text-body min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {`R: ${packet.solution.length} | C: ${packet.completed.length} | D: ${packet.desired.length} | A: ${packet.avoided.length}`}
              </span>
              <span className="block text-xs leading-snug">
                {packet.tool == "postreqs" ? "Find Next Courses" : "Path Find"}
              </span>
            </span>
            <button
              type="button"
              className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
              onClick={() => loadHistory(packet)}
            >
              Load
            </button>
            <button
              type="button"
              className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
              onClick={() => exportHistory([packet])}
            >
              Export
            </button>
          </span>
        </summary>
        <div className="m-1">
          <p className="mt-1 font-bold">Result:</p>
          <p className="font-normal">{packet.solution.join(", ")}</p>
          <p className="mt-1 font-bold">Completed Courses:</p>
          <p className="font-normal">{packet.completed.join(", ")}</p>
          <p className="mt-1 font-bold">Desired Courses:</p>
          <p className="font-normal">{packet.desired.join(", ")}</p>
          <p className="mt-1 font-bold">Avoided Courses:</p>
          <p className="font-normal">{packet.avoided.join(", ")}</p>
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
              ? "border-border-card shadow-card bg-green-bg rounded-lg border p-0.5"
              : "border-border-card bg-panel-bg shadow-card rounded-lg border p-0.5"
          }
        >
          <summary className="hover:bg-surface-1 cursor-pointer list-none rounded-md p-0.5 transition-colors duration-150 hover:shadow-sm">
            <span className="flex items-start justify-between gap-3">
              <span
                className={
                  highlight
                    ? "text-text-body min-w-0 flex-1"
                    : "text-text-muted min-w-0 flex-1"
                }
              >
                <span className="block text-sm font-semibold">{code}</span>
                <span className="block text-xs leading-snug">
                  {dataDict.get(code).title}
                </span>
              </span>
              <a href={`/graph/2d?search=${code}`} target="_blank">
                <button
                  type="button"
                  className="border-border-card bg-surface-1 text-text-body hover:bg-surface-2 shrink-0 rounded-md border px-2.5 py-1 text-[0.72rem] font-medium"
                >
                  Open
                </button>
              </a>
            </span>
          </summary>
          <div className="m-1">
            <p className="font-bold">Description:</p>
            <p className="font-normal">{dataDict.get(code).description}</p>
            <p className="font-bold">Prerequisites:</p>
            <p className="font-normal">{dataDict.get(code).prerequisites}</p>
            {dataDict.get(code).corequisites ? (
              <>
                <p className="font-bold">Corequisites:</p>
                <p className="font-normal">{dataDict.get(code).corequisites}</p>
              </>
            ) : (
              <></>
            )}
            {dataDict.get(code).exclusions ? (
              <>
                <p className="font-bold">Exclusions:</p>
                <p className="font-normal">{dataDict.get(code).exclusions}</p>
              </>
            ) : (
              <></>
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
        )}{" "}
        <hr></hr>
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
        if (filtered.length == 0) {
          setPlaceholderText(
            "There are no courses which is immediately unlocked by your completed courses.",
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
    <div className="relative flex h-full w-full flex-col overflow-hidden font-sans lg:flex-row lg:pl-96">
      <MobileWarning />

      <div id="vis graph" className="relative min-h-0 w-full flex-1 lg:h-full">
        <GraphVis2D graphData={graphData} />
      </div>

      <div
        id="resultBar"
        className="border-border-panel bg-surface-1 fixed top-16 bottom-0 left-2 z-30 flex h-[calc(100vh-4rem)] w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-none border shadow-sm lg:w-96"
      >
        <section className="border-border-panel flex min-h-0 flex-[0_0_62%] flex-col overflow-hidden border-b">
          <header className="border-border-panel text-text-body flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 text-sm font-semibold">
            <span>Result</span>
            <label className="text-text-secondary flex items-center gap-2 text-xs font-medium">
              <span>Show</span>
              <select
                className="border-border-card bg-surface-1 text-text-body focus:border-input-focus-border focus:ring-input-focus-ring rounded-md border px-2 py-1 text-xs shadow-sm outline-none focus:ring-1"
                defaultValue="all"
                aria-label="Select result display mode"
                onChange={(e) => setResultVisibility(e.target.value)}
              >
                <option value="all">All</option>
                <option value="target">Target Courses</option>
                <option value="side">Side Courses</option>
              </select>
            </label>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="text-text-body flex flex-col gap-2 text-[0.84rem] font-medium">
              {resultsDisplay}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-[0_0_38%] flex-col overflow-hidden">
          <header className="border-border-panel text-text-body shrink-0 border-b px-4 py-3 text-sm font-semibold">
            History
          </header>
          <div className="text-text-secondary min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
            {historyList.length > 0
              ? historyList.map((packet: HistoryPacket) => historyCard(packet))
              : "No history to display yet. Try running Path Explorer."}
          </div>
        </section>
      </div>

      <div
        id="controls"
        className="border-border-panel bg-panel-bg fixed right-2 bottom-2 left-2 z-30 overflow-hidden rounded-2xl border backdrop-blur-[10px] lg:relative lg:right-auto lg:bottom-auto lg:left-auto lg:mr-4 lg:flex lg:h-full lg:w-124 lg:flex-col lg:gap-4 lg:rounded-none lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:border-l lg:p-4"
      >
        <button
          type="button"
          onClick={() => setIsMobileControlsOpen((prev) => !prev)}
          className="text-text-body flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold lg:hidden"
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
          className={`flex min-h-0 flex-1 flex-col items-center gap-[0.9rem] overflow-x-hidden px-4 lg:px-0 ${isMobileControlsOpen ? "max-h-[58vh] overflow-y-auto pb-3" : "max-h-0 overflow-hidden lg:max-h-none lg:overflow-y-auto"}`}
          aria-hidden={!isMobileControlsOpen && undefined}
          aria-live="polite"
          aria-atomic="true"
          role="region"
          aria-label="Path explorer controls"
          data-expanded={isMobileControlsOpen}
          style={{ transition: "max-height 220ms ease" }}
        >
          <h1>
            Discover courses you can take next based on courses you have
            completed:
          </h1>
          <CourseSearchBar
            searchResults={completedCourses}
            setSearchResults={setCompletedCourses}
            title="Courses you have completed"
            placeholder="Add a course you completed"
          />

          <button
            id="postreqsButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleGetImmediatePostreqs}
          >
            Find out now
          </button>

          <h1 className="mt-5">
            Find the optimal path to courses you want to take: (considers
            completed courses)
          </h1>

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
          className="mb-6 flex shrink-0 flex-col items-center gap-3 text-sm"
        >
          <button
            id="demoSendButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.82rem] text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleRunPathFinder}
          >
            Find your path
          </button>
          <div
            id="progressContainer"
            className="flex w-full flex-col gap-3 self-stretch"
            style={{ display: "none" }}
          >
            <p
              id="fundamentalsInfo"
              className="text-text-secondary m-0 mb-[0.6rem] text-[0.8rem] font-medium"
            ></p>
            <p
              id="progressStatus"
              className="border-l-border-from bg-code-bg text-text-code m-0 rounded-[0.2rem] border-l-[3px] p-2 pl-[0.7rem] font-mono text-[0.78rem]"
            >
              Starting...
            </p>
            <button
              id="cancelSolverButton"
              type="button"
              className="bg-btn-error hover:bg-btn-error-hover disabled:bg-btn-error-disabled w-full cursor-pointer self-stretch rounded-sm border-0 px-4 py-2 text-[0.78rem] font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
          <div
            id="warningContainer"
            className="w-full self-stretch"
            style={{ display: "none" }}
          >
            <div className="border-warning-border bg-warning-bg text-warning-text flex items-start gap-[0.6rem] rounded-[0.8rem] border px-[0.8rem] py-[0.65rem] text-[0.78rem] leading-[1.4]">
              <span className="shrink-0 text-[1rem]">⚠️</span>
              <span id="warningText"></span>
            </div>
          </div>
        </div>
      </div>

      <p
        id="requestStatus"
        className="text-text-subtle [&.error]:text-error-hover [&.success]:text-success-text pointer-events-none absolute bottom-4 left-1/2 z-4 m-0 min-h-[1.3rem] w-[calc(100%-2rem)] -translate-x-1/2 text-left text-[0.9rem] wrap-break-word whitespace-pre-wrap lg:bottom-17.5 lg:left-54 lg:w-96"
        aria-live="polite"
      ></p>
      <div className="fixed right-3 bottom-3 left-3 z-20 flex min-w-0 flex-col gap-1 sm:right-auto sm:bottom-10 sm:left-5 sm:min-w-[20rem]">
        <div id="message" className="m-0 min-h-6 text-[0.84rem] font-medium">
          {solutionDisplay.map((x) => (
            <p>{x}</p>
          ))}
        </div>
      </div>

      <div className="fixed top-20 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 text-center text-xl text-red-500 sm:text-2xl lg:left-10 lg:w-200 lg:translate-x-0 lg:text-left lg:text-4xl">
        {placeholderText}
      </div>
    </div>
  );
}
