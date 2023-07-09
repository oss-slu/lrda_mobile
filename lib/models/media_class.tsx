type MediaData = {
    uuid: string;
    type: string;
    uri: string;
    thumbnail: string;
  };
  
  export class Media {
    uuid: string;
    type: string;
    uri: string;
    thumbnail: string;
  
    constructor({ uuid, type, uri, thumbnail }: MediaData) {
      this.uuid = uuid;
      this.type = type;
      this.uri = uri;
      this.thumbnail = thumbnail;
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
  
    getThumbnail(): string {
      return this.thumbnail;
    }
  
    isVideo(): boolean {
      return this.type === 'video';
    }
  
    isImage(): boolean {
      return this.type === 'image';
    }
  }
  