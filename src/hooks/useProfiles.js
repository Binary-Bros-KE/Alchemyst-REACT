import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllProfiles, applyFilters } from '../redux/profilesSlice'
import { setFilters, setSelectedCounty } from '../redux/uiSlice'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useProfiles = () => {
  const dispatch = useDispatch()

  // Get state from Redux
  const {
    allProfiles,
    filteredProfiles,
    filteredSpas,
    loading,
    error,
    lastFetchTime,
    totalCount
  } = useSelector(state => state.profiles)

  const { filters, selectedCounty } = useSelector(state => state.ui)

  // Check if data needs to be fetched
  const shouldFetch = useCallback(() => {
    // No data at all
    if (allProfiles.length === 0) return true
    
    // Data is stale (older than 5 minutes)
    if (!lastFetchTime || (Date.now() - lastFetchTime > CACHE_DURATION)) return true
    
    return false
  }, [allProfiles.length, lastFetchTime])

  // Fetch data on mount if needed
  useEffect(() => {
    if (shouldFetch() && !loading) {
      console.log('📥 Fetching all profiles...')
      dispatch(fetchAllProfiles())
    }
  }, [dispatch, shouldFetch, loading])

  // Apply filters whenever filters or county changes
  useEffect(() => {
    if (allProfiles.length > 0) {
      const activeFilters = {
        ...filters,
        county: selectedCounty !== 'all' ? selectedCounty : null
      }
      console.log('🔄 Applying filters:', activeFilters)
      dispatch(applyFilters(activeFilters))
    }
  }, [dispatch, filters, selectedCounty, allProfiles.length])

  // Manual refresh function
  const refreshProfiles = useCallback(() => {
    console.log('🔄 Manual refresh triggered')
    dispatch(fetchAllProfiles())
  }, [dispatch])

  // Update filters (instant, no API call)
  const updateFilters = useCallback((newFilters) => {
    console.log('🎛️ Updating filters:', newFilters)
    dispatch(setFilters(newFilters))
  }, [dispatch])

  // Update county (instant, no API call)
  const updateCounty = useCallback((county) => {
    console.log('🗺️ Updating county:', county)
    dispatch(setSelectedCounty(county))
  }, [dispatch])

  return {
    // Display data (already filtered)
    profiles: filteredProfiles,
    spas: filteredSpas,
    
    // State
    loading,
    error,
    totalProfiles: allProfiles.length,
    displayedCount: totalCount,
    
    // Actions
    updateFilters,
    updateCounty,
    refreshProfiles,
    
    // Current filters
    filters,
    selectedCounty,
    
    // Metadata
    lastFetchTime,
    isStale: shouldFetch()
  }
}