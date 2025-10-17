import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL

// Single async thunk to fetch ALL profiles
export const fetchAllProfiles = createAsyncThunk(
  'profiles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/profiles/all`)

      if (!response.ok) {
        throw new Error('Failed to fetch profiles')
      }

      const data = await response.json()

      return {
        profiles: data.profiles || [],
        timestamp: Date.now()
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: {
    // All profiles from database (single source of truth)
    allProfiles: [],
    // Filtered profiles for display (computed from allProfiles)
    filteredProfiles: [],
    filteredSpas: [],
    // Loading states
    loading: false,
    error: null,
    // Metadata
    lastFetchTime: null,
    totalCount: 0
  },
  reducers: {
    // Apply filters to allProfiles (INSTANT - no API call)
    // In your profilesSlice.js - update the applyFilters reducer
    applyFilters: (state, action) => {
      const filters = action.payload
      let filtered = state.allProfiles

      // Apply userType filter
      if (filters.userType && filters.userType !== "all") {
        filtered = filtered.filter(profile => profile.userType === filters.userType)
      }

      // Apply gender filter - CORRECTED: matches model's gender field
      if (filters.gender && filters.gender !== "all") {
        filtered = filtered.filter(profile =>
          profile.gender?.toLowerCase() === filters.gender.toLowerCase()
        )
      }

      // Apply bodyType filter - CORRECTED: matches model's bodyType field
      if (filters.bodyType && filters.bodyType !== "all") {
        filtered = filtered.filter(profile =>
          profile.bodyType?.toLowerCase() === filters.bodyType.toLowerCase()
        )
      }

      // Apply breastSize filter - CORRECTED: matches model's breastSize field
      if (filters.breastSize && filters.breastSize !== "all") {
        filtered = filtered.filter(profile =>
          profile.breastSize?.toLowerCase() === filters.breastSize.toLowerCase()
        )
      }

      // Apply serviceType filter - CORRECTED: matches model's serviceType field
      if (filters.serviceType && filters.serviceType !== "all") {
        filtered = filtered.filter(profile =>
          profile.serviceType?.toLowerCase() === filters.serviceType.toLowerCase()
        )
      }

      // Apply servesWho filter - CORRECTED: matches model's servesWho field
      if (filters.servesWho && filters.servesWho !== "all") {
        filtered = filtered.filter(profile =>
          profile.servesWho?.toLowerCase() === filters.servesWho.toLowerCase()
        )
      }

      // Apply sexualOrientation filter - CORRECTED: matches model's sexualOrientation field
      if (filters.sexualOrientation && filters.sexualOrientation !== "all") {
        filtered = filtered.filter(profile =>
          profile.sexualOrientation?.toLowerCase() === filters.sexualOrientation.toLowerCase()
        )
      }

      // Apply ethnicity filter - CORRECTED: matches model's ethnicity field
      if (filters.ethnicity && filters.ethnicity !== "all") {
        filtered = filtered.filter(profile =>
          profile.ethnicity?.toLowerCase() === filters.ethnicity.toLowerCase()
        )
      }

      // Apply specific service filter - NEW: search in services array
      if (filters.specificService && filters.specificService !== "all") {
        filtered = filtered.filter(profile =>
          profile.services?.some(service =>
            service.name?.toLowerCase().includes(filters.specificService.toLowerCase())
          )
        )
      }

      // Apply age range filter - ENHANCED: with strict 18+ validation
      if (filters.ageRange) {
        const minAge = Math.max(18, filters.ageRange.min || 18)
        const maxAge = filters.ageRange.max || 99

        filtered = filtered.filter(profile => {
          const age = profile.age
          if (!age || age < 18) return false // Strict 18+ validation
          return age >= minAge && age <= maxAge
        })
      }

      // Apply county filter
      if (filters.county) {
        filtered = filtered.filter(profile =>
          profile.location?.county?.toLowerCase() === filters.county.toLowerCase()
        )
      }

      // Separate into profiles and spas
      const newProfiles = filtered.filter(p => p.userType !== "spa")
      const newSpas = filtered.filter(p => p.userType === "spa")

      state.filteredProfiles = newProfiles
      state.filteredSpas = newSpas
      state.totalCount = filtered.length
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProfiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        const { profiles, timestamp } = action.payload

        state.loading = false
        state.allProfiles = profiles
        state.filteredProfiles = profiles.filter(p => p.userType !== "spa")
        state.filteredSpas = profiles.filter(p => p.userType === "spa")
        state.lastFetchTime = timestamp
        state.totalCount = profiles.length
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch profiles'
      })
  }
})

export const { applyFilters, clearError } = profilesSlice.actions
export default profilesSlice.reducer