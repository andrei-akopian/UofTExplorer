export default function Settings({
  settings,
}: {
  settings: React.ReactNode[];
}) {
  return (
    <details className="close-on-outclick fixed right-16 bottom-3 z-30 sm:right-16 sm:bottom-4">
      <summary className="border-border-card bg-panel-bg shadow-card m-0 flex h-10 w-10 list-none items-center justify-center rounded-full border p-0 transition-colors hover:brightness-95 [&::-webkit-details-marker]:hidden">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="fill-text-muted"
            d="M18.113 13.03a6 6 0 0 0 .057-.806c0-.28-.025-.542-.057-.806l1.735-1.357a.415.415 0 0 0 .099-.526l-1.645-2.846a.41.41 0 0 0-.502-.18l-2.048.822a6 6 0 0 0-1.39-.806l-.312-2.18A.4.4 0 0 0 13.647 4h-3.29a.4.4 0 0 0-.403.345l-.313 2.18a6.3 6.3 0 0 0-1.39.806l-2.047-.823a.4.4 0 0 0-.502.181L4.057 9.535a.405.405 0 0 0 .099.526l1.735 1.357a7 7 0 0 0-.058.806c0 .272.025.543.058.806l-1.735 1.357a.415.415 0 0 0-.099.527l1.645 2.845c.099.181.32.247.502.181l2.047-.822q.64.495 1.39.806l.313 2.18a.4.4 0 0 0 .403.345h3.29a.4.4 0 0 0 .403-.346l.312-2.179a6.3 6.3 0 0 0 1.39-.806l2.048.822c.19.074.403 0 .502-.18l1.645-2.846a.415.415 0 0 0-.1-.527zm-6.111 2.073a2.88 2.88 0 0 1-2.879-2.879 2.88 2.88 0 0 1 2.879-2.878 2.88 2.88 0 0 1 2.878 2.878 2.88 2.88 0 0 1-2.878 2.879"
          />
        </svg>
      </summary>
      <div className="border-border-dropdown bg-panel-bg shadow-dropdown absolute right-0 bottom-[calc(100%+6px)] left-auto z-1200 flex max-h-[20em] w-[min(20rem,calc(100vw-1rem))] flex-col gap-1.5 overflow-y-auto rounded-md border p-2.5">
        {settings.length > 0 ? (
          settings.map((component) => component)
        ) : (
          <p>Currently Empty</p>
        )}
      </div>
    </details>
  );
}

export function Slider({
  title,
  size,
  setSize,
}: {
  title: string;
  size: number;
  setSize: (size: number) => void;
}) {
  return (
    <div key={title}>
      <div>
        {title}: {size}
      </div>
      <input
        type="range"
        max="100"
        min="0"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
      ></input>
    </div>
  );
}
