import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: "",
  refreshToken:"",
  isAdmin:false,
  user:{}
};


export const userSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
      setUser: (state, action) => {
        const { accessToken, refreshToken, isAdmin, user } = action.payload;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAdmin = isAdmin;
        state.user = user?user:state.user
      },
      clearUser: (state, action) => {
        state.accessToken = "";
        state.refreshToken = "";
        state.isAdmin = false;
        state.user = {}

      }
    }
})

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer