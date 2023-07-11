import { Media } from "./lib/models/media_class";

export type MediaData = {
  uuid: string;
  type: string;
  uri: string;
  thumbnail: string;
};

export type Note = {
    id: string;
    title: string;
    text: string;
    time: string;
    media: Media[];
    creator: string; 
    latitude: string;
    longitude: string;
  };
  
  export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    AddNote: { onSave: (note: Note) => void };
    EditNote: { note: Note; onSave: (note: Note) => void };
  };
  