import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchMenu from "./SearchMenu";

import { fetchGraphData } from "../../lib/api";
import type { GraphData, FilterOptions } from "../../types";
import { filterGraph } from "../../lib/filterGraph";

type QueryFilters = {
  cr_ncr: string[];
  departments: string[];
  breadth_requirements: string[];
};

const convertFiltersToApiFormat = (filters: QueryFilters): FilterOptions => {
  return {
    crNcr: filters["cr_ncr"] || [],
    departments: filters["departments"] || [],
    breadthRequirements: filters["breadth_requirements"] || [],
  };
};

export default function GraphQuery({
  setData,
  isLoading,
  setIsLoading,
  setMessage,
  setMessageType,
  manualFetch,
}: {
  setData: (data: GraphData) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setMessage: (message: string) => void;
  setMessageType: (type: "info" | "success" | "error") => void;
  manualFetch: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<QueryFilters>({
    cr_ncr: [],
    departments: [],
    breadth_requirements: [],
  });
  const [, setError] = useState<string | null>(null);

  const [manualFetchArg, setManualFetchArg] = useState<string>("");
  const unfilteredDataRef = useRef<GraphData | null>(null);
  const loadedQueryRef = useRef<string>("");

  const fetch = useCallback(async () => {
    setError(null);

    const normalizedQuery = query.trim().toUpperCase();
    const apiFilters = convertFiltersToApiFormat(filters);

    if (
      unfilteredDataRef.current &&
      loadedQueryRef.current === normalizedQuery
    ) {
      const result = filterGraph(unfilteredDataRef.current, apiFilters);
      setData(result);
      setMessage(`Number of nodes: ${result.nodes.length}`);
      setMessageType("success");
      return;
    }

    setIsLoading(true);
    try {
      const unfilteredResult = await fetchGraphData(query);
      unfilteredDataRef.current = unfilteredResult;
      loadedQueryRef.current = normalizedQuery;
      const result = filterGraph(unfilteredResult, apiFilters);
      setData(result);
      setMessage(`Number of nodes: ${result.nodes.length}`);
      setMessageType("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("Error fetching graph data:", message);
      setError(message);
      setMessage(`${message}`);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [filters, query, setData, setIsLoading, setMessage, setMessageType]);

  const fetchGraph = async () => {
    fetch();
  };

  const handleFetchClick = () => {
    const trimmed = query.trim();
    if (trimmed) {
      // Determine which graph page we're on, default to 2d
      const isGraph3D = location.pathname.includes("/graph/3d");
      const graphPath = isGraph3D ? "/graph/3d" : "/graph/2d";
      if (loadedQueryRef.current === trimmed.toUpperCase()) {
        // Reuse the loaded graph and apply the selected filters locally.
        fetchGraph();
      } else {
        // Redirect to graph page with search query parameter
        navigate(`${graphPath}?search=${encodeURIComponent(trimmed)}`);
      }
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
    <div className="absolute top-13 left-1/2 z-40 flex w-[calc(100%-1rem)] -translate-x-1/2 flex-col content-start items-stretch gap-2 sm:top-3 sm:w-full sm:items-center sm:gap-2.5 sm:px-4 sm:pr-28">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <SearchMenu
          query={query}
          setQuery={setQuery}
          filtersHook={filters}
          setFiltersHook={setFilters}
          onLoadGraph={handleFetchClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
