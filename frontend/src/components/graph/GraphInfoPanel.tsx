import { useEffect, useRef, useState } from "react";
import type { GraphData, GraphNode } from "../../types";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// GraphInfoPanel — base shell
// ---------------------------------------------------------------------------

interface PanelProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  cardClassName?: string;
}

export function GraphInfoPanel({
  icon,
  label,
  children,
  cardClassName = "right-0",
}: PanelProps) {
  const [isOpen, setIsOpen] = useState(true);
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

  return (
    <div ref={containerRef} className="relative">
      {isOpen && (
        <div
          className={`border-border-card bg-panel-bg shadow-dropdown ${cardClassName} absolute bottom-12 flex h-[60vh] w-[calc(100vw-1.5rem)] max-w-80 flex-col overflow-hidden rounded-xl border sm:h-112 sm:w-80`}
        >
          {children}
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border-card bg-primary hover:bg-primary-hover shadow-card flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:brightness-95"
        title={isOpen ? `Close ${label}` : `Open ${label}`}
        aria-label={isOpen ? `Close ${label}` : `Open ${label}`}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-text-muted h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          icon
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GraphStatsPanel
// ---------------------------------------------------------------------------

const STAT_ENTRIES: [string, string][] = [
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

const statsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="text-text-muted h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="white"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export function GraphStatsPanel({ graphData }: { graphData: GraphData }) {
  const stats = graphData?.live_stats ?? {};

  return (
    <GraphInfoPanel
      icon={statsIcon}
      label="Graph Statistics"
      cardClassName="right-70"
    >
      <div className="border-border-card border-b px-4 py-3">
        <h2 className="text-text-body text-sm font-semibold">
          Graph Statistics
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {STAT_ENTRIES.map(([label, key]) => (
          <StatRow key={key} label={label} value={stats[key]} />
        ))}
      </div>
    </GraphInfoPanel>
  );
}

// ---------------------------------------------------------------------------
// GraphNodesPanel
// ---------------------------------------------------------------------------

interface GraphNodesPanelProps {
  graphData: GraphData;
  selectedNode?: GraphNode | null;
  onNodeSelect?: (node: GraphNode | null) => void;
}

const nodesIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="text-text-muted h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="white"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6a2 2 0 114 0 2 2 0 01-4 0zm12 0a2 2 0 114 0 2 2 0 01-4 0zM4 18a2 2 0 114 0 2 2 0 01-4 0zm12 0a2 2 0 114 0 2 2 0 01-4 0zM6 8v8m12-8v8M8 6h8m-8 12h8"
    />
  </svg>
);

export function GraphNodesPanel({
  graphData,
  selectedNode,
  onNodeSelect,
}: GraphNodesPanelProps) {
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

  return (
    <GraphInfoPanel icon={nodesIcon} label="Graph Nodes">
      <div className="border-border-card flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-text-body text-sm font-semibold">
          Graph Nodes
          {nodes.length > 0 && (
            <span className="bg-badge-bg text-badge-text ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium">
              {nodes.length}
            </span>
          )}
        </h2>
      </div>

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
            <NodeDetail label="Description" value={activeNode.description} />
          )}
          {activeNode.breadth && (
            <NodeDetail label="Breadth" value={activeNode.breadth} />
          )}
          {activeNode.prerequisites && activeNode.prerequisites.length > 0 && (
            <NodeDetail
              label="Prerequisites"
              value={activeNode.prerequisites}
            />
          )}
          {activeNode.corequisites && activeNode.corequisites.length > 0 && (
            <NodeDetail label="Corequisites" value={activeNode.corequisites} />
          )}
          {activeNode.exclusions && activeNode.exclusions.length > 0 && (
            <NodeDetail label="Exclusions" value={activeNode.exclusions} />
          )}
          {activeNode.crNcr !== undefined && (
            <NodeDetail
              label="CR/NCR"
              value={activeNode.crNcr ? "Eligible" : "Not eligible"}
            />
          )}
        </div>
      ) : (
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-auto h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="gray"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 12h20M16 6l6 6-6 6"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </GraphInfoPanel>
  );
}
