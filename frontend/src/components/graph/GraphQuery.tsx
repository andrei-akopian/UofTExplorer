import { useCallback, useState } from "react";
import SearchMenu from "./SearchMenu";

import { fetchGraphData } from "../../lib/api";
import type { GraphData, FilterOptions } from "../../types";

type QueryFilters = {
  cr_ncr: string[];
  departments: string[];
  breadth_requirements: string[];
};

const convertFiltersToApiFormat = (
  filters: QueryFilters,
): Partial<FilterOptions> => {
  return {
    crNcr: filters["cr_ncr"] || [],
    departments: filters["departments"] || [],
    breadthRequirements: filters["breadth_requirements"] || [],
  };
};

export default function GraphQuery({
  data,
  setData,
  isLoading,
  setIsLoading,
  setMessage,
  setMessageType,
}: {
  data: GraphData;
  setData: (data: GraphData) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setMessage: (message: string) => void;
  setMessageType: (type: "info" | "success" | "error") => void;
}) {
  void data;

  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<QueryFilters>({
    cr_ncr: [],
    departments: [],
    breadth_requirements: [],
  });
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchGraphData(
        query,
        convertFiltersToApiFormat(filters),
      );
      setData(result);
      setMessage(
        `Currently Displaying: ${query} | Number of Nodes: ${result.nodes.length}`,
      );
      setMessageType("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("Error fetching graph data:", message);
      setError(message);
      setMessage(`Error: ${message}`);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [query, filters]);

  const fetchGraph = async () => {
    fetch();
  };

  const handleFetchClick = () => {
    if (query.trim()) {
      fetchGraph();
    }
  };

  return (
    <div className="absolute top-3 left-3 flex w-[calc(100vw-12rem)] flex-wrap content-start items-center justify-start gap-2.5 p-4">
      <SearchMenu
        query={query}
        setQuery={setQuery}
        filtersHook={filters}
        setFiltersHook={setFilters}
      />
      <button
        onClick={handleFetchClick}
        disabled={isLoading}
        className="bg-primary hover:bg-primary-hover cursor-pointer rounded-md border-0 px-5 py-2 font-sans text-base text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Load Graph
      </button>
      {error && <div className="font-sans text-sm text-red-700">{error}</div>}
    </div>
  );
}
