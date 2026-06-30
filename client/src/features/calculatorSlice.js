import { createSlice } from '@reduxjs/toolkit';

const storedRecent = JSON.parse(localStorage.getItem('valuepro_recent') || '[]');
const storedMostUsed = JSON.parse(localStorage.getItem('valuepro_most_used') || '{}');

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: {
    recentlyUsed: storedRecent.slice(0, 6),
    usageCounts: storedMostUsed,
    currentResult: null,
    loading: false,
  },
  reducers: {
    trackUsage(state, action) {
      const calcType = action.payload;
      
      // Update recently used
      state.recentlyUsed = [
        calcType,
        ...state.recentlyUsed.filter((t) => t !== calcType),
      ].slice(0, 6);
      localStorage.setItem('valuepro_recent', JSON.stringify(state.recentlyUsed));
      
      // Update usage counts
      state.usageCounts[calcType] = (state.usageCounts[calcType] || 0) + 1;
      localStorage.setItem('valuepro_most_used', JSON.stringify(state.usageCounts));
    },
    setResult(state, action) {
      state.currentResult = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    clearResult(state) {
      state.currentResult = null;
    },
  },
});

export const { trackUsage, setResult, setLoading, clearResult } = calculatorSlice.actions;

// Selectors
export const selectMostUsed = (state) => {
  const counts = state.calculator.usageCounts;
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([type]) => type);
};

export default calculatorSlice.reducer;
