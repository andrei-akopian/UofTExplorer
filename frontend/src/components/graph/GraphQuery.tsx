import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  manualFetch,
}: {
  data: GraphData;
  setData: (data: GraphData) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setMessage: (message: string) => void;
  setMessageType: (type: "info" | "success" | "error") => void;
  manualFetch: string;
}) {
  void data;

  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<QueryFilters>({
    cr_ncr: [],
    departments: [],
    breadth_requirements: [],
  });
  const [error, setError] = useState<string | null>(null);

  const [manualFetchArg, setManualFetchArg] = useState<string>("");

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
      // Determine which graph page we're on, default to 2d
      const isGraph3D = location.pathname.includes("/graph/3d");
      const graphPath = isGraph3D ? "/graph/3d" : "/graph/2d";
      // Redirect to graph page with search query parameter
      navigate(`${graphPath}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    if (manualFetch.trim()) {
      setQuery(manualFetch);
      setManualFetchArg(manualFetch);
    }
  }, [manualFetch]);

  useEffect(() => {
    if (manualFetchArg.trim()) {
      fetchGraph();
    }
  }, [manualFetchArg]);

  return (
    <div className="absolute top-2 left-1/2 z-20 flex w-[calc(100%-1rem)] -translate-x-1/2 flex-col content-start items-stretch justify-center gap-2 sm:top-3 sm:w-full sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5 sm:px-4">
      <SearchMenu
        query={query}
        setQuery={setQuery}
        filtersHook={filters}
        setFiltersHook={setFilters}
        // onLoadGraph={handleFetchClick}
        // isLoading={isLoading}
      />
      <button
        onClick={handleFetchClick}
        disabled={isLoading}
        className="from-btn-gradient-from to-btn-gradient-to hidden cursor-pointer rounded-md border-0 bg-linear-to-br px-5 py-2 font-sans text-sm text-white transition-colors duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:block sm:w-auto sm:text-base"
      >
        Load Graph
      </button>
      {error && <div className="font-sans text-sm text-red-700">{error}</div>}
    </div>
  );
}
