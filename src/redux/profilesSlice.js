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
      let filtered = state.allProfiles

      // Apply userType filter FIRST
      if (filters.userType && filters.userType !== "all") {
        filtered = filtered.filter(profile => profile.userType === filters.userType)
      }

      // Now apply profile-specific filters (check each profile individually)
      filtered = filtered.filter(profile => {
        const isSpa = profile.userType === 'spa' // ✅ Check EACH profile

        // Gender filter - skip for spas
        if (filters.gender && filters.gender !== "all") {
          if (profile.gender?.toLowerCase() !== filters.gender.toLowerCase()) return false
        }

        // Body Type filter - skip for spas
        if (filters.bodyType && filters.bodyType !== "all") {
          if (profile.bodyType?.toLowerCase() !== filters.bodyType.toLowerCase()) return false
        }

        // Breast Size filter - skip for spas
        if (filters.breastSize && filters.breastSize !== "all") {
          if (profile.breastSize?.toLowerCase() !== filters.breastSize.toLowerCase()) return false
        }

        // Serves Who filter - skip for spas
        if (filters.servesWho && filters.servesWho !== "all") {
          if (profile.servesWho?.toLowerCase() !== filters.servesWho.toLowerCase()) return false
        }

        // Sexual Orientation filter - skip for spas
        if (filters.sexualOrientation && filters.sexualOrientation !== "all") {
          if (profile.sexualOrientation?.toLowerCase() !== filters.sexualOrientation.toLowerCase()) return false
        }

        // Ethnicity filter - skip for spas
        if (filters.ethnicity && filters.ethnicity !== "all") {
          if (profile.ethnicity?.toLowerCase() !== filters.ethnicity.toLowerCase()) return false
        }

        // Age range filter - skip for spas
        if (!isSpa && filters.ageRange) {
          const minAge = Math.max(18, filters.ageRange.min || 18)
          const maxAge = filters.ageRange.max || 99

          const age = profile.age
          if (!age || age < 18) return false
          if (age < minAge || age > maxAge) return false
        }

        // Service Type filter - applies to ALL including spas
        if (filters.serviceType && filters.serviceType !== "all") {
          if (profile.serviceType?.toLowerCase() !== filters.serviceType.toLowerCase()) return false
        }

        // Specific service filter - applies to ALL including spas
        if (filters.specificService && filters.specificService !== "all") {
          const hasService = profile.services?.some(service =>
            service.name?.toLowerCase().includes(filters.specificService.toLowerCase())
          )
          if (!hasService) return false
        }

        // County filter - applies to ALL
        if (filters.county) {
          if (profile.location?.county?.toLowerCase() !== filters.county.toLowerCase()) return false
        }

        return true
      })

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