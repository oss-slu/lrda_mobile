import type { PhotoType, VideoType, AudioType } from "./lib/models/media_class";

export type Tag = {
  label: string;
  origin: "user" | "ai";
};

export type UserData = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  isInstructor: boolean;
  instructorId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  text: string;
  time: Date;
  media: (VideoType | PhotoType)[];
  audio: AudioType[];
  creatorId: string;
  latitude: number | null;
  longitude: number | null;
  isPublished: boolean;
  tags: string[];
};

export type ImageNote = {
  image: string;
  note: Note;
};

export interface MapMarker {
  coordinate: { latitude: number; longitude: number };
  creatorId: string;
  title: string;
  description: string;
  images: { uri: string }[];
  time: string;
  tags: string[];
  distance?: number;
}
