export type Media = {
  uuid: string;
  type: string;
  uri: string;
};

export type PhotoType = Media & {
  type: "image";
};

export type VideoType = Media & {
  type: "video";
  thumbnail: string;
  duration: string;
};

export type AudioType = Media & {
  type: "audio";
  duration: string;
  name: string;
  isPlaying: boolean;
};
