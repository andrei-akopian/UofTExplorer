export default function LoadingOverlay({
  visible,
  text = "Loading",
}: {
  visible: boolean;
  text?: string;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="bg-panel-bg/90 absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 backdrop-blur-[2px]">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="border-input-border h-20 w-20 rounded-full border-4 opacity-40"></div>
        <div className="border-input-focus-border absolute h-20 w-20 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
      <p className="text-text-body text-center text-xl font-semibold tracking-wide">
        {text}
      </p>
    </div>
  );
}
