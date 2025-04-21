import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'

import propertiesReduce from '../src/slices/propertySlice'
import userReducer from '../src/slices/UserSlice'

const userPersistConfig = {
  key: 'user',
  storage,
  stateReconciler: autoMergeLevel2,
}

const rootReducer = combineReducers({
  properties: propertiesReduce,
  user: persistReducer(userPersistConfig, userReducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)
