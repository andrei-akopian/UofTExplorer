import { useCallback, useState } from "react";
import SearchBar from "./SearchBar";

import { fetchGraphData } from "../lib/api";
import type { GraphData, FilterOptions } from "../types";

const convertFiltersToApiFormat = (filters: Object): Partial<FilterOptions> => {
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
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<Object>({});
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
    <div
      style={{
        position: "absolute",
        padding: "1em",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        alignContent: "flex-start",
        justifyContent: "flex-start",
        top: "0px",
        left: "5em",
        width: "calc(100vw - 12rem)",
      }}
    >
      <SearchBar
        query={query}
        setQuery={setQuery}
        filtersHook={filters}
        setFiltersHook={setFilters}
      />
      <button
        onClick={handleFetchClick}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Load Graph
      </button>
    </div>
  );
}
