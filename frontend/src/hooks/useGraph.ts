/**
 * React hooks for common graph operations
 */

import { useState, useCallback, useMemo } from "react";
import type { GraphData, FilterOptions, DirectionNode } from "../types";
import {
  fetchGraphData,
  searchAll,
  searchCourses,
  getImmediatePostreqs,
  getPathExplorerSolution,
} from "../lib/api";

interface UseFetchGraphReturn {
  data: GraphData | null;
  loading: boolean;
  error: string | null;
  fetch: (query: string, filters?: Partial<FilterOptions>) => Promise<void>;
}

/**
 * Hook for fetching graph data with loading and error states
 */
export function useFetchGraph(): UseFetchGraphReturn {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (query: string, filters?: Partial<FilterOptions>) => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchGraphData(query, filters);
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return useMemo(
    () => ({ data, loading, error, fetch }),
    [data, loading, error, fetch],
  );
}

interface UseImmediatePostreqsReturn {
  data: GraphData | null;
  loading: boolean;
  error: string | null;
  fetch: (courseCodes: string[]) => Promise<void>;
}

export function useImmediatePostreqs(): UseImmediatePostreqsReturn {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (courseCodes: string[]) => {
    if (!courseCodes.length) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getImmediatePostreqs(courseCodes);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

export function usePathFinderSolution() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (request: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPathExplorerSolution(request);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

/**
 * Hook for searching courses with debouncing
 */

interface UseSearchReturn {
  results: any[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useSearch(
  debounceDelay = 300,
  coursesOnly = false,
): UseSearchReturn {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // @ts-expect-error: NodeJS.Timeout is not defined in the environment
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const search = useCallback(
    async (query: string) => {
      // Clear previous timeout
      if (timeoutId) clearTimeout(timeoutId);

      if (!query.trim()) {
        setResults([]);
        return;
      }

      const id = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await (coursesOnly
            ? searchCourses(query)
            : searchAll(query));
          setResults(data);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Search failed";
          setError(message);
        } finally {
          setLoading(false);
        }
      }, debounceDelay);

      setTimeoutId(id);
    },
    [debounceDelay, timeoutId],
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return useMemo(
    () => ({ results, loading, error, search, clear }),
    [results, loading, error, search, clear],
  );
}

/**
 * Hook for Directional Graph
 */

export function useCreateDirectedGraph(
  data: GraphData,
  reverse: boolean = false,
): {
  directedGraph: Map<string, DirectionNode>;
  findConnected: (origin: string, visited?: Set<string>) => Set<string>;
} {
  const directedGraph = useMemo(() => {
    const dict = new Map<string, DirectionNode>();

    for (const edge of data.edges) {
      let edgeFrom = edge.from;
      let edgeTo = edge.to;

      if (reverse) {
        edgeFrom = edge.to;
        edgeTo = edge.from;
      }

      if (!dict.has(edgeTo)) {
        dict.set(edgeTo, { id: edgeTo, targets: [] });
      }

      if (!dict.has(edgeFrom)) {
        dict.set(edgeFrom, { id: edgeFrom, targets: [] });
      }

      const toNode = dict.get(edgeTo);
      if (toNode) {
        dict.get(edgeFrom)?.targets.push(toNode);
      }
    }

    return dict;
  }, [data, reverse]);

  const findConnected = useCallback(
    (origin: string, visited = new Set<string>()) => {
      const curr = directedGraph.get(origin);

      if (!curr) {
        console.warn("cannot find origin in directedGraph", {
          origin,
          directedGraphSize: directedGraph.size,
        });
        return visited;
      }

      if (visited.has(curr.id)) {
        return visited;
      }

      visited.add(curr.id);

      for (const tar of curr.targets) {
        if (!visited.has(tar.id)) {
          findConnected(tar.id, visited);
        }
      }

      return visited;
    },
    [directedGraph],
  );

  return { directedGraph, findConnected };
}

interface UseLocalStorageReturn<T> {
  value: T;
  set: (value: T) => void;
  remove: () => void;
}

/**
 * Hook for persisting state to localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue);
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error("localStorage error:", error);
      }
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      setValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("localStorage error:", error);
    }
  }, [key, initialValue]);

  return { value, set, remove };
}
