import { createSlice } from "@reduxjs/toolkit";

const AddNoteStateSlice = createSlice({
    name: 'addNoteStateSlice',
    initialState: {
        isAddNoteOpned: false
    },

    reducers: {
        toogleAddNoteState: (state) => {
            console.log("Reducer called. Current state:", state.isAddNoteOpned);
            state.isAddNoteOpned = !state.isAddNoteOpned;
            console.log("Reducer updated state to:", state.isAddNoteOpned);
          },
    }
});

export const {toogleAddNoteState} = AddNoteStateSlice.actions;
export default AddNoteStateSlice.reducer;