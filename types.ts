export type Note = {
    id: string;
    title: string;
    text: string;
    time: string;
    images: string[];
  };
  
  export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    AddNote: { onSave: (note: Note) => void };
    EditNote: { note: Note; onSave: (note: Note) => void };
  };
  