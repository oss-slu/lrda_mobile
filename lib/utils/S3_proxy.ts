import { Platform } from "react-native";
import { getThumbnailAsync } from "expo-video-thumbnails";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/";
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
    console.log("Blob size:", blob.size);
    console.log("File size:", file.size);

    data.append("file", file);
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log(
      "base64 has been defined and will attempt to upload to S3 soon"
    );
    base64 = `data:${
      mediaType === "image" ? "image/jpeg" : "video/mp4"
    };base64,${base64}`;
    data.append("file", {
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      uri: base64,
      name: uniqueName,
    });
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
        return location;
      } else {
        console.log("uploadMedia - Server response body:", resp.body);
      }
    })
    .catch((err) => {
      console.error("uploadMedia - Error:", err);
      return err;
    });
}

export { getThumbnail, convertHeicToJpg, uploadMedia };

export async function uploadAudio(uri: string): Promise<string> {
  console.log("uploadMedia - Input URI:", uri);

  let data = new FormData();
  const uniqueName = `media-${Date.now()}.mp3`;

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, {
      type: `audio/mp3`,
    });
    console.log("Blob size:", blob.size);
    console.log("File size:", file.size);

    data.append("file", file);
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
