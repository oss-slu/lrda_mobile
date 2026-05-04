import { Note, ImageNote, Tag } from "../../types";
import { VideoType, AudioType, PhotoType } from "../models/media_class";

export default class DataConversion {
  static convertMediaTypes(data: any[]): Note[] {
    const fetchedNotes: Note[] = data.map((message: any) => {
      const time = message.time ? new Date(message.time) : new Date(message.createdAt);

      const mediaItems = (message.media || []).map((item: any) => {
        if (item.type === "video") {
          return new VideoType({
            uuid: item.uuid || item.id,
            type: item.type,
            uri: item.uri,
            thumbnail: item.thumbnailUri || "",
            duration: item.duration || "",
          });
        } else {
          return new PhotoType({
            uuid: item.uuid || item.id,
            type: item.type || "image",
            uri: item.uri,
          });
        }
      });

      const audioItems = (message.audio || []).map((item: any) => {
        return new AudioType({
          uuid: item.uuid || item.id,
          type: "audio",
          uri: item.uri,
          duration: item.duration || "",
          name: item.name || "",
          isPlaying: false,
        });
      });

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

    fetchedNotes.sort((b, a) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return fetchedNotes;
  }

  static extractImages(fetchedNotes: Note[]): ImageNote[] {
    const extractedImages: ImageNote[] = fetchedNotes.flatMap((note) => {
      return note.media.map((item: any) => {
        const image = item.type === "video" ? item.thumbnail : item.uri;
        return {
          image,
          note: {
            id: note.id,
            title: note.title || "",
            text: note.text || "",
            media: note.media.map((mediaItem: any) => {
              if (mediaItem.type === "video") {
                return new VideoType({
                  uuid: mediaItem.uuid,
                  type: mediaItem.type,
                  uri: mediaItem.uri,
                  thumbnail: mediaItem.thumbnail,
                  duration: mediaItem.duration,
                });
              } else {
                return new PhotoType({
                  uuid: mediaItem.uuid,
                  type: mediaItem.type,
                  uri: mediaItem.uri,
                });
              }
            }),
            audio: note.audio || [],
            time: note.time || new Date(),
            creatorId: note.creatorId || "",
            latitude: note.latitude,
            longitude: note.longitude,
            isPublished: note.isPublished ?? false,
            tags: note.tags || [],
          },
        };
      });
    });

    return extractedImages;
  }
}
