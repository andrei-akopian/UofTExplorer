export default function GraphStatusOverlay({
  currentQueryCode,
  currentQueryName,
  message,
  messageType = "info",
}: {
  currentQueryCode?: string;
  currentQueryName?: string;
  message: string;
  messageType?: "info" | "success" | "error";
}) {
  const displayText = currentQueryCode
    ? `Currently displaying: ${currentQueryCode} — ${currentQueryName ?? ""}`
    : "";

  const defaultMessageClass =
    messageType === "success"
      ? "text-sm font-sans text-white"
      : messageType === "error"
        ? "text-sm font-sans text-error"
        : "text-sm font-sans text-(--color-primary-info)";

  const displayTextClass =
    messageType === "error"
      ? "text-text-query"
      : messageType === "success"
        ? "text-success-text"
        : "text-(--color-primary-info)";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        id="currQueryDisplay"
        className={`overflow-hidden text-sm leading-[1.3] font-semibold text-ellipsis whitespace-nowrap ${displayTextClass}`}
      >
        {displayText}
      </div>
      {Boolean(message) && message !== displayText && (
        <div
          id="message"
          className={`m-0 min-h-6 text-sm ${defaultMessageClass}`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
