import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  navState: 'loading' | 'onboarding' | 'login' | 'home';
}

const initialState: NavigationState = {
  navState: 'loading',  // Default state
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavState(state, action: PayloadAction<'loading' | 'onboarding' | 'login' | 'home'>) {
      state.navState = action.payload;
    },
  },
});

export const { setNavState } = navigationSlice.actions;

export default navigationSlice.reducer;
