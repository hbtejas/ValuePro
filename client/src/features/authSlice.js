import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('valuepro_user');
const storedToken = localStorage.getItem('valuepro_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: storedToken || null,
    refreshToken: localStorage.getItem('valuepro_refresh_token') || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('valuepro_user', JSON.stringify(user));
      localStorage.setItem('valuepro_token', accessToken);
      localStorage.setItem('valuepro_refresh_token', refreshToken);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('valuepro_user');
      localStorage.removeItem('valuepro_token');
      localStorage.removeItem('valuepro_refresh_token');
    },
    updateTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('valuepro_token', action.payload.accessToken);
      localStorage.setItem('valuepro_refresh_token', action.payload.refreshToken);
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
