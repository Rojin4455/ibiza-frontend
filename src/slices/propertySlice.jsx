import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  properties: [],
  totalCount: 0,
  next: null,
  loading: false,
};

export const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setProperties: (state, action) => {
      const { results, count, next } = action.payload;
      state.properties = results;
      state.totalCount = count;
      state.next = next;
    },
    addMoreProperties: (state, action) => {
      const { results, next } = action.payload;
      state.properties = [...state.properties, ...results];
      state.next = next;
    },
    clearProperties: (state) => {
      state.properties = [];
      state.totalCount = 0;
      state.next = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setProperties, addMoreProperties, clearProperties, setLoading } = propertiesSlice.actions;
export default propertiesSlice.reducer;
