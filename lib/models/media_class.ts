import { MediaData } from "../../types";

/**
 * Represents a media item.
 */
export class Media {
  /**
   * The UUID of the media.
   */
  uuid: string;
  /**
   * The type of the media (e.g., "image", "audio", "video").
   */
  type: string;
  /**
   * The URI of the media.
   */
  uri: string;

  /**
   * Creates a new Media instance.
   * @param {MediaData} data - The data object containing the UUID, type, and URI of the media.
   */
  constructor({ uuid, type, uri }: MediaData) {
    this.uuid = uuid;
    this.type = type;
    this.uri = uri;
  }

  /**
   * Returns the UUID of the media.
   * @returns {string} The UUID of the media.
   */
  getUuid(): string {
    return this.uuid;
  }

  /**
   * Returns the type of the media.
   * @returns {string} The type of the media.
   */
  getType(): string {
    return this.type;
  }

  /**
   * Returns the URI of the media.
   * @returns {string} The URI of the media.
   */
  getUri(): string {
    return this.uri;
  }
}

/**
 * Represents an audio media item.
 */
export class AudioType extends Media {
  /**
   * The duration of the audio.
   */
  duration: string;
  /**
   * The name of the audio.
   */
  name: string;
  /**
   * The play status of the audio.
   */
  isPlaying: boolean;

  /**
   * Creates a new AudioType instance.
   * @param {MediaData & { duration: string; name: string }} data - The data object containing the UUID, type, URI, duration, and name of the audio.
   */
  constructor({
    uuid,
    uri,
    duration,
    name,
    isPlaying,
  }: MediaData & { duration: string; name: string; isPlaying: boolean }) {
    super({ uuid, type: "audio", uri });
    this.duration = duration;
    this.name = name;
    this.isPlaying = isPlaying || false;
  }

  /**
   * Returns whether the media item is an audio.
   * @returns {boolean} `true` if the media item is an audio, `false` otherwise.
   */
  isAudio(): boolean {
    return true;
  }

  /**
   * Returns the duration of the audio.
   * @returns {string} The duration of the audio.
   */
  getDuration(): string {
    return this.duration;
  }
}

/**
 * Represents a video media item.
 */
export class VideoType extends Media {
  /**
   * The thumbnail of the video.
   */
  thumbnail: string;
  /**
   * The duration of the video.
   */
  duration: string;

  /**
   * Creates a new VideoType instance.
   * @param {MediaData & { thumbnail: string; duration: string }} data - The data object containing the UUID, type, URI, thumbnail, and duration of the video.
   */
  constructor({
    uuid,
    uri,
    thumbnail,
    duration,
  }: MediaData & { thumbnail: string; duration: string }) {
    super({ uuid, type: "video", uri });
    this.thumbnail = thumbnail;
    this.duration = duration;
  }

  /**
   * Returns the duration of the video.
   * @returns {string} The duration of the video.
   */
  getDuration(): string {
    return this.duration;
  }

  /**
   * Returns the thumbnail of the video.
   * @returns {string} The thumbnail of the video.
   */
  getThumbnail(): string {
    return this.thumbnail;
  }
}

/**
 * Represents a photo media item.
 */
export class PhotoType extends Media {
  /**
   * Creates a new PhotoType instance.
   * @param {MediaData} data - The data object containing the UUID and URI of the photo.
   */
  constructor({ uuid, uri }: MediaData) {
    super({ uuid, type: "image", uri });
  }
}
