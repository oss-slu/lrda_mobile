import { Platform } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";

// const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/";
const S3_PROXY_PREFIX = process.env.S3_PROXY_PREFIX || "http://s3-proxy.rerum.io/S3/";

let attempts = 0;

async function getThumbnail(uri: string): Promise<string> {
  console.log("🎬 [getThumbnail] Starting thumbnail generation for video:", uri);
  
  try {
    console.log("🎬 [getThumbnail] Calling VideoThumbnails.getThumbnailAsync with options:", {
      time: 15000,
      quality: 0.8
    });
    
    const result = await VideoThumbnails.getThumbnailAsync(uri, {
      time: 15000, // Get thumbnail at 15 seconds
      quality: 0.8, // 80% quality
    });
    
    console.log("🎬 [getThumbnail] VideoThumbnails.getThumbnailAsync result:", result);
    console.log("🎬 [getThumbnail] Thumbnail URI:", result.uri);
    console.log("🎬 [getThumbnail] Thumbnail dimensions:", { width: result.width, height: result.height });
    
    if (!result.uri) {
      console.error("❌ [getThumbnail] No thumbnail URI returned from VideoThumbnails.getThumbnailAsync");
      throw new Error("No thumbnail URI returned");
    }
    
    console.log("🎬 [getThumbnail] Uploading thumbnail to S3...");
    const address = await uploadMedia(result.uri, "image");
    console.log("🎬 [getThumbnail] Thumbnail uploaded successfully to S3:", address);
    
    return address;
  } catch (error) {
    console.error("❌ [getThumbnail] Error generating thumbnail:", error);
    console.error("❌ [getThumbnail] Error details:", {
      message: error.message,
      stack: error.stack,
      videoUri: uri
    });
    throw error;
  }
}

async function convertHeicToJpg(uri: string): Promise<string> {
  console.log("Converting HEIC to JPG...");
  
  try {
    // Use the new ImageManipulator API
    const context = ImageManipulator.manipulate(uri);
    const imageRef = await context.renderAsync();
    const result = await imageRef.saveAsync({
      format: SaveFormat.JPEG,
    });
    
    console.log("Converted image URI: ", result.uri);
    return result.uri;
  } catch (error) {
    console.error("Error converting HEIC to JPG:", error);
    throw error;
  }
}

async function uploadMedia(uri: string, mediaType: string): Promise<string> {
  console.log("🚀 [S3] uploadMedia called with:", {
    uri,
    mediaType,
    platform: Platform.OS,
    s3ProxyPrefix: S3_PROXY_PREFIX
  });

  let data = new FormData();
  const uniqueName = `media-${Date.now()}.${
    mediaType === "image" ? "jpg" : "mp4"
  }`;

  console.log("📝 [S3] Creating FormData with unique name:", uniqueName);

  if (Platform.OS === "web") {
    console.log("🌐 [S3] Processing for web platform");
    const response = await fetch(uri);
    const blob = await response.blob();
    const webFile = new (globalThis as any).File([blob], uniqueName, {
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
    });
    data.append("file", webFile);
    console.log("✅ [S3] Web file appended to FormData");
  } else if (Platform.OS == "ios") {
    console.log("🍎 [S3] Processing for iOS platform");
    // For iOS, use the file directly instead of converting to base64
    data.append("file", {
      uri: uri,
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      name: uniqueName,
    } as any);
    console.log("✅ [S3] iOS file appended to FormData");
  } else if (Platform.OS == "android") {
    console.log("🤖 [S3] Processing for Android platform");
    data.append("file", {
      uri: uri,
      type: "video/mp4",
      name: uniqueName,
    } as any);
    console.log("✅ [S3] Android file appended to FormData");
  }

  const uploadUrl = S3_PROXY_PREFIX + "uploadFile";
  console.log("🌐 [S3] Starting upload to:", uploadUrl);

  return fetch(uploadUrl, {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then(async (resp) => {
      console.log("📊 [S3] Response received:", {
        status: resp.status,
        statusText: resp.statusText,
        headers: Object.fromEntries(resp.headers.entries())
      });

      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("✅ [S3] Upload successful! Location:", location);
        return location;
      } else {
        const errorText = await resp.text();
        console.error("❌ [S3] Upload failed:", {
          status: resp.status,
          statusText: resp.statusText,
          errorText: errorText
        });
        throw new Error(`Failed to upload. Status: ${resp.status}, Error: ${errorText}`);
      }
    })
    .catch((err) => {
      console.error("💥 [S3] Network request failed:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      throw err; // Re-throw error to be caught in the AddNoteScreen
    });
}


export { getThumbnail, convertHeicToJpg, uploadMedia };

export async function uploadAudio(uri: string): Promise<string> {
  console.log("🎵 [S3] uploadAudio called with:", {
    uri,
    platform: Platform.OS,
    s3ProxyPrefix: S3_PROXY_PREFIX,
    attempts
  });

  let type = "video/3gp.";
  let data = new FormData();
  const uniqueName = `media-${Date.now()}.3gp`;

  console.log("📝 [S3] Creating FormData for audio with unique name:", uniqueName);

  if (Platform.OS === "web") {
    console.log("🌐 [S3] Processing audio for web platform");
    const response = await fetch(uri);
    const blob = await response.blob();
    const webFile = new (globalThis as any).File([blob], uniqueName, {
      type: `audio/mp3`,
    });

    data.append("file", webFile);
    console.log("✅ [S3] Web audio file appended to FormData");
  } else if (Platform.OS === "android") {
    console.log("🤖 [S3] Processing audio for Android platform");
    // Handle Android upload differently
    const file = new File(uri);
    data.append("file", {
      uri: file.uri,
      type: type,
      name: uniqueName,
    } as any);
    console.log("✅ [S3] Android audio file appended to FormData");
  } else {
    console.log("🍎 [S3] Processing audio for iOS platform");
    // For iOS, use the file directly instead of converting to base64
    data.append("file", {
      uri: uri,
      type: "audio/mp3",
      name: uniqueName,
    } as any);
    console.log("✅ [S3] iOS audio file appended to FormData");
  }

  const uploadUrl = S3_PROXY_PREFIX + "uploadFile";
  console.log("🌐 [S3] Starting audio upload to:", uploadUrl);

  return fetch(uploadUrl, {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then(async (resp) => {
      console.log("📊 [S3] Audio upload response received:", {
        status: resp.status,
        statusText: resp.statusText,
        headers: Object.fromEntries(resp.headers.entries())
      });

      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("✅ [S3] Audio upload successful! Location:", location);
        attempts = 0;
        return location;
      } else {
        const errorText = await resp.text();
        console.error("❌ [S3] Audio upload failed:", {
          status: resp.status,
          statusText: resp.statusText,
          errorText: errorText
        });
        throw new Error(`Failed to upload audio. Status: ${resp.status}, Error: ${errorText}`);
      }
    })
    .catch((err) => {
      console.error("💥 [S3] Audio upload network request failed:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        attempts
      });

      if (attempts > 3) {
        console.error("❌ [S3] Max retry attempts reached for audio upload");
        throw err;
      }
      attempts++;
      console.log("🔄 [S3] Retrying audio upload, attempt:", attempts);
      return uploadAudio(uri);
    });
}