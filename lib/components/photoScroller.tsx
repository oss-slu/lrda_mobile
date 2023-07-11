import React, { useEffect, useState } from "react";
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { getThumbnailAsync } from 'expo-video-thumbnails';
import { Media } from "../models/media_class";
import { v4 as uuidv4 } from 'react-native-uuid';

const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/"; // S3 Proxy
// const S3_PROXY_PREFIX = "http://:8080/S3/"; // localhost proxy


async function getThumbnail(uri: string): Promise<string> {
  const { uri: thumbnailUri } = await getThumbnailAsync(uri);
  return thumbnailUri;
}

async function convertHeicToJpg(uri: string) {
  console.log("Converting HEIC to JPG..."); // Log before starting the conversion
  const convertedImage = await manipulateAsync(uri, [], {
    format: SaveFormat.JPEG,
  });
  console.log("Converted image URI: ", convertedImage.uri); // Log the URI of the converted image
  return convertedImage.uri;
}

async function uploadMedia(uri: string, mediaType: string): Promise<string> {
  console.log("uploadMedia - Input URI:", uri);

  let data = new FormData();
  const uniqueName = `media-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`; // Generate a unique name based on the current timestamp and media type

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, { type: mediaType === "image" ? "image/jpeg" : "video/mp4" });
    console.log("Blob size:", blob.size);
    console.log("File size:", file.size);

    data.append("file", file);
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("base64 has been defined and will attempt to upload to S3 soon")
    base64 = `data:${mediaType === "image" ? "image/jpeg" : "video/mp4"};base64,${base64}`;
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

function PhotoScroller({
  newMedia,
  setNewMedia,
}: {
  newMedia: Media[];
  setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
}) {
  const [videoToPlay, setVideoToPlay] = useState('');

  const handleImageSelection = async (result: {
    canceled?: false;
    assets: any;
  }) => {
    const { uri } = result.assets[0];
    console.log("Selected image URI: ", uri);

    if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {
      const jpgUri = await convertHeicToJpg(uri);
      const uploadedUrl = await uploadMedia(jpgUri, 'image');
      const newMediaItem = new Media({
        uuid: uuidv4(),
        type: 'image',
        uri: uploadedUrl,
        thumbnail: ''
      });
      console.log("!!!!!!!!!newMediaItem!!!!!!!!!!!!!!",newMediaItem)
      setNewMedia([...newMedia, newMediaItem]);
    } else if (uri.endsWith(".jpg") || uri.endsWith('png') || uri.endsWith('.jpeg')) {
      const uploadedUrl = await uploadMedia(uri, 'image');
      const newMediaItem = new Media({
        uuid: uuidv4(),
        type: 'image',
        uri: uploadedUrl,
        thumbnail: ''
      });
      console.log("!!!!!!!!!newMediaItem!!!!!!!!!!!!!!",newMediaItem)
      setNewMedia([...newMedia, newMediaItem]);
    } else if (uri.endsWith('.MOV') || uri.endsWith('.mov') || uri.endsWith('.mp4')){
      const uploadedUrl = await uploadMedia(uri, 'video');
      const thumbnail = await getThumbnail(uri);
      const newMediaItem = new Media({
        uuid: uuidv4(),
        type: 'video',
        uri: uploadedUrl,
        thumbnail: thumbnail
      });
      console.log("!!!!!!!!!newMediaItem!!!!!!!!!!!!!!",newMediaItem)
      setNewMedia([...newMedia, newMediaItem]);
    }
  };
  console.log("!!!!!!!!!!!!This is the note!!!!!!!!",newMedia);

  const goBig = (index: number) => {
    const currentMedia = newMedia[index];
  }

  const handleNewMedia = async () => {
    Alert.alert(
      "Upload Media",
      "Choose from library or take a photo/video",
      [
        {
          text: "Take a Photo or Video",
          onPress: async () => {
            const { status } = await requestCameraPermissionsAsync();
            if (status !== "granted") {
              alert("Sorry, we need camera permissions to make this work!");
              return;
            }

            console.log("Opening camera...");
            const cameraResult = await launchCameraAsync({
              mediaTypes: MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.75,
              videoMaxDuration: 300,
            });

            if (!cameraResult.canceled) {
              handleImageSelection(cameraResult);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              alert(
                "Sorry, we need media library permissions to make this work!"
              );
              return;
            }

            console.log("Opening image library...");
            const libraryResult = await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!libraryResult.canceled) {
              handleImageSelection(libraryResult);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
     { cancelable: false }
    );
  };

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = [...newMedia];
    updatedMedia.splice(index, 1);
    setNewMedia(updatedMedia);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={handleNewMedia}>
          <Image style={styles.image} source={require("./public/new.png")} />
        </TouchableOpacity>
        {newMedia?.map((media, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.trash}
              onPress={() => handleDeleteMedia(index)}
            >
              <Ionicons
                style={{ alignSelf: "center" }}
                name="trash-outline"
                size={20}
                color="#111111"
              />
            </TouchableOpacity>
            <TouchableOpacity
              key={index}
              onPress={() => goBig(index)}
            >
              {media.isVideo() ? (
                <Image style={styles.image} source={{ uri: media.getThumbnail() }} />
              ) : (
                <Image style={styles.image} source={{ uri: media.getUri() }} />
              )}
            </TouchableOpacity>
          </View>
        ))}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "95%",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
  },
  trash: {
    position: "absolute",
    zIndex: 99,
    height: "20%",
    width: "20%",
    backgroundColor: "red",
    borderRadius: 10,
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default PhotoScroller;
