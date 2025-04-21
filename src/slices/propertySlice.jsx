import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  properties: [],
  totalCount: 0,
  next: null,
  loading: false,
  noSelect:false
};

export const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setProperties: (state, action) => {
        const payload = action.payload;

        // If paginated format
        if (payload.results && Array.isArray(payload.results)) {
          state.properties = payload.results;
          state.totalCount = payload.count || 0;
          state.next = payload.next || null;
          state.noSelect = false;
        }
        // If selection response format
        else if (payload.properties_detail && Array.isArray(payload.properties_detail)) {
            console.log("propertue daailad", payload.properties_detail)
          state.properties = payload.properties_detail;
          state.totalCount = payload.properties_detail.length;
          state.next = null;
          state.noSelect = true;
        }
    },
    addMoreProperties: (state, action) => {
      const { results, next } = action.payload;
      state.properties = [...state.properties, ...results];
      state.next = next;
      state.noSelect = false;

    },
    clearProperties: (state) => {
      state.properties = [];
      state.totalCount = 0;
      state.next = null;
      state.noSelect = false;

    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setProperties, addMoreProperties, clearProperties, setLoading } = propertiesSlice.actions;
export default propertiesSlice.reducer;
