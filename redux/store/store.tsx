// store.ts or store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from '../slice/navigationSlice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
  },
});

// Define RootState
export type RootState = ReturnType<typeof store.getState>;

// Define AppDispatch
export type AppDispatch = typeof store.dispatch;
