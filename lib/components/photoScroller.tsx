import React, { useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { Media, VideoType, PhotoType } from "../models/media_class";
import uuid from "react-native-uuid";
import { getThumbnail, convertHeicToJpg, uploadMedia } from "../utils/S3_proxy";

function PhotoScroller({
  newMedia,
  setNewMedia,
}: {
  newMedia: Media[];
  setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
}) {
  const [videoToPlay, setVideoToPlay] = useState("");
  const [imageToShow, setImageToShow] = useState("");
  const [type, setType] = useState("photo");
  const [playing, setPlaying] = useState(false);

  const handleImageSelection = async (result: {
    canceled?: false;
    assets: any;
  }) => {
    const { uri } = result.assets[0];
    console.log("Selected image URI: ", uri);

    if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {
      const jpgUri = await convertHeicToJpg(uri);
      const uploadedUrl = await uploadMedia(jpgUri, "image");
      console.log("After URL is retrieved from upload Media ", uploadedUrl);
      const newMediaItem = new PhotoType({
        uuid: uuid.v4().toString(),
        type: "image",
        uri: uploadedUrl,
      });
      setNewMedia([...newMedia, newMediaItem]);
    } else if (
      uri.endsWith(".jpg") ||
      uri.endsWith("png") ||
      uri.endsWith(".jpeg")
    ) {
      const uploadedUrl = await uploadMedia(uri, "image");
      console.log("I don't think it is getting here!!!!!!");
      console.log("After URL is retrieved from upload Media ", uploadedUrl);
      const newMediaItem = new PhotoType({
        uuid: uuid.v4().toString(),
        type: "image",
        uri: uploadedUrl,
      });
      setNewMedia([...newMedia, newMediaItem]);
    } else if (
      uri.endsWith(".MOV") ||
      uri.endsWith(".mov") ||
      uri.endsWith(".mp4")
    ) {
      const uploadedUrl = await uploadMedia(uri, "video");
      const thumbnail = await getThumbnail(uri);
      console.log("After URL is retrieved from upload Media ", uploadedUrl);
      const newMediaItem = new VideoType({
        uuid: uuid.v4().toString(),
        type: "video",
        uri: uploadedUrl,
        thumbnail: thumbnail,
        duration: "0:00",
      });
      setNewMedia([...newMedia, newMediaItem]);
    }
  };

  const goBig = (index: number) => {
    const currentMedia = newMedia[index];
    if (currentMedia.getType() === "video") {
      setType("video");
      setVideoToPlay(currentMedia.getUri());
      setPlaying(true);
    } else {
      setType("image");
      setImageToShow(currentMedia.getUri());
      setPlaying(true);
    }
  };

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
    <View
      style={[
        styles.container,
        { marginBottom: playing ? 100 : 0, marginTop: playing ? 30 : 0, height: playing ? 'auto' : 110 },
      ]}
    >
      {playing && type === "video" ? (
        <View style={styles.miniContainer}>
          <Button
            title="Close Viewer"
            onPress={() => setPlaying(false)}
          ></Button>
          <Video
            source={{ uri: videoToPlay }}
            resizeMode="cover"
            shouldPlay
            useNativeControls
            isLooping
            style={styles.video}
          />
        </View>
      ) : playing && type === "image" ? (
        <View style={styles.miniContainer}>
          <Button
            title="Close Viewer"
            onPress={() => setPlaying(false)}
          ></Button>
          <Image source={{ uri: imageToShow }} style={styles.video} />
        </View>
      ) : (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.image,
              {
                backgroundColor: "rgb(240,240,240)",
                justifyContent: "center",
              },
            ]}
            onPress={handleNewMedia}
          >
            <Ionicons
              style={{ alignSelf: "center" }}
              name="camera-outline"
              size={60}
              color="#111111"
            />
          </TouchableOpacity>
          {newMedia?.map((media, index) => {
            return (
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
                <TouchableOpacity key={index} onPress={() => goBig(index)}>
                  {media.getType() === "video" ? (
                    <View style={styles.miniContainer}>
                      <Image
                        style={styles.image}
                        source={{ uri: (media as VideoType).getThumbnail() }}
                      />
                      <View style={styles.playUnderlay}>
                        <Ionicons
                          name="play-outline"
                          size={24}
                          color="#dfe5e8"
                          style={styles.icon}
                        />
                      </View>
                    </View>
                  ) : (
                    <Image
                      style={styles.image}
                      source={{ uri: media.getUri() }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default PhotoScroller;


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 5,
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
  justifyContent: 'center',
  alignSelf: 'center',
 },
  miniContainer: {
    width: '100%',
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    position: "relative",
    alignSelf: "center",
    marginLeft: 2,
    marginTop: 2,
  },
  playUnderlay: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "rgba(5,5,5,0.5)",
    position: "absolute",
    right: 40,
    bottom: 36,
  },
});