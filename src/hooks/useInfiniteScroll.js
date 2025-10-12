"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Custom hook for infinite scroll pagination
 */
export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 20,
    threshold = 0.8, // Trigger when 80% scrolled
  } = options

  const [data, setData] = useState([])
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  const observerRef = useRef(null)
  const loadingRef = useRef(false)

  // Fetch data
  const fetchData = useCallback(
    async (pageNum) => {
      if (loadingRef.current || !hasMore) return

      loadingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const result = await fetchFunction(pageNum, pageSize)

        if (result.data && result.data.length > 0) {
          setData((prev) => (pageNum === 1 ? result.data : [...prev, ...result.data]))
          setHasMore(result.hasMore !== false)
        } else {
          setHasMore(false)
        }
      } catch (err) {
        console.error("[v0] Infinite scroll fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [fetchFunction, pageSize, hasMore],
  )

  // Load more data
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }, [loading, hasMore])

  // Reset pagination
  const reset = useCallback(() => {
    setData([])
    setPage(initialPage)
    setHasMore(true)
    setError(null)
  }, [initialPage])

  // Fetch data when page changes
  useEffect(() => {
    fetchData(page)
  }, [page, fetchData])

  // Intersection Observer for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore()
        }
      },
      { threshold },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [loading, hasMore, loadMore, threshold])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    observerRef,
  }
}
