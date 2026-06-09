import { Link } from "react-router-dom";

const pageLinkClassName =
  "text-link no-underline border-b border-transparent transition-colors duration-150 hover:text-link-hover hover:border-current focus-visible:text-link-hover focus-visible:border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-outline focus-visible:outline-offset-2 focus-visible:rounded-sm";

export default function Home() {
  return (
    <div className="bg-page-bg text-text-body flex h-full w-full flex-col items-center px-4 py-4 font-sans leading-relaxed md:px-5">
      <div className="mx-auto h-full w-full max-w-5xl gap-5 pt-6 font-sans">
        <h1 className="font-display m-4 text-center text-6xl font-medium">
          UofT Explorer
        </h1>

        <p className="mt-10">
          Welcome! Explore how courses, programs, and departments are connected
          at the Faculty of Arts and Sciences at the University of Toronto.
        </p>

        <p>
          All data is sourced from the{" "}
          <a
            className={pageLinkClassName}
            href="https://artsci.calendar.utoronto.ca/"
            target="_blank"
            rel="noreferrer"
          >
            Arts & Science Academic Calendar
          </a>
          .
        </p>

        <div className="mt-10 flex gap-4">
          <div className="border-border-panel bg-panel-bg flex flex-1 flex-col rounded-2xl border p-8 shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <h2 className="mb-2 text-xl">
              <strong>Graph Explorer</strong>
            </h2>
            <div>
              Explore the prerequisite connections between courses, programs,
              and departments through interactive graph visualizations.
            </div>
            <div className="mt-2 text-sm italic">
              Note: Loading large graphs may take a few minutes and use a
              significant amount of computer memory.
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                to="/graph/2d"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] !text-white no-underline hover:brightness-105"
              >
                View 2D
              </Link>
              <Link
                to="/graph/3d"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] !text-white no-underline hover:brightness-105"
              >
                View 3D
              </Link>
            </div>
          </div>

          <div className="border-border-panel bg-panel-bg flex flex-1 flex-col rounded-2xl border p-8 shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <h2 className="mb-2 text-xl">
              <strong>Path Explorer</strong>
            </h2>
            <div>
              Find out which courses you're eligible to take, and discover the
              shortest path to reach your desired courses.
            </div>
            <div className="mt-6">
              <Link
                to="/path-explorer"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] !text-white no-underline hover:brightness-105"
              >
                Check it out
              </Link>
            </div>
          </div>

          <div className="border-border-panel bg-panel-bg flex flex-1 flex-col rounded-2xl border p-8 shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <h2 className="mb-2 text-xl">
              <strong>Global Statistics</strong>
            </h2>
            <div>
              Get an overview of the global statistics across courses at the
              Faculty of Arts & Science.
            </div>
            <div className="mt-12">
              <Link
                to="/global-stats"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] !text-white no-underline hover:brightness-105"
              >
                Check it out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
