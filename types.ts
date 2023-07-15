import { Media, AudioType } from "./lib/models/media_class";
import { User } from "./lib/models/user_class";

export type MediaData = {
  uuid: string;
  type: string;
  uri: string;
};

export type UserData = {
  "@id": string;
  name: string;
  roles: {
    administrator: boolean;
    contributor: boolean;
  };
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
    published: boolean;
  };
  
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  AddNote: { onSave: (note: Note) => void };
  EditNote: { note: Note; onSave: (note: Note) => void };
};

export type EditNoteScreenProps = {
  route: {
    params: {
      note: Note;
      onSave: (note: Note) => void;
    };
  };
  navigation: {
    goBack: () => void;
  };
};

export type RootTabParamList = {
  HomeTab: undefined;
  Tab1: undefined;
  Tab2: undefined;
};

export type HomeScreenProps = {
  navigation: any;
  route: { params?: { note: Note; onSave: (note: Note) => void } };
};

export type ProfilePageProps = {
  navigation: any;
};

export type EditNoteProps = {
  route: { params: { note: Note; onSave: (note: Note) => void } };
  navigation: {
    setOptions: (options: { headerTitle: string }) => void;
    goBack: () => void;
  };
};

export type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

export type ImageNote = {
  image: string;
  note: Note;
} | null;

export type GoogleMapProps = {
  route: any, // substitute any with the actual type if you know it
  updateCounter: any, // substitute any with the actual type if you know it
  user: User,
};