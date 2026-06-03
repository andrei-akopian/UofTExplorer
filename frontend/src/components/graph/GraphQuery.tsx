import { useCallback, useState } from "react";
import SearchBar from "./SearchBar";

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
}: {
  data: GraphData;
  setData: (data: GraphData) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("Error fetching graph data:", message);
      setError(message);
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
    <div className="absolute top-0 left-20 flex w-[calc(100vw-12rem)] flex-wrap content-start items-center justify-start gap-2.5 p-4">
      <SearchBar
        query={query}
        setQuery={setQuery}
        filtersHook={filters}
        setFiltersHook={setFilters}
      />
      <button
        onClick={handleFetchClick}
        disabled={isLoading}
        className="cursor-pointer rounded-md border-0 bg-[#0066cc] px-5 py-2.5 text-base text-white transition-colors duration-200 hover:bg-[#005bb8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Load Graph
      </button>
      {error && <div className="text-sm text-red-700">{error}</div>}
    </div>
  );
}
