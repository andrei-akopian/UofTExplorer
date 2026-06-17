import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-page-bg text-text-body flex h-full w-full flex-col items-center justify-center px-4 py-8 font-sans">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="font-display m-2 text-6xl font-medium sm:m-4 sm:text-7xl md:text-8xl">
          404
        </h1>

        <p className="mt-4 text-lg sm:text-xl">
          <strong>Page not found</strong>
        </p>

        <p className="text-text-muted mt-2 text-sm sm:text-base">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="from-btn-gradient-from to-btn-gradient-to cursor-pointer rounded-[0.8rem] border-0 bg-linear-to-br px-6 py-3 text-[0.95rem] text-white! no-underline hover:brightness-105"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border-border-card bg-panel-bg text-text-body hover:bg-surface-1 cursor-pointer rounded-[0.8rem] border px-6 py-3 text-[0.95rem] no-underline transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
