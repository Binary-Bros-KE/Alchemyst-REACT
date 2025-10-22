import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchAllProfiles, applyFilters } from '../redux/profilesSlice'
import { setFilters, setSelectedCounty } from '../redux/uiSlice'
import { useEffect, useCallback, useMemo } from 'react'

const CACHE_DURATION = 60 * 60 * 1000 // 5 minutes

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
  // Read URL parameters and apply filters on mount
  useEffect(() => {
    const urlFilters = {
      // Reset to defaults first
      userType: 'all',
      gender: 'all',
      bodyType: 'all',
      breastSize: 'all',
      serviceType: 'all',
      sexualOrientation: 'all',
      ethnicity: 'all',
      servesWho: 'all',
      specificService: 'all',
      ageRange: { min: 18, max: null }
    }

    // Read userType from URL (e.g., ?userType=escort)
    const userType = searchParams.get('userType')
    if (userType && ['escort', 'masseuse', 'of-model', 'spa'].includes(userType)) {
      urlFilters.userType = userType
    }

    // FIX: Read specificService from URL (NOT serviceType)
    const specificService = searchParams.get('specificService')
    if (specificService) {
      urlFilters.specificService = specificService
    }

    // Always apply the filters (either from URL or defaults)
    dispatch(setFilters(urlFilters))
  }, [searchParams, dispatch])

  // Check if any filters are active (excluding min age 18)
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.userType && filters.userType !== 'all') ||
      (filters.gender && filters.gender !== 'all') ||
      (filters.bodyType && filters.bodyType !== 'all') ||
      (filters.breastSize && filters.breastSize !== 'all') ||
      (filters.serviceType && filters.serviceType !== 'all') ||
      (filters.sexualOrientation && filters.sexualOrientation !== 'all') ||
      (filters.ethnicity && filters.ethnicity !== 'all') ||
      (filters.servesWho && filters.servesWho !== 'all') ||
      (filters.specificService && filters.specificService !== 'all') ||
      (filters.ageRange?.max !== null)
    )
  }, [filters])

  // Add this shuffle function at the top
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }


  // Shuffle profiles only when no filters are active
  const displayProfiles = useMemo(() => {
    if (hasActiveFilters) {
      // Return sorted by package when filters are active
      return filteredProfiles
    } else {
      // Return shuffled when no filters
      return shuffleArray(filteredProfiles)
    }
  }, [filteredProfiles, hasActiveFilters])


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

    // FIX: Only add specificService to URL, not serviceType
    if (newFilters.specificService && newFilters.specificService !== 'all') {
      newSearchParams.set('specificService', newFilters.specificService)
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
    profiles: displayProfiles,
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
    hasActiveFilters,

    // Metadata
    lastFetchTime,
    isStale: shouldFetch()
  }
}