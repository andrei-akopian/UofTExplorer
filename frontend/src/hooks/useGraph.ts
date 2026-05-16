/**
 * React hooks for common graph operations
 */

import { useState, useCallback } from 'react'
import type { GraphData, FilterOptions } from '../types'
import { fetchGraphData, searchCourses } from '../lib/api'

interface UseFetchGraphReturn {
  data: GraphData | null
  loading: boolean
  error: string | null
  fetch: (query: string, filters?: Partial<FilterOptions>) => Promise<void>
}

/**
 * Hook for fetching graph data with loading and error states
 */
export function useFetchGraph(): UseFetchGraphReturn {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (query: string, filters?: Partial<FilterOptions>) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchGraphData(query, filters)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetch }
}

interface UseSearchReturn {
  results: any[]
  loading: boolean
  error: string | null
  search: (query: string) => Promise<void>
  clear: () => void
}

/**
 * Hook for searching courses with debouncing
 */
export function useSearch(debounceDelay = 300): UseSearchReturn {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const search = useCallback(
    async (query: string) => {
      // Clear previous timeout
      if (timeoutId) clearTimeout(timeoutId)

      if (!query.trim()) {
        setResults([])
        return
      }

      const id = setTimeout(async () => {
        setLoading(true)
        setError(null)

        try {
          const data = await searchCourses(query)
          setResults(data)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Search failed'
          setError(message)
        } finally {
          setLoading(false)
        }
      }, debounceDelay)

      setTimeoutId(id)
    },
    [debounceDelay, timeoutId]
  )

  const clear = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, search, clear }
}

interface UseLocalStorageReturn<T> {
  value: T
  set: (value: T) => void
  remove: () => void
}

/**
 * Hook for persisting state to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue)
        window.localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error('localStorage error:', error)
      }
    },
    [key]
  )

  const remove = useCallback(() => {
    try {
      setValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage error:', error)
    }
  }, [key, initialValue])

  return { value, set, remove }
}
