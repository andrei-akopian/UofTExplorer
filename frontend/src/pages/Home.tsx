import { Link } from "react-router-dom";

const pageLinkClassName =
  "text-link no-underline border-b border-transparent transition-colors duration-150 hover:text-link-hover hover:border-current focus-visible:text-link-hover focus-visible:border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus-outline focus-visible:outline-offset-2 focus-visible:rounded-sm";

export default function Home() {
  return (
    <div className="bg-page-bg text-text-body flex w-full flex-col items-center px-4 py-4 font-sans leading-relaxed md:px-5">
      <div className="grid w-full max-w-3xl gap-5 font-sans">
        <h1 className="font-display m-4 text-center text-5xl font-medium">
          UofT Explorer
        </h1>

        <p>
          Welcome! Explore how courses, programs, and departments are connected
          at the Faculty of Arts & Science at the University of Toronto.
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

        <div>
          <h2 className="mt-4 mb-2 text-[1.4em]">
            Graph Explorer:{" "}
            <Link className={pageLinkClassName} to="/graph/2d">
              2D Graph
            </Link>{" "}
            |{" "}
            <Link className={pageLinkClassName} to="/graph/3d">
              3D Graph
            </Link>
          </h2>
          <div>
            Explore the prerequisite connections between courses, programs, and
            departments through interactive graph visualizations.
          </div>
          <div className="mt-2 italic">
            Note: Loading large graphs may take a few minutes and use a
            significant amount of computer memory.
          </div>
        </div>

        <div>
          <h2 className="mt-4 mb-2 text-[1.4em]">
            <Link className={pageLinkClassName} to="/global-stats">
              Global Statistics
            </Link>
          </h2>
          <div>
            Get an overview of the global statistics across courses at the
            Faculty of Arts & Science.
          </div>
        </div>

        <div>
          <h2 className="mt-4 mb-2 font-sans text-[1.4em]">
            <Link className={pageLinkClassName} to="/path-explorer">
              Path Explorer
            </Link>
          </h2>
          <div>
            Find out which courses you're eligible to take, and discover the
            shortest path to reach your desired courses.
          </div>
        </div>
      </div>
    </div>
  );
}
