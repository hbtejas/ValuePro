import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import calculatorReducer from './calculatorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    calculator: calculatorReducer,
  },
});
