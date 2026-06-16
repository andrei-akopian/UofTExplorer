import GraphStatusOverlay from "./GraphStatusOverlay";
import GraphInfoMenu from "./GraphInfoMenu";
import { GraphStatsPanel, GraphNodesPanel } from "./GraphInfoPanel";
import type { GraphData, GraphNode } from "../../types";

interface GraphBottomInfoProps {
  message: string;
  messageType: "info" | "success" | "error";
  graphData: GraphData;
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
  nodesOpen: boolean;
  onNodesOpenChange: (open: boolean) => void;
  statsOpen: boolean;
  onStatsOpenChange: (open: boolean) => void;
}

export default function GraphBottomInfo({
  message,
  messageType,
  graphData,
  selectedNode,
  onNodeSelect,
  nodesOpen,
  onNodesOpenChange,
  statsOpen,
  onStatsOpenChange,
}: GraphBottomInfoProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-20 flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
      <GraphStatusOverlay
        currentQueryCode={graphData.curr_query?.code}
        currentQueryName={graphData.curr_query?.name}
        message={message}
        messageType={messageType}
      />
      <GraphInfoMenu>
        <GraphStatsPanel
          graphData={graphData}
          isOpen={statsOpen}
          onOpenChange={(open) => {
            if (open && window.innerWidth < 640) onNodesOpenChange(false);
            onStatsOpenChange(open);
          }}
          cardClassName={
            nodesOpen ? "right-[60px] sm:right-70" : "right-[-48px] sm:right-0"
          }
        />
        <GraphNodesPanel
          graphData={graphData}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          isOpen={nodesOpen}
          onOpenChange={(open) => {
            if (open && window.innerWidth < 640) onStatsOpenChange(false);
            onNodesOpenChange(open);
          }}
          cardClassName="right-0"
        />
      </GraphInfoMenu>
    </div>
  );
}
