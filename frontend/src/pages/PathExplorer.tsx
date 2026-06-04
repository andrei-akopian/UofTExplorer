import { useEffect, useState } from "react";
import type { GraphData } from "../types";
import CourseSearchBar from "../components/search/CourseSearchBar";
import GraphVis2D from "../components/graph/GraphVis2D";
import { useImmediatePostreqs, usePathFinderSolution } from "../hooks/useGraph";

export default function PathExplorer() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [avoidedCourses, setAvoidedCourses] = useState<string[]>([]);
  const [desiredCourses, setDesiredCourses] = useState<string[]>([]);

  const {
    data: graphDataPostreqs,
    loading,
    error,
    fetch: fetchImmediatePostreqs,
  } = useImmediatePostreqs();

  const {
    data: graphDataPathfind,
    loading: loadingPathfind,
    error: errorPathfind,
    fetch: fetchPathfindSolution,
  } = usePathFinderSolution();

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const handleGetImmediatePostreqs = async () => {
    console.log("Completed courses:", completedCourses);
    try {
      await fetchImmediatePostreqs(completedCourses);
    } catch (err) {
      console.error("Error fetching immediate postreqs:", err);
    }
  };

  useEffect(() => {
    if (graphDataPostreqs) {
      setGraphData(graphDataPostreqs);
      console.log(
        "Immediate postreqs graph data in PathExplorer.tsx:",
        graphDataPostreqs,
      );
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
    if (graphDataPathfind) {
      setGraphData(graphDataPathfind?.graph_data);
      console.log(
        "Path finder solution graph data in PathExplorer.tsx:",
        graphDataPathfind,
      );
    }
  }, [graphDataPathfind]);

  return (
    <div className="relative flex h-screen w-full max-md:flex-col">
      <div id="vis graph" className="relative h-full w-full max-md:h-[50vh]">
        <GraphVis2D graphData={graphData} useShellLayout={true} />
      </div>
      <div
        id="controls"
        className="border-l-border-panel bg-panel-bg max-md:border-t-border-panel z-2 mr-4 flex h-screen w-124 flex-col gap-4 border-l p-4 backdrop-blur-[10px] max-md:mr-0 max-md:h-[50vh] max-md:w-full max-md:border-t max-md:border-l-0"
      >
        <div
          id="topSection"
          className="flex min-h-0 flex-1 flex-col items-center gap-[0.9rem] overflow-x-hidden overflow-y-auto"
        >
          <CourseSearchBar
            searchResults={completedCourses}
            setSearchResults={setCompletedCourses}
            title="Courses you have completed"
          />

          <button
            id="postreqsButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] font-bold text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleGetImmediatePostreqs}
          >
            Courses Unlocked by Completed Courses
          </button>

          <CourseSearchBar
            searchResults={avoidedCourses}
            setSearchResults={setAvoidedCourses}
            title="Courses you want to avoid"
          />

          <CourseSearchBar
            searchResults={desiredCourses}
            setSearchResults={setDesiredCourses}
            title="Courses you want to take"
          />
        </div>

        <div
          id="bottomSection"
          className="border-border-panel bg-panel-bg mb-6 flex shrink-0 flex-col items-center gap-3 rounded-2xl border p-[0.9rem] text-center shadow-[0_4px_12px_rgba(37,53,84,0.06)]"
        >
          <div className="flex w-full justify-center py-2 text-center">
            <h3 id="title" className="m-0 text-[1.1rem] leading-[1.3]">
              Fastest path to your academic desires
            </h3>
          </div>

          <button
            id="demoSendButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] font-bold text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            onClick={handleRunPathFinder}
          >
            Run Path Explorer
          </button>
          <div
            id="progressContainer"
            className="flex w-full flex-col gap-3 self-stretch"
            style={{ display: "none" }}
          >
            <p
              id="fundamentalsInfo"
              className="text-text-secondary m-0 mb-[0.6rem] text-[0.9rem] font-medium"
            ></p>
            <p
              id="progressStatus"
              className="border-l-border-from bg-code-bg text-text-code m-0 rounded-[0.2rem] border-l-[3px] p-2 pl-[0.7rem] font-mono text-[0.85rem]"
            >
              Starting...
            </p>
            <button
              id="cancelSolverButton"
              type="button"
              className="bg-btn-error hover:bg-btn-error-hover disabled:bg-btn-error-disabled w-full cursor-pointer self-stretch rounded-sm border-0 px-4 py-2 text-[0.85rem] font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
          <div
            id="warningContainer"
            className="w-full self-stretch"
            style={{ display: "" }}
          >
            <div className="border-warning-border bg-warning-bg text-warning-text flex items-start gap-[0.6rem] rounded-[0.8rem] border px-[0.8rem] py-[0.65rem] text-[0.85rem] leading-[1.4]">
              <span className="shrink-0 text-[1.1rem]">⚠️</span>
              <span id="warningText"></span>
            </div>
          </div>
        </div>
      </div>

      <p
        id="requestStatus"
        className="pointer-events-none absolute bottom-17.5 left-54 z-4 m-0 min-h-[1.3rem] w-96 -translate-x-1/2 text-left text-[0.9rem] wrap-break-word whitespace-pre-wrap text-(--color-text-subtle) max-md:left-1/2 max-md:w-[calc(100%-2rem)] [&.error]:text-(--color-error-hover) [&.success]:text-(--color-success-text)"
        aria-live="polite"
      ></p>
    </div>
  );
}
