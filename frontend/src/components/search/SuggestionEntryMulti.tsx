export default function SuggestionEntryMulti({
  id,
  title,
  classSize,
  numNodes,
  onClickCallback,
  lookup,
  setLookup,
}: {
  id: string;
  title: string;
  classSize?: string;
  numNodes: number;
  onClickCallback: () => void;
  lookup: Set<string>;
  setLookup: (lookup: Set<string>) => void;
}) {
  return (
    <div
      onClick={() => {
        const tempLookup: Set<string> = new Set();
        for (const ele of lookup) {
          tempLookup.add(ele);
        }
        if (tempLookup.has(id)) {
          tempLookup.delete(id);
        } else {
          tempLookup.add(id);
        }
        setLookup(tempLookup);
        onClickCallback();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className="border-border-card text-text-body hover:bg-surface-1 cursor-pointer border-b px-3 py-2 text-sm last:border-b-0"
      style={{
        backgroundColor: lookup.has(id) ? "var(--color-surface-2)" : "",
      }}
    >
      <div className="flex">
        <div className="mr-2.5 flex justify-center">
          <input type="checkbox" checked={lookup.has(id)}></input>
        </div>
        <div style={{ display: "initial", flex: 1 }}>
          <div className="flex items-start justify-between gap-3">
            <span className="text-text-body min-w-0 font-mono text-sm">
              {id}
            </span>
            {classSize ? (
              <span className="text-text-subtle shrink-0 text-xs">
                Class size: {classSize}
              </span>
            ) : (
              <span />
            )}
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div className="text-text-muted min-w-0 text-xs wrap-break-word whitespace-normal">
              {title}
            </div>
            {numNodes > 50 && (
              <span className="text-warning-text shrink-0 text-xs">
                Large graph ({numNodes} nodes)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
