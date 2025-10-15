import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedCounty: 'all',
    filters: {
      userType: 'all',
      gender: 'all',
      bodyType: 'all',
      breastSize: 'all',
      location: null,
      area: null
    }
  },
  reducers: {
    setSelectedCounty: (state, action) => {
      state.selectedCounty = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        userType: 'all',
        gender: 'all',
        bodyType: 'all',
        breastSize: 'all',
        location: null,
        area: null
      }
    }
  }
})

export const { setSelectedCounty, setFilters, clearFilters } = uiSlice.actions
export default uiSlice.reducer