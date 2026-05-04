import { Note, ImageNote, Tag } from "../../types";
import type { VideoType, PhotoType, AudioType } from "../models/media_class";

export default class DataConversion {
  static convertMediaTypes(data: any[]): Note[] {
    return data.map((message: any) => {
      const time = message.time ? new Date(message.time) : new Date(message.createdAt);

      const mediaItems: (VideoType | PhotoType)[] = (message.media || []).map((item: any) => {
        if (item.type === "video") {
          return {
            uuid: item.uuid || item.id,
            type: "video" as const,
            uri: item.uri,
            thumbnail: item.thumbnailUri || "",
            duration: item.duration || "",
          };
        }
        return {
          uuid: item.uuid || item.id,
          type: "image" as const,
          uri: item.uri,
        };
      });

      const audioItems: AudioType[] = (message.audio || []).map((item: any) => ({
        uuid: item.uuid || item.id,
        type: "audio" as const,
        uri: item.uri,
        duration: item.duration || "",
        name: item.name || "",
        isPlaying: false,
      }));

      const tags: string[] = (message.tags || []).map((t: string | Tag) =>
        typeof t === "string" ? t : t.label
      );

      return {
        id: message.id,
        title: message.title || "",
        text: message.text || "",
        time: time,
        creatorId: message.creatorId || "",
        media: mediaItems,
        audio: audioItems,
        latitude: message.latitude ?? null,
        longitude: message.longitude ?? null,
        isPublished: message.isPublished ?? false,
        tags,
      };
    });
  }

  static extractImages(fetchedNotes: Note[]): ImageNote[] {
    return fetchedNotes.flatMap((note) => {
      return note.media.map((item) => {
        const image = item.type === "video" ? item.thumbnail : item.uri;
        return {
          image,
          note: { ...note },
        };
      });
    });
  }
}
