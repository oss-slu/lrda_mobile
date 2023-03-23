export type Note = {
    id: string;
    text: string;
  };
  
  export type RootStackParamList = {
    Home: undefined;
    AddNote: { onSave: (note: Note) => void };
    EditNote: { note: Note; onSave: (note: Note) => void };
  };
  