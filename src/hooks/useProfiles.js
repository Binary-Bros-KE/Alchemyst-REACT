import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchAllProfiles, applyFilters } from '../redux/profilesSlice'
import { setFilters, setSelectedCounty } from '../redux/uiSlice'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useProfiles = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

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

  // Read URL parameters and apply filters on mount
  useEffect(() => {
    const urlFilters = {}
    
    // Read userType from URL (e.g., ?userType=escort)
    const userType = searchParams.get('userType')
    if (userType && ['escort', 'masseuse', 'of-model', 'spa'].includes(userType)) {
      urlFilters.userType = userType
    }

    // Read serviceType from URL (e.g., ?serviceType=massage)
    const serviceType = searchParams.get('serviceType')
    if (serviceType) {
      urlFilters.serviceType = serviceType
    }

    // Apply URL filters if any exist
    if (Object.keys(urlFilters).length > 0) {
      const newFilters = { ...filters, ...urlFilters }
      dispatch(setFilters(newFilters))
    }
  }, [searchParams, dispatch])

  // Check if data needs to be fetched
  const shouldFetch = useCallback(() => {
    if (allProfiles.length === 0) return true
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

  // Enhanced updateFilters function that can handle URL updates
  const updateFilters = useCallback((newFilters, applyImmediately = true) => {
    console.log('🎛️ Updating filters:', newFilters)
    
    // Update Redux state
    dispatch(setFilters(newFilters))
    
    // Update URL parameters for shareable links
    const newSearchParams = new URLSearchParams()
    
    if (newFilters.userType && newFilters.userType !== 'all') {
      newSearchParams.set('userType', newFilters.userType)
    }
    
    if (newFilters.serviceType && newFilters.serviceType !== 'all') {
      newSearchParams.set('serviceType', newFilters.serviceType)
    }
    
    setSearchParams(newSearchParams)
    
    // Apply filters immediately or wait for "Apply" button
    if (applyImmediately && allProfiles.length > 0) {
      const activeFilters = {
        ...newFilters,
        county: selectedCounty !== 'all' ? selectedCounty : null
      }
      dispatch(applyFilters(activeFilters))
    }
  }, [dispatch, allProfiles.length, selectedCounty, setSearchParams])

  // Manual refresh function
  const refreshProfiles = useCallback(() => {
    console.log('🔄 Manual refresh triggered')
    dispatch(fetchAllProfiles())
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