import { useState } from "react";
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
      <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </span>
      <span className="text-sm wrap-break-word text-gray-800">{value}</span>
    </div>
  );
}

export default function GraphInfoPanel({
  graphData,
  selectedNode,
  onNodeSelect,
}: GraphInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50"
        title={isOpen ? "Close node info panel" : "Open node info panel"}
        aria-label={isOpen ? "Close node info panel" : "Open node info panel"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
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
        <div className="flex h-112 w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Graph Nodes
              {nodes.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {nodes.length}
                </span>
              )}
            </h2>
            {activeNode && (
              <button
                onClick={() => handleNodeSelect(null)}
                className="text-xs text-gray-400 transition-colors hover:text-gray-600"
              >
                Back to list
              </button>
            )}
          </div>

          {nodes.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
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
                <span className="text-base leading-tight font-semibold text-gray-900">
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
              {activeNode.exclusions && activeNode.exclusions.length > 0 && (
                <NodeDetail label="Exclusions" value={activeNode.exclusions} />
              )}
              {activeNode.crNcr !== undefined && (
                <NodeDetail
                  label="CR/NCR"
                  value={activeNode.crNcr ? "Eligible" : "Not eligible"}
                />
              )}
              {activeNode.depth !== undefined && activeNode.depth !== null && (
                <NodeDetail label="Depth" value={String(activeNode.depth)} />
              )}
            </div>
          ) : (
            /* Node list view */
            <ul className="flex-1 divide-y divide-gray-50 overflow-y-auto">
              {nodes.map((node) => (
                <li key={node.id}>
                  <button
                    onClick={() => handleNodeSelect(node)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: node.color ?? "#A0B9DB" }}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-gray-800">
                        {node.label}
                      </span>
                      {node.code && node.code !== node.label && (
                        <span className="truncate text-xs text-gray-400">
                          {node.code}
                        </span>
                      )}
                    </span>
                    {node.depth !== undefined && node.depth !== null && (
                      <span className="ml-auto shrink-0 text-xs text-gray-300">
                        depth {node.depth}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
