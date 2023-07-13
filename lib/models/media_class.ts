import { MediaData } from "../../types";

export class Media {
  uuid: string;
  type: string;
  uri: string;

  constructor({ uuid, type, uri }: MediaData) {
    this.uuid = uuid;
    this.type = type;
    this.uri = uri;
  }

  getUuid(): string {
    return this.uuid;
  }

  getType(): string {
    return this.type;
  }

  getUri(): string {
    return this.uri;
  }
}

export class AudioType extends Media {
  duration: string;
  name: string;

  constructor({
    uuid,
    uri,
    duration,
    name,
  }: MediaData & { duration: string; name: string }) {
    super({ uuid, type: "audio", uri });
    this.duration = duration;
    this.name = name;
  }

  isAudio(): boolean {
    return true;
  }

  getDuration(): string {
    return this.duration;
  }
}

export class VideoType extends Media {
  thumbnail: string;
  duration: string;

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

  getDuration(): string {
    return this.duration;
  }

  getThumbnail(): string {
    return this.thumbnail;
  }
}

export class PhotoType extends Media {
  constructor({ uuid, uri }: MediaData) {
    super({ uuid, type: "image", uri });
  }
}
