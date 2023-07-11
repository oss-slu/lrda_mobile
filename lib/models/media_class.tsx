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
  duration: number;

  constructor({ uuid, uri, duration }: MediaData & { duration: number }) {
    super({ uuid, type: 'audio', uri });
    this.duration = duration;
  }

  isAudio(): boolean {
    return true;
  }

  getDuration(): number {
    return this.duration;
  }
}

export class VideoType extends Media {
  thumbnail: string;
  duration: number;

  constructor({ uuid, uri, thumbnail, duration }: MediaData & { thumbnail: string, duration: number }) {
    super({ uuid, type: 'video', uri });
    this.thumbnail = thumbnail;
    this.duration = duration;
  }

  getDuration(): number {
    return this.duration;
  }

  getThumbnail(): string {
    return this.thumbnail;
  }
}

export class PhotoType extends Media {
  constructor({ uuid, uri }: MediaData) {
    super({ uuid, type: 'image', uri });
  }
}
