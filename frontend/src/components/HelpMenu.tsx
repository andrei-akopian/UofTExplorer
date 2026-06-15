import { useState } from "react";

export const helpTemplateGraph2D = (
  <>
    <h1 className="text-base font-semibold">2D Graph</h1>
    <p>
      Use the search bar to load the graph for a course, program, or department.
      Applied filters will highlight the target courses green.
    </p>
    <h1 className="mt-4 text-base font-semibold">Graph Controls</h1>
    <p>LMB Drag: Move viewport</p>
    <p>Scroll: Zoom in/out</p>
    <p>Hover on Node: Highlight course prereqs</p>
    <p>Click Node: See course info</p>
    <p>Double CLick Node: Zoom in on node</p>
  </>
);

export const helpTemplateGraph3D = (
  <>
    <h1 className="text-base font-semibold">3D Graph</h1>
    <p>
      Use the search bar to load the graph for a course, program, or department.
      Applied filters will highlight the target courses green.
    </p>
    <h1 className="mt-4 text-base font-semibold">Graph Controls</h1>
    <p>LMB Drag: Orbit</p>
    <p>RMB Drag: Pan</p>
    <p>Scroll: Zoom in/out</p>
    <p>Hover on Node: Highlight course prereqs</p>
    <p>Click Node: See course info</p>
    <p>Double Click Node: Zoom in on node</p>
  </>
);

export const helpTemplatePathExplorer = (
  <>
    <h1 className="text-base font-semibold">Path Explorer</h1>
    <p>
      Search and select courses with the panel on the right. Click the bottom
      right buttons to run.
    </p>
    <h1 className="mt-4 text-base font-semibold">Graph Controls</h1>
    <p>LMB Drag: Move viewport</p>
    <p>Scroll: Zoom in/out</p>
    <p>Hover on Node: Highlight course prereqs</p>
    <h1 className="mt-4 text-base font-semibold">Result Panel</h1>
    <p>
      Shows target courses (courses you have unlocked / courses to take in the
      optimal path) in green. Click for course details.
    </p>
    <h1 className="mt-4 text-base font-semibold">History Panel</h1>
    <p>Saves the last 10 query results.</p>
    <p>Import: Import history data from a save file</p>
    <p>Export: Download the saved history</p>
    <p>Click on each entry to see details.</p>
    <p>Load: Load a saved query</p>
  </>
);

export default function HelpMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="z-50">
      <details className="group relative">
        <summary
          onClick={() => setIsOpen(!isOpen)}
          className="border-input-border bg-input-bg text-text-body focus:ring-input-focus-ring flex cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:-translate-y-0 focus:outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden"
        >
          {!isOpen ? (
            <div className="flex w-14 justify-center gap-2">
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary mt-auto mb-auto inline-flex h-4 w-4 items-center justify-center rounded-full shadow-inner"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 19h.01M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2.5-3 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span>Help</span>
            </div>
          ) : (
            <div className="flex w-14 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="black"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </summary>

        <div className="border-border-dropdown bg-panel-bg shadow-dropdown text-text-body absolute top-[calc(100%+8px)] right-0 z-50 w-[min(22rem,calc(100vw-1rem))] rounded-xl border p-2 text-sm backdrop-blur-sm sm:w-80">
          <div className="border-border-card/70 bg-surface-1/80 rounded-lg border p-3">
            {children}
          </div>
        </div>
      </details>
    </div>
  );
}
