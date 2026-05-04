import { Platform } from "react-native";
import { getThumbnailAsync } from "expo-video-thumbnails";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";

const S3_PROXY_PREFIX = process.env.S3_PROXY_PREFIX || "http://s3-proxy.rerum.io/S3/";

async function getThumbnail(uri: string): Promise<string> {
  const { uri: thumbnailUri } = await getThumbnailAsync(uri);
  const address = await uploadMedia(thumbnailUri, "image");
  return address;
}

async function convertHeicToJpg(uri: string): Promise<string> {
  const convertedImage = await manipulateAsync(uri, [], {
    format: SaveFormat.JPEG,
  });
  return convertedImage.uri;
}

async function uploadMedia(uri: string, mediaType: string): Promise<string> {
  let data = new FormData();
  const uniqueName = `media-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`;

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, {
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
    });
    data.append("file", file);
  } else if (Platform.OS == "ios") {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64 = `data:${mediaType === "image" ? "image/jpeg" : "video/mp4"};base64,${base64}`;
    data.append("file", {
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      uri: base64,
      name: uniqueName,
    } as any);
  } else if (Platform.OS == "android") {
    data.append("file", {
      uri: uri,
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      name: uniqueName,
    } as any);
  }

  return fetch(S3_PROXY_PREFIX + "uploadFile", {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then(async (resp) => {
      if (resp.ok) {
        const location = resp.headers.get("Location");
        if (!location) throw new Error("Upload succeeded but no Location header returned");
        return location;
      } else {
        const errorText = await resp.text();
        throw new Error(`Failed to upload. Status: ${resp.status}, Error: ${errorText}`);
      }
    })
    .catch((err) => {
      console.error("uploadMedia - Network request failed:", err.message);
      throw err;
    });
}

export { getThumbnail, convertHeicToJpg, uploadMedia };

export async function uploadAudio(uri: string, maxRetries = 4): Promise<string> {
  let type = "video/3gp.";
  let data = new FormData();
  const uniqueName = `media-${Date.now()}.3gp`;

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, {
      type: `audio/mp3`,
    });

    data.append("file", file);
  } else if (Platform.OS === "android") {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileUri = fileInfo.uri;

    data.append("file", {
      uri: fileUri,
      type: type,
      name: uniqueName,
    } as any);
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64 = `data:audio/mp3;base64,${base64}`;
    data.append("file", {
      type: "audio/mp3",
      uri: base64,
      name: uniqueName,
    } as any);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(S3_PROXY_PREFIX + "uploadFile", {
        method: "POST",
        mode: "cors",
        body: data,
      });

      if (resp.ok) {
        const location = resp.headers.get("Location");
        if (!location) throw new Error("Upload succeeded but no Location header returned");
        return location;
      } else {
        throw new Error(`Upload failed with status ${resp.status}`);
      }
    } catch (err) {
      if (attempt >= maxRetries) {
        console.error("uploadAudio - Error after retries:", err);
        throw err;
      }
    }
  }

  throw new Error("uploadAudio failed unexpectedly");
}
