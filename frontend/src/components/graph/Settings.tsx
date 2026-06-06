export default function Settings({
  useShellLayout, setUseShellLayout, settings
}: {
  useShellLayout: boolean, 
  setUseShellLayout: (useShellLayout: boolean) => void, settings: React.ReactNode[]}, 
) {
    return (
        <details className="close-on-outclick absolute right-0 z-2 mt-3 mr-2 h-[4.7rem] w-[4.7rem] shrink-0 self-start bg-transparent">
          <summary className="m-0 flex h-full w-full list-none items-center justify-center p-0 [&::-webkit-details-marker]:hidden">
            <img src="/settings_gear.svg"></img>
          </summary>
          <div className="border-border-dropdown shadow-dropdown absolute top-[calc(100%+6px)] right-0 left-auto z-1200 flex max-h-[20em] w-[20em] flex-col gap-1.5 overflow-y-auto rounded-md border bg-white p-2.5">
            <label className="flex max-h-none w-max min-w-[5em] items-center gap-2 overflow-visible font-sans text-sm">
              <input
                type="checkbox"
                checked={useShellLayout}
                onChange={(e) => setUseShellLayout(e.target.checked)}
              />
              <span>Use shell layout</span>
            </label>
            {settings.map((component) => (
              component
            ))}
          </div>
        </details>
    )
}

export function Slider({title, size, setSize}: {
  title: string;
  size: number;
  setSize: (size: number) => void;
}) {
  return (
    <div key={title}>
        <div>{title}: {size}</div>
        <input type="range" max="100" min="0" value={size} onChange={(e) => setSize(Number(e.target.value))}></input>
    </div>
  );
}