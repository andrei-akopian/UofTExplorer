import { useEffect, useRef, useState } from "react";
import type { GraphData, GraphNode } from "../../types";

interface GraphInfoPanelProps {
  graphData: GraphData;
  selectedNode?: GraphNode | null;
  onNodeSelect?: (node: GraphNode | null) => void;
}

function NodeDetail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-muted text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
      <span className="text-text-body text-sm wrap-break-word">{value}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-border-card flex items-start justify-between gap-2 border-b py-1.5 text-sm last:border-b-0">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-body font-medium tabular-nums">
        {value ?? "—"}
      </span>
    </div>
  );
}

type Tab = "stats" | "nodes";

export default function GraphInfoPanel({
  graphData,
  selectedNode,
  onNodeSelect,
}: GraphInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const [internalSelected, setInternalSelected] = useState<GraphNode | null>(
    null,
  );

  const activeNode =
    selectedNode !== undefined ? selectedNode : internalSelected;

  const handleNodeSelect = (node: GraphNode | null) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    } else {
      setInternalSelected(node);
    }
  };

  const nodes = graphData?.nodes ?? [];
  const stats = graphData?.live_stats ?? {};

  const statEntries: [string, string][] = [
    ["Courses", "Number of courses"],
    ["Requisites", "Number of requisites"],
    ["Breadth 1", "Number of courses in breadth 1"],
    ["Breadth 2", "Number of courses in breadth 2"],
    ["Breadth 3", "Number of courses in breadth 3"],
    ["Breadth 4", "Number of courses in breadth 4"],
    ["Breadth 5", "Number of courses in breadth 5"],
    ["CR/NCR eligible", "Number of courses eligible for CR/NCR"],
    ["CR/NCR ineligible", "Number of courses not eligible for CR/NCR"],
  ];

  const tabClass = (tab: Tab) =>
    `flex-1 py-2 text-xs font-semibold transition-colors duration-150 border-b-2 ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-text-muted hover:text-text-secondary"
    }`;

  return (
    <div
      ref={containerRef}
      className="fixed right-3 bottom-3 z-30 flex flex-col items-end gap-2 sm:right-4 sm:bottom-4"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border-card bg-panel-bg shadow-card flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:brightness-95"
        title={isOpen ? "Close panel" : "Open panel"}
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-text-muted h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="border-border-card bg-panel-bg shadow-dropdown flex h-[60vh] w-[calc(100vw-1.5rem)] max-w-80 flex-col overflow-hidden rounded-xl border sm:h-112 sm:w-80">
          {/* Tabs */}
          <div className="border-border-card flex border-b">
            <button
              className={tabClass("stats")}
              onClick={() => setActiveTab("stats")}
            >
              Graph Statistics
            </button>
            <button
              className={tabClass("nodes")}
              onClick={() => {
                setActiveTab("nodes");
                handleNodeSelect(null);
              }}
            >
              Graph Nodes
              {nodes.length > 0 && (
                <span className="bg-badge-bg text-badge-text ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {nodes.length}
                </span>
              )}
            </button>
          </div>

          {/* Stats tab */}
          {activeTab === "stats" && (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {statEntries.map(([label, key]) => (
                <StatRow key={key} label={label} value={stats[key]} />
              ))}
            </div>
          )}

          {/* Nodes tab */}
          {activeTab === "nodes" && (
            <>
              {/* Back button when a node is selected */}
              {activeNode && (
                <div className="border-border-card flex items-center border-b px-4 py-2">
                  <button
                    onClick={() => handleNodeSelect(null)}
                    className="text-text-muted hover:text-text-secondary text-xs transition-colors"
                  >
                    ← Back to list
                  </button>
                </div>
              )}

              {nodes.length === 0 ? (
                <div className="text-text-muted flex flex-1 items-center justify-center text-sm">
                  No nodes in graph
                </div>
              ) : activeNode ? (
                /* Detail view */
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: activeNode.color ?? "#A0B9DB" }}
                    />
                    <span className="text-text-body text-base leading-tight font-semibold">
                      {activeNode.label}
                    </span>
                  </div>
                  {activeNode.code && activeNode.code !== activeNode.label && (
                    <NodeDetail label="Code" value={activeNode.code} />
                  )}
                  {activeNode.id && !activeNode.code && (
                    <NodeDetail label="ID" value={activeNode.id} />
                  )}
                  {activeNode.title && (
                    <NodeDetail label="Title" value={activeNode.title} />
                  )}
                  {activeNode.description && (
                    <NodeDetail
                      label="Description"
                      value={activeNode.description}
                    />
                  )}
                  {activeNode.breadth && (
                    <NodeDetail label="Breadth" value={activeNode.breadth} />
                  )}
                  {activeNode.prerequisites &&
                    activeNode.prerequisites.length > 0 && (
                      <NodeDetail
                        label="Prerequisites"
                        value={activeNode.prerequisites}
                      />
                    )}
                  {activeNode.corequisites &&
                    activeNode.corequisites.length > 0 && (
                      <NodeDetail
                        label="Corequisites"
                        value={activeNode.corequisites}
                      />
                    )}
                  {activeNode.exclusions &&
                    activeNode.exclusions.length > 0 && (
                      <NodeDetail
                        label="Exclusions"
                        value={activeNode.exclusions}
                      />
                    )}
                  {activeNode.previousCourseCodes &&
                    activeNode.previousCourseCodes.length > 0 && (
                      <NodeDetail
                        label="Previously known as"
                        value={activeNode.previousCourseCodes.join(", ")}
                      />
                    )}
                  {activeNode.crNcr !== undefined && (
                    <NodeDetail
                      label="CR/NCR"
                      value={activeNode.crNcr ? "Eligible" : "Not eligible"}
                    />
                  )}
                  {activeNode.depth !== undefined &&
                    activeNode.depth !== null && (
                      <NodeDetail
                        label="Depth"
                        value={String(activeNode.depth)}
                      />
                    )}
                </div>
              ) : (
                /* Node list view */
                <ul className="divide-border-card flex-1 divide-y overflow-y-auto">
                  {nodes.map((node) => (
                    <li key={node.id}>
                      <button
                        onClick={() => handleNodeSelect(node)}
                        className="hover:bg-surface-1 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      >
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full border border-gray-300"
                          style={{ backgroundColor: node.color ?? "#A0B9DB" }}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="text-text-body truncate text-sm font-medium">
                            {node.label}
                          </span>
                          {node.code && node.code !== node.label && (
                            <span className="text-text-muted truncate text-xs">
                              {node.code}
                            </span>
                          )}
                        </span>
                        {node.depth !== undefined && node.depth !== null && (
                          <span className="text-text-subtle ml-auto shrink-0 text-xs">
                            depth {node.depth}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
