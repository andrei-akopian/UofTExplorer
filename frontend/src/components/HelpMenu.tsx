import { useState } from "react";

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

        <div className="border-border-dropdown bg-panel-bg shadow-dropdown text-text-body absolute top-[calc(100%+8px)] right-0 z-50 w-[min(22rem,calc(100vw-1rem))] rounded-xl border p-3 text-sm backdrop-blur-sm sm:w-80">
          <div className="border-border-card/70 bg-surface-1/80 rounded-lg border p-3">
            {children}
          </div>
        </div>
      </details>
    </div>
  );
}
