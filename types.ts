import { Media, AudioType } from "./lib/models/media_class";

export type MediaData = {
  uuid: string;
  type: string;
  uri: string;
};

export type Note = {
    id: string;
    title: string;
    text: string;
    time: string;
    media: Media[];
    audio: AudioType[];
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
  