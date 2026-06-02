export default function PathExplorer() {
  return (
    <div className="relative flex h-screen w-full max-md:flex-col">
      <div
        id="mynetwork"
        className="h-screen flex-1 bg-[radial-gradient(circle_at_top,rgba(188,214,255,0.45),transparent_32%),linear-gradient(180deg,#f7f9fc_0%,#eef3f7_100%)] max-md:h-[50vh] max-md:w-full"
      ></div>

      <div
        id="controls"
        className="z-2 mr-4 flex h-screen w-104 flex-col gap-4 border-l border-l-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.85)] p-4 backdrop-blur-[10px] max-md:mr-0 max-md:h-[50vh] max-md:w-full max-md:border-t max-md:border-l-0 max-md:border-t-[rgba(104,124,156,0.16)]"
      >
        <div
          id="topSection"
          className="flex min-h-0 flex-1 flex-col gap-[0.9rem] overflow-x-hidden overflow-y-auto"
        >
          <div className="relative w-full shrink-0 rounded-2xl border border-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.6)] px-[0.9rem] py-[0.85rem] pb-[0.95rem] shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <div className="flex items-center justify-between gap-2">
              <label
                className="mb-[0.45rem] flex items-center gap-[0.55rem] text-[0.88rem] font-semibold text-[#42516d]"
                htmlFor="completedSearch"
              >
                Courses you already took
                <span className="min-w-8 rounded-full bg-[#e7eefb] px-[0.6rem] py-[0.28rem] text-center font-bold text-[#35518a]">
                  0
                </span>
              </label>
              <button
                id="immediatePostreqsButton"
                type="button"
                className="mr-8 cursor-pointer rounded-[0.6rem] border border-[#7f9ede] bg-linear-to-br from-[#d0deff] to-[#e0e8ff] px-[0.7rem] py-[0.35rem] text-[0.75rem] font-semibold whitespace-nowrap text-[#35518a] transition-colors duration-200 hover:border-[#537fcb] hover:from-[#bfd4ff] hover:to-[#d0deff] disabled:cursor-not-allowed disabled:opacity-50"
                title="Get immediate post-requisites"
              >
                What Courses Can I Take Next?
              </button>
            </div>
            <input
              id="completedSearch"
              type="text"
              className="box-border w-[96%] rounded-[0.9rem] border border-[#c9d4e5] bg-[#fcfdff] px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:border-[#7f9ede] focus:ring-2 focus:ring-[rgba(70,114,202,0.2)] focus:outline-none"
              placeholder="Add a completed course"
              autoComplete="off"
            />
            <div className="mt-[0.65rem] flex min-h-0 flex-wrap gap-[0.55rem]"></div>
            <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-10 max-h-72 overflow-y-auto rounded-[0.95rem] border border-[#d2daea] bg-white shadow-[0_16px_30px_rgba(34,48,79,0.14)] [&.show]:block [&:not(.show)]:hidden"></div>
          </div>

          <div className="relative w-full shrink-0 rounded-2xl border border-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.6)] px-[0.9rem] py-[0.85rem] pb-[0.95rem] shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <label
              className="mb-[0.45rem] flex items-center gap-[0.55rem] text-[0.88rem] font-semibold text-[#42516d]"
              htmlFor="avoidedSearch"
            >
              Courses you want to avoid
              <span className="min-w-8 rounded-full bg-[#e7eefb] px-[0.6rem] py-[0.28rem] text-center font-bold text-[#35518a]">
                0
              </span>
            </label>
            <input
              id="avoidedSearch"
              type="text"
              className="box-border w-[96%] rounded-[0.9rem] border border-[#c9d4e5] bg-[#fcfdff] px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:border-[#7f9ede] focus:ring-2 focus:ring-[rgba(70,114,202,0.2)] focus:outline-none"
              placeholder="Add a course to avoid"
              autoComplete="off"
            />
            <div className="mt-[0.65rem] flex min-h-0 flex-wrap gap-[0.55rem]"></div>
            <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-10 max-h-72 overflow-y-auto rounded-[0.95rem] border border-[#d2daea] bg-white shadow-[0_16px_30px_rgba(34,48,79,0.14)] [&.show]:block [&:not(.show)]:hidden"></div>
          </div>

          <div className="relative w-full shrink-0 rounded-2xl border border-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.6)] px-[0.9rem] py-[0.85rem] pb-[0.95rem] shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
            <label
              className="mb-[0.45rem] flex items-center gap-[0.55rem] text-[0.88rem] font-semibold text-[#42516d]"
              htmlFor="desiredSearch"
            >
              Courses you want to take
              <span className="min-w-8 rounded-full bg-[#e7eefb] px-[0.6rem] py-[0.28rem] text-center font-bold text-[#35518a]">
                0
              </span>
            </label>
            <input
              id="desiredSearch"
              type="text"
              className="box-border w-[96%] rounded-[0.9rem] border border-[#c9d4e5] bg-[#fcfdff] px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:border-[#7f9ede] focus:ring-2 focus:ring-[rgba(70,114,202,0.2)] focus:outline-none"
              placeholder="Add a target course"
              autoComplete="off"
            />
            <div className="mt-[0.65rem] flex min-h-0 flex-wrap gap-[0.55rem]"></div>
            <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-10 max-h-72 overflow-y-auto rounded-[0.95rem] border border-[#d2daea] bg-white shadow-[0_16px_30px_rgba(34,48,79,0.14)] [&.show]:block [&:not(.show)]:hidden"></div>
          </div>
        </div>

        <div
          id="bottomSection"
          className="mb-6 flex shrink-0 flex-col items-center gap-3 rounded-2xl border border-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.6)] p-[0.9rem] text-center shadow-[0_4px_12px_rgba(37,53,84,0.06)]"
        >
          <div className="flex w-full justify-center py-2 text-center">
            <h3 id="title" className="m-0 text-[1.1rem] leading-[1.3]">
              Find the shortest path to your academic desires
            </h3>
          </div>
          <button
            id="demoSendButton"
            type="button"
            className="w-full cursor-pointer self-stretch rounded-[0.8rem] border-0 bg-linear-to-br from-[#3b67c7] to-[#274f9f] px-4 py-[0.8rem] text-[0.95rem] font-bold text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
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
              className="m-0 mb-[0.6rem] text-[0.9rem] font-medium text-[#1f2937]"
            ></p>
            <p
              id="progressStatus"
              className="m-0 rounded-[0.2rem] border-l-[3px] border-l-[#3b67c7] bg-[#f5f7fa] p-2 pl-[0.7rem] font-mono text-[0.85rem] text-[#2c3e50]"
            >
              Starting...
            </p>
            <button
              id="cancelSolverButton"
              type="button"
              className="w-full cursor-pointer self-stretch rounded-sm border-0 bg-[#ef4444] px-4 py-2 text-[0.85rem] font-medium text-white transition-colors duration-200 hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#d1d5db]"
            >
              Cancel
            </button>
          </div>
          <div
            id="warningContainer"
            className="w-full self-stretch"
            style={{ display: "none" }}
          >
            <div className="flex items-start gap-[0.6rem] rounded-[0.8rem] border border-[#fcd34d] bg-[#fef3c7] px-[0.8rem] py-[0.65rem] text-[0.85rem] leading-[1.4] text-[#92400e]">
              <span className="shrink-0 text-[1.1rem]">⚠️</span>
              <span id="warningText"></span>
            </div>
          </div>
        </div>
      </div>

      <p
        id="requestStatus"
        className="pointer-events-none absolute bottom-17.5 left-54 z-4 m-0 min-h-[1.3rem] w-96 -translate-x-1/2 text-left text-[0.9rem] wrap-break-word whitespace-pre-wrap text-[#4c5d79] max-md:left-1/2 max-md:w-[calc(100%-2rem)] [&.error]:text-[#b42318] [&.success]:text-[#1f7a3f]"
        aria-live="polite"
      ></p>
    </div>
  );
}
