import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = import.meta.env.VITE_API_URL

// Async thunk for fetching profile details
export const fetchProfileDetails = createAsyncThunk(
  'profileDetails/fetchProfileDetails',
  async ({ userType, userId }) => {
    const response = await fetch(`${API_URL}/profiles/${userType}/${userId}`)
    const data = await response.json()

    if (data.success) {
      return {
        profile: data.data,
        userType,
        userId,
        timestamp: Date.now()
      }
    } else {
      throw new Error('Profile not found')
    }
  }
)

// Async thunk for fetching similar profiles
export const fetchSimilarProfiles = createAsyncThunk(
  'profileDetails/fetchSimilarProfiles',
  async ({ profileId, county, location, userType }) => {
    const response = await fetch(
      `${API_URL}/profiles/similar?` +
      `profileId=${profileId}&` +
      `county=${county}&` +
      `location=${location}&` +
      `userType=${userType}&` +
      `limit=10`
    )
    const data = await response.json()

    if (data.success) {
      return data.data.profiles || []
    } else {
      throw new Error('Failed to fetch similar profiles')
    }
  }
)

const profileDetailsSlice = createSlice({
  name: 'profileDetails',
  initialState: {
    currentProfile: null,
    similarProfiles: [],
    loading: false,
    loadingSimilar: false,
    error: null,
    profileCache: {} // Cache by userId
  },
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentProfile = null
      state.similarProfiles = []
      state.error = null
    },
    
    // Update profile in cache (useful when profile is updated elsewhere)
    updateCachedProfile: (state, action) => {
      const updatedProfile = action.payload
      if (state.profileCache[updatedProfile._id]) {
        state.profileCache[updatedProfile._id] = {
          ...state.profileCache[updatedProfile._id],
          ...updatedProfile
        }
      }
      if (state.currentProfile?._id === updatedProfile._id) {
        state.currentProfile = { ...state.currentProfile, ...updatedProfile }
      }
    },
    
    // NEW: Clear similar profiles
    clearSimilarProfiles: (state) => {
      state.similarProfiles = []
    },
    
    // NEW: Manually set similar profiles (for client-side filtering)
    setSimilarProfiles: (state, action) => {
      state.similarProfiles = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile details
      .addCase(fetchProfileDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileDetails.fulfilled, (state, action) => {
        state.loading = false
        const { profile, userId, timestamp } = action.payload
        
        state.currentProfile = profile
        // Cache the profile
        state.profileCache[userId] = {
          profile,
          timestamp
        }
      })
      .addCase(fetchProfileDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Fetch similar profiles
      .addCase(fetchSimilarProfiles.pending, (state) => {
        state.loadingSimilar = true
      })
      .addCase(fetchSimilarProfiles.fulfilled, (state, action) => {
        state.loadingSimilar = false
        state.similarProfiles = action.payload
      })
      .addCase(fetchSimilarProfiles.rejected, (state) => {
        state.loadingSimilar = false
        state.similarProfiles = []
      })
  }
})

export const { 
  clearCurrentProfile, 
  updateCachedProfile, 
  clearSimilarProfiles, 
  setSimilarProfiles 
} = profileDetailsSlice.actions
export default profileDetailsSlice.reducer