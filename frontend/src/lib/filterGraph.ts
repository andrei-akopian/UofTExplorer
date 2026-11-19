import type { FilterOptions, GraphData, GraphNode } from "../types";

const FILTERED_NODE_COLOR = "#77BA79";

function hasFilters(filters: FilterOptions): boolean {
  return (
    filters.crNcr.length > 0 ||
    filters.departments.length > 0 ||
    filters.breadthRequirements.length > 0
  );
}

function filtersForGraph(
  graph: GraphData,
  filters: FilterOptions,
): FilterOptions {
  if (hasFilters(filters) || graph.curr_query?.type !== "department") {
    return filters;
  }

  return {
    ...filters,
    departments: [graph.curr_query.code],
  };
}

function matchesFilters(node: GraphNode, filters: FilterOptions): boolean {
  if (!node.code) return false;

  const crNcrMatches =
    filters.crNcr.length === 0 ||
    filters.crNcr.some(
      (eligibility) =>
        (eligibility === "eligible" && node.crNcr === true) ||
        (eligibility === "ineligible" && node.crNcr === false),
    );
  const departmentMatches =
    filters.departments.length === 0 ||
    filters.departments.includes(node.department ?? "");
  const breadthMatches =
    filters.breadthRequirements.length === 0 ||
    filters.breadthRequirements.some((breadth) =>
      node.breadthRequirements?.includes(breadth),
    );

  return crNcrMatches && departmentMatches && breadthMatches;
}

/**
 * Apply graph-query filters without changing the loaded subgraph.
 *
 * Callers must pass the original, unfiltered response so clearing or changing
 * filters restores each node's backend-provided base/special colour.
 */
export function filterGraph(
  graph: GraphData,
  filters: FilterOptions,
): GraphData {
  const effectiveFilters = filtersForGraph(graph, filters);
  const shouldFilter = hasFilters(effectiveFilters);

  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      color:
        shouldFilter && matchesFilters(node, effectiveFilters)
          ? FILTERED_NODE_COLOR
          : node.color,
    })),
  };
}
