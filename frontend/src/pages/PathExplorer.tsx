import { useEffect, useState } from "react";
import type { GraphData } from "../types";
import CourseSearchBar from "../components/search/CourseSearchBar";
import GraphVis2D from "../components/graph/GraphVis2D";
import MobileWarning from "../components/MobileWarning";
import { useImmediatePostreqs, usePathFinderSolution } from "../hooks/useGraph";

export default function PathExplorer() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [avoidedCourses, setAvoidedCourses] = useState<string[]>([]);
  const [desiredCourses, setDesiredCourses] = useState<string[]>([]);
  const [solutionDisplay, setSolutionDisplay] = useState<string[]>([]);
  const [placeholderText, setPlaceholderText] = useState<string>("");

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
    <div className="relative flex h-full w-full font-sans max-md:flex-col">
      <MobileWarning />

      <div id="vis graph" className="relative h-full w-full max-md:h-[50vh]">
        <GraphVis2D graphData={graphData} useShellLayout={true} />
      </div>
      <div
        id="controls"
        className="border-l-border-panel bg-panel-bg max-md:border-t-border-panel z-2 mr-4 flex h-full w-124 flex-col gap-4 border-l p-4 backdrop-blur-[10px] max-md:mr-0 max-md:h-[50vh] max-md:w-full max-md:border-t max-md:border-l-0"
      >
        <div
          id="topSection"
          className="flex min-h-0 flex-1 flex-col items-center gap-[0.9rem] overflow-x-hidden overflow-y-auto"
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
            Find the optimal path to courses you want to take:
          </h1>

          <CourseSearchBar
            searchResults={avoidedCourses}
            setSearchResults={setAvoidedCourses}
            title="Courses you want to avoid"
            placeholder="Add a course to avoid"
          />

          <CourseSearchBar
            searchResults={desiredCourses}
            setSearchResults={setDesiredCourses}
            title="Courses you want to take"
            placeholder="Add a course to take"
          />
        </div>

        <div
          id="bottomSection"
          className="mb-6 flex shrink-0 flex-col items-center gap-3"
        >
          <button
            id="demoSendButton"
            type="button"
            className="from-btn-gradient-from to-btn-gradient-to w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
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
            style={{ display: "none" }}
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
        className="text-text-subtle [&.error]:text-error-hover [&.success]:text-success-text pointer-events-none absolute bottom-17.5 left-54 z-4 m-0 min-h-[1.3rem] w-96 -translate-x-1/2 text-left text-[0.9rem] wrap-break-word whitespace-pre-wrap max-md:left-1/2 max-md:w-[calc(100%-2rem)]"
        aria-live="polite"
      ></p>
      <div className="fixed bottom-10 left-5 z-20 flex min-w-[20rem] flex-col gap-1">
        <div id="message" className="m-0 min-h-6 text-[0.84rem] font-medium">
          {solutionDisplay.map((x) => (
            <p>{x}</p>
          ))}
        </div>
      </div>

      <div className="fixed top-20 left-10 w-200 text-4xl text-red-500">
        {placeholderText}
      </div>
    </div>
  );
}
