import { Link } from "react-router-dom";

const pageLinkClassName =
  "text-link no-underline border-b border-transparent transition-colors duration-150 hover:text-link-hover hover:border-current focus-visible:text-link-hover focus-visible:border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-outline focus-visible:outline-offset-2 focus-visible:rounded-sm";

export default function Home() {
  return (
    <div className="bg-page-bg text-text-body flex h-full w-full flex-col items-center px-4 py-4 font-sans leading-relaxed sm:px-5">
      <div className="mx-auto w-full max-w-6xl pt-4 pb-8 font-sans sm:pt-6">
        <h1 className="font-display m-2 text-center text-4xl font-medium sm:m-4 sm:text-5xl md:text-6xl">
          UofT Explorer
        </h1>

        <p className="mt-8 text-center text-sm sm:text-base">
          Welcome! Explore how courses, programs, and departments are connected
          at the Faculty of Arts & Science at the University of Toronto.
        </p>

        <p className="text-center text-sm sm:text-base">
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

        <div className="mt-8 flex flex-col gap-4 lg:mt-10 lg:flex-row">
          <div className="border-border-panel bg-panel-bg shadow-card flex flex-1 flex-col rounded-2xl border p-5 sm:p-8">
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
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/graph/2d"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white! no-underline hover:brightness-105"
              >
                View 2D
              </Link>
              <Link
                to="/graph/3d"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white! no-underline hover:brightness-105"
              >
                View 3D
              </Link>
            </div>
          </div>

          <div className="border-border-panel bg-panel-bg shadow-card flex flex-1 flex-col rounded-2xl border p-5 sm:p-8">
            <h2 className="mb-2 text-xl">
              <strong>Path Explorer</strong>
            </h2>
            <div>
              Find out which courses you're eligible to take, and discover the
              shortest path to reach your desired courses.
            </div>
            <div className="mt-10">
              <Link
                to="/path-explorer"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white! no-underline hover:brightness-105"
              >
                Check out Path Explorer
              </Link>
            </div>
          </div>

          <div className="border-border-panel bg-panel-bg shadow-card flex flex-1 flex-col rounded-2xl border p-5 sm:p-8">
            <h2 className="mb-2 text-xl">
              <strong>Global Statistics</strong>
            </h2>
            <div>
              Get an overview of the global statistics across courses at the
              Faculty of Arts & Science.
            </div>
            <div className="mt-10">
              <Link
                to="/global-stats"
                className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-4 py-[0.8rem] text-[0.95rem] text-white! no-underline hover:brightness-105"
              >
                Check out Global Stats
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm italic lg:mt-10">
          This project is open source. Visit the repository on{" "}
          <a
            className={pageLinkClassName}
            href="https://github.com/andrei-akopian/UofTExplorer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
