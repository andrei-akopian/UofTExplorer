/**
 * Type definitions for API responses and data structures
 */

export interface GraphNode {
  id: string
  label: string
  code?: string
  depth?: number
  x?: number
  y?: number
  targetRadius?: number
  size: number
  color: string
  font?: { size: number }
  [key: string]: any
}

export interface GraphEdge {
  from: string
  to: string
  [key: string]: any
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  search?: string
  curr_query?: QueryInfo
  should_open_course_panel?: boolean
  [key: string]: any
}

export interface QueryInfo {
  type: 'course' | 'program' | 'department' | 'all' | ''
  code: string
  name: string
}

export interface CourseInfo {
  id: string
  code: string
  name: string
  description?: string
  credits?: number
  prerequisites?: string[]
  corequisites?: string[]
  exclusions?: string[]
  breadth?: string
  crNcr?: boolean
  [key: string]: any
}

export interface SearchResult {
  id: string
  label: string
  code?: string
  type?: 'course' | 'program' | 'department'
  prerequisites?: string
}

export interface GlobalStats {
  [key: string]: number | string | boolean
}

export interface PathFinderRequest {
  completed: string[]
  desired: string[]
  avoided?: string[]
}

export interface PathFinderResponse {
  path: string[]
  length: number
  feasible: boolean
  message?: string
}

export interface FilterOptions {
  crNcr: string[]
  departments: string[]
  breadthRequirements: string[]
}
