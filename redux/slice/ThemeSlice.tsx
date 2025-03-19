import { createSlice } from "@reduxjs/toolkit";


const ThemeSlice = createSlice({
    initialState: {
        theme: '#7FADE1'
    },
    name: 'themeSlice',
    reducers: {
        themeReducer: (state, action) => {
            state.theme = action.payload;
        },
        clearThemeReducer: (state) => {
            state.theme = '#7FADE1'
         }
     }
     
})

export const {themeReducer, clearThemeReducer} = ThemeSlice.actions;
export default ThemeSlice.reducer;