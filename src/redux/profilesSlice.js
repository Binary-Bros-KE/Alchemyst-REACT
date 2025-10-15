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
    applyFilters: (state, action) => {
      const filters = action.payload
      let filtered = [...state.allProfiles]

      // Apply userType filter
      if (filters.userType && filters.userType !== "all") {
        filtered = filtered.filter(profile => profile.userType === filters.userType)
      }

      // Apply county filter
      if (filters.county && filters.county !== "all") {
        filtered = filtered.filter(profile =>
          profile.location?.county?.toLowerCase() === filters.county.toLowerCase()
        )
      }

      // Apply location filter (sub-county)
      if (filters.location) {
        filtered = filtered.filter(profile =>
          profile.location?.location?.toLowerCase().includes(filters.location.toLowerCase())
        )
      }

      // Apply area filter
      if (filters.area) {
        filtered = filtered.filter(profile =>
          profile.location?.area?.toLowerCase().includes(filters.area.toLowerCase())
        )
      }

      // Apply gender filter (exclude spas)
      if (filters.gender && filters.gender !== "all") {
        filtered = filtered.filter(profile => {
          if (profile.userType === "spa") return true
          return profile.personalInfo?.gender === filters.gender || profile.gender === filters.gender
        })
      }

      // Apply bodyType filter (exclude spas)
      if (filters.bodyType && filters.bodyType !== "all") {
        filtered = filtered.filter(profile => {
          if (profile.userType === "spa") return true
          return profile.personalInfo?.bodyType === filters.bodyType || profile.bodyType === filters.bodyType
        })
      }

      // Apply breastSize filter (exclude spas)
      if (filters.breastSize && filters.breastSize !== "all") {
        filtered = filtered.filter(profile => {
          if (profile.userType === "spa") return true
          return profile.personalInfo?.breastSize === filters.breastSize || profile.breastSize === filters.breastSize
        })
      }

      // Separate into profiles and spas
      state.filteredProfiles = filtered.filter(p => p.userType !== "spa")
      state.filteredSpas = filtered.filter(p => p.userType === "spa")
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