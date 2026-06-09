import { useState } from "react";
import useIsMobile from "../hooks/useIsMobile";

interface MobileWarningProps {
  message?: string;
}

export default function MobileWarning({
  message = "Mobile view may be limited. For the best experience, use a desktop screen.",
}: MobileWarningProps) {
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = useState(false);

  if (!isMobile || dismissed) {
    return null;
  }

  return (
    <div className="border-warning-border bg-warning-bg text-warning-text fixed top-1/2 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-sm font-medium shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-left">{message}</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="border-warning-border text-warning-text hover:bg-warning-border/15 shrink-0 rounded border px-2 py-1 text-xs"
          aria-label="Dismiss mobile warning"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
