import { Link } from "react-router-dom";

const pageLinkClassName =
  "text-[#0f5fa8] no-underline border-b border-transparent transition-colors duration-150 hover:text-[#0a4477] hover:border-current focus-visible:text-[#0a4477] focus-visible:border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb7d9] focus-visible:outline-offset-2 focus-visible:rounded-sm";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center bg-[#fcfcfa] px-4 py-10 font-sans leading-relaxed text-[#1f2933] md:px-5">
      <div className="grid w-full max-w-3xl gap-10">
        <h1 className="font-display text-center text-5xl font-medium">
          UofT Explorer
        </h1>

        <p className="font-sans">
          Welcome! Explore how courses, programs, and departments are connected
          at the Faculty of Arts & Science at the University of Toronto.
        </p>

        <p className="font-sans">
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

        <div className="font-sans">
          <h2 className="mt-6 mb-2 text-[1.4em]">
            Graph Explorer:{" "}
            <Link className={pageLinkClassName} to="/2dgraph">
              2D Graph
            </Link>{" "}
            |{" "}
            <Link className={pageLinkClassName} to="/3dforcegraph">
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

        <div className="font-sans">
          <h2 className="mt-6 mb-2 text-[1.4em]">
            <Link className={pageLinkClassName} to="/globalstats">
              Global Statistics
            </Link>
          </h2>
          <div>
            Get an overview of the global statistics across courses at the
            Faculty of Arts & Science.
          </div>
        </div>

        <div className="font-sans">
          <h2 className="mt-6 mb-2 font-sans text-[1.4em]">
            <Link className={pageLinkClassName} to="/pathexplorer">
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
