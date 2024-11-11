import { Platform } from "react-native";
import { getThumbnailAsync } from "expo-video-thumbnails";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/";
const S3_PROXY_PREFIX = process.env.S3_PROXY_PREFIX || "http://s3-proxy.rerum.io/S3/";

let attempts = 0;

async function getThumbnail(uri: string): Promise<string> {
  const { uri: thumbnailUri } = await getThumbnailAsync(uri);
  const address = await uploadMedia(thumbnailUri, "image");
  return address;
}

async function convertHeicToJpg(uri: string): Promise<string> {
  console.log("Converting HEIC to JPG...");
  const convertedImage = await manipulateAsync(uri, [], {
    format: SaveFormat.JPEG,
  });
  console.log("Converted image URI: ", convertedImage.uri);
  return convertedImage.uri;
}

async function uploadMedia(uri: string, mediaType: string): Promise<string> {
  console.log("uploadMedia - Input URI:", uri);

  let data = new FormData();
  const uniqueName = `media-${Date.now()}.${
    mediaType === "image" ? "jpg" : "mp4"
  }`;

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
    base64 = `data:${
      mediaType === "image" ? "image/jpeg" : "video/mp4"
    };base64,${base64}`;
    data.append("file", {
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      uri: base64,
      name: uniqueName,
    });
  } else if (Platform.OS == "android") {
    data.append("file", {
      uri: uri,
      type: "video/mp4",
      name: uniqueName,
    });
  }

  console.log("uploadMedia - Starting fetch with S3_PROXY_PREFIX:", S3_PROXY_PREFIX);

  return fetch(S3_PROXY_PREFIX + "uploadFile", {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then(async (resp) => {
      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("uploadMedia - Uploaded successfully, Location:", location);
        return location;
      } else {
        const errorText = await resp.text(); // Retrieve response text for errors
        console.log("uploadMedia - Failed response:", errorText);
        throw new Error(`Failed to upload. Status: ${resp.status}, Error: ${errorText}`);
      }
    })
    .catch((err) => {
      console.error("uploadMedia - Network request failed:", err.message);
      throw err; // Re-throw error to be caught in the AddNoteScreen
    });
}


export { getThumbnail, convertHeicToJpg, uploadMedia };

export async function uploadAudio(uri: string): Promise<string> {
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
    // Handle Android upload differently
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileUri = fileInfo.uri;

    data.append("file", {
      uri: fileUri,
      type: type,
      name: uniqueName,
    });
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64 = `data:audio/mp3;base64,${base64}`;
    data.append("file", {
      type: `audio/mp3`,
      uri: base64,
      name: uniqueName,
    });
    console.log("base64===",base64)
  }

  return fetch(S3_PROXY_PREFIX + "uploadFile", {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then((resp) => {
      console.log("Got the response from the upload file servlet");
      console.log("uploadMedia - Server response status:", resp.status);
      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("uploadMedia - Uploaded successfully, Location:", location);
        attempts = 0;
        return location;
      } else {
        console.log("uploadMedia - Server response body:", resp.body);
      }
    })
    .catch((err) => {
      if (attempts > 3) {
        console.error("uploadMedia - Error:", err);
        return err;
      }
      attempts++;
      return uploadAudio(uri);
    });
}