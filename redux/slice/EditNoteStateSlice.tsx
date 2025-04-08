import { createSlice } from "@reduxjs/toolkit";

const EditNoteStateSlice = createSlice({
    name: 'EditNoteStateSlice',
    initialState: {
        isEditNoteOpned: false
    },

    reducers: {
        toogleEditNoteState: (state) => {
            console.log("Reducer called. Current state:", state.isEditNoteOpned);
            state.isEditNoteOpned = !state.isEditNoteOpned;
            console.log("Reducer updated state to:", state.isEditNoteOpned);
          },
    }
});

export const {toogleEditNoteState} = EditNoteStateSlice.actions;
export default EditNoteStateSlice.reducer;