import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import profilesReducer from './profilesSlice'
import profileDetailsReducer from './profileDetailsSlice'
import uiReducer from './uiSlice'

// Persist configuration for profiles
const profilesPersistConfig = {
  key: 'profiles',
  storage,
  whitelist: ['allProfiles', 'lastFetchTime', 'countyProfiles'],
  timeout: 300000
}

// Persist configuration for profile details (cache individual profiles)
const profileDetailsPersistConfig = {
  key: 'profileDetails',
  storage,
  whitelist: ['profileCache'],
  timeout: 300000
}

// Persist configuration for UI
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['filters', 'selectedCounty']
}

const store = configureStore({
  reducer: {
    profiles: persistReducer(profilesPersistConfig, profilesReducer),
    profileDetails: persistReducer(profileDetailsPersistConfig, profileDetailsReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
export default store