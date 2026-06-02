/**
 * API Client for communicating with the Flask backend
 * This client handles all API requests and responses
 */

import type {
  GraphData,
  SearchResult,
  GlobalStats,
  PathFinderRequest,
  PathFinderResponse,
  FilterOptions,
} from "../types";

const API_BASE_URL = "/api";

class ApiError extends Error {
  public status: number;
  public data?: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (data) {
      this.data = data;
    }
  }
}

/**
 * Fetch graph data from the backend
 */
export async function fetchGraphData(
  query: string,
  filters?: Partial<FilterOptions>,
): Promise<GraphData> {
  const payload = {
    query,
    cr_ncr: filters?.crNcr || [],
    departments: filters?.departments || [],
    breadth_requirements: filters?.breadthRequirements || [],
  };

  const response = await fetch(`${API_BASE_URL}/fetch_graph`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.error || "Failed to fetch graph",
      error,
    );
  }

  return response.json();
}

/**
 * Search for courses, programs, or departments
 */
export async function searchAll(
  query: string,
  limit = 50,
): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/suggest?`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, limit }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Search failed");
  }

  const data = await response.json();
  return data.results;
}

export async function searchCourses(
  query: string,
  limit = 50,
): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/suggest-courses?`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, limit }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Search failed");
  }

  const data = await response.json();
  return data.results;
}

/**
 * Get global statistics
 */
export async function fetchGlobalStats(): Promise<GlobalStats> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch statistics");
  }

  return response.json();
}

/**
 * Solve path explorer - find shortest path between courses
 */
export async function solvePath(
  request: PathFinderRequest,
): Promise<PathFinderResponse> {
  const payload = {
    completed: request.completed,
    desired: request.desired,
    avoided: request.avoided || [],
  };

  const response = await fetch(`${API_BASE_URL}/solve_path`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.error || "Path solving failed",
      error,
    );
  }

  return response.json();
}

/**
 * Get course details
 */
export async function getCourseDetails(courseCode: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/course/${courseCode}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch course details");
  }

  return response.json();
}

/**
 * Get departments list
 */
export async function getDepartments(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch departments");
  }

  return response.json();
}

export default {
  fetchGraphData,
  searchAll,
  fetchGlobalStats,
  solvePath,
  getCourseDetails,
  getDepartments,
};
