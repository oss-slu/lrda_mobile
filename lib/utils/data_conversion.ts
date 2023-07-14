import { Note } from "../../types";
import { VideoType, AudioType, PhotoType } from "../models/media_class";

/**
 * Utility class for converting media types in fetched data to the appropriate classes.
 */
export default class DataConversion {
  /**
   * Converts media types in the fetched data to the appropriate classes.
   * @param {any[]} data - The fetched data containing media items.
   * @returns {Note[]} The converted notes, sorted with appropriate media classes.
   */
  static convertMediaTypes(data: any[]): Note[] {
    const fetchedNotes: Note[] = data.map((message: any) => {
      const time = message.__rerum.isOverwritten
        ? new Date(message.__rerum.isOverwritten)
        : new Date(message.__rerum.createdAt);
      time.setHours(time.getHours() - 5);
      const mediaItems = message.media.map((item: any) => {
        if (item.type === "video") {
          return new VideoType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
            thumbnail: item.thumbnail,
            duration: item.duration,
          });
        } else if (item.type === "audio") {
          return new AudioType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
            duration: item.duration,
            name: item.name,
          });
        } else {
          return new PhotoType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
          });
        }
      });

      const audioItems = message.audio?.map((item: any) => {
        return new AudioType({
          uuid: item.uuid,
          type: item.type,
          uri: item.uri,
          duration: item.duration,
          name: item.name,
        });
      });

      return {
        id: message["@id"],
        title: message.title || "",
        text: message.BodyText || "",
        time: time.toLocaleString("en-US", { timeZone: "America/Chicago" }) || "",
        creator: message.creator || "",
        media: mediaItems || [],
        audio: audioItems || [],
        latitude: message.latitude || "",
        longitude: message.longitude || "",
      };
    });

    fetchedNotes.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return fetchedNotes;
  }
}
