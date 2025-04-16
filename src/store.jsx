import { configureStore } from '@reduxjs/toolkit'
import propertiesReduce from '../src/slices/propertySlice'

export const store = configureStore({
    reducer: {
        properties:propertiesReduce
    },
  })