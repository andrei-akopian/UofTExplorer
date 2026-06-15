import { useState } from "react";

export const helpTemplateGraph2D = (
  <>
    <h1 className="text-lg">2D Graph</h1>
    <p>
      Use the top search bar to load the requisite structure of a course,
      program, or department. The dropdown filters will highlight the target
      courses green.
    </p>
    <h1 className="text-lg">Graph Controls</h1>
    <p>LMB Drag: move viewport</p>
    <p>Scroll: zoom in/out</p>
    <p>Hover: highlight prerequisites</p>
    <p>Click Node: see course info (bottom right)</p>
  </>
);

export const helpTemplateGraph3D = (
  <>
    <h1 className="text-lg">3D Graph</h1>
    <p>
      Use the top search bar to load the requisite structure of a course,
      program, or department. The dropdown filters will highlight the target
      courses green.
    </p>
    <h1 className="text-lg">Graph Controls</h1>
    <p>LMB Drag: orbit</p>
    <p>RMB Drag: pan</p>
    <p>Scroll: zoom in/out</p>
    <p>Hover: highlight prerequisites</p>
    <p>Click Node: see course info (bottom right)</p>
  </>
);

export const helpTemplatePathExplorer = (
  <>
    <h1 className="text-lg">Path Explorer</h1>
    <p>
      Search and select courses with the panel on the right. Click the bottom
      right buttons to run.
    </p>
    <h1 className="mt-2 text-lg">Graph Controls</h1>
    <p>LMB Drag: move viewport</p>
    <p>Scroll: zoom in/out</p>
    <p>Hover: highlight prerequisites</p>
    <h1 className="mt-2 text-lg">Result Panel (top left)</h1>
    <p>
      Show the target courses (courses you can take / courses to take in the
      optimal path) in green. Click for course details.
    </p>
    <h1 className="mt-2 text-lg">History Panel (bottom left)</h1>
    <p>Saves the last 10 results.</p>
    <p>Import: import history data from a save file</p>
    <p>Export: download the saved history</p>
    <p>Click on each entry to see details.</p>
    <p>Load: load the specific saved query</p>
  </>
);

export default function HelpMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="z-50">
      <details className="group relative" onClick={() => setIsOpen(!isOpen)}>
        <summary className="border-input-border bg-input-bg text-text-body focus:ring-input-focus-ring flex cursor-pointer list-none items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:-translate-y-0 focus:outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
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
            <div className="flex w-14 justify-center">❌</div>
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
