import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  launchCameraAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
} from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Media, VideoType, PhotoType } from "../models/media_class";
import uuid from "react-native-uuid";
import { getThumbnail, convertHeicToJpg, uploadMedia } from "../utils/S3_proxy";
import LoadingImage from "./loadingImage";
import DraggableFlatList from "react-native-draggable-flatlist";
import ImageView from "react-native-image-viewing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Dimensions } from "react-native";

function PhotoScroller({
  newMedia,
  setNewMedia,
}: {
  newMedia: Media[];
  setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
}) {
  const [imageToShow, setImageToShow] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowFooter(false);
    setShowHeader(false);
    setShowVideo(false);
  }, [currentImageIndex]);

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

  const handleSaveMedia = async (imageURI: string) => {
    try {
      const fileName = imageURI.replace(/^.*[\\\/]/, "");
      const imageFullPathInLocalStorage =
        FileSystem.documentDirectory + fileName;

      FileSystem.downloadAsync(imageURI, imageFullPathInLocalStorage).then(
        async ({ uri }) => {
          await MediaLibrary.saveToLibraryAsync(imageFullPathInLocalStorage);
        }
      );
      setShowFooter(true);
      setTimeout(() => {
        setShowFooter(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  const goBig = (index: number) => {
    setImageToShow(index);

    let curImages: string[] = [];

    for (let x = 0; x < newMedia.length; x++) {
      if (newMedia[x].getType() === "image") {
        curImages.push(newMedia[x].getUri());
      } else if (newMedia[x].getType() === "video") {
        curImages.push((newMedia[x] as VideoType).getThumbnail());
      }
    }

    setImages(curImages);
    setPlaying(true);
  };

  const renderItem = ({ item: media, getIndex, drag }) => {
    const index = getIndex();
    const key = `media-${index}`;
    const mediaItem = media;
    const ImageType = mediaItem?.getType();
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.getUri();
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.getThumbnail();
      IsImage = true;
    }
    return (
      <View key={key}>
        <TouchableOpacity
          style={styles.trash}
          onPress={() => handleDeleteMedia(index)}
        ></TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onLongPress={drag}
          delayLongPress={100}
          onPress={() => goBig(index)}
        >
          <View
            style={{
              alignSelf: "center",
              height: 100,
              width: 100,
              marginRight: index === newMedia.length - 1 ? 10 : 0,
            }}
          >
            {IsImage ? (
              <LoadingImage
                imageURI={ImageURI}
                type={ImageType}
                isImage={true}
              />
            ) : (
              <LoadingImage imageURI={""} type={ImageType} isImage={false} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const handleNewMedia = async () => {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }
    const cameraResult = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [3, 4],
      quality: 0.75,
      videoMaxDuration: 300,
    });

    if (!cameraResult.canceled) {
      handleImageSelection(cameraResult);
    }
  };

  function Footer({ imageIndex }: { imageIndex: number }) {
    return showFooter ? (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Media Saved to Device</Text>
      </View>
    ) : null;
  }

  function Header({ imageIndex }: { imageIndex: number }) {
    const [showVideo, setShowVideo] = useState(false);
    const showHeader = newMedia[imageIndex].getType() === "video";

    return showHeader ? (
      <View>
        <TouchableOpacity
          style={styles.closeUnderlay}
          onPress={() => setPlaying(false)}
        >
          <Ionicons
            name="close-outline"
            size={24}
            color="#dfe5e8"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playUnderlay}
          onPress={() => setShowVideo(true)}
        >
          <Ionicons
            name="play-outline"
            size={24}
            color="#dfe5e8"
            style={styles.icon}
          />
        </TouchableOpacity>
        {showVideo && (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: newMedia[imageIndex].getUri() }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              useNativeControls={true}
              isLooping={true}
              style={styles.video}
            />
          </View>
        )}
      </View>
    ) : (
      <TouchableOpacity
        style={styles.closeUnderlay}
        onPress={() => setPlaying(false)}
      >
        <Ionicons
          name="close-outline"
          size={24}
          color="#dfe5e8"
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  }

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = [...newMedia];
    updatedMedia.splice(index, 1);
    setNewMedia(updatedMedia);
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginBottom: playing ? 100 : 0,
          marginTop: playing ? 30 : 0,
          height: playing ? "auto" : 110,
        },
      ]}
    >
      {playing && (
        <View>
          <ImageView
            images={images.map((image, index) => ({
              uri: image,
              key: `image-${index}`,
            }))}
            imageIndex={imageToShow}
            onImageIndexChange={(index) => setCurrentImageIndex(index)}
            onLongPress={() =>
              handleSaveMedia(newMedia[currentImageIndex].getUri())
            }
            visible={playing}
            onRequestClose={() => setPlaying(false)}
            FooterComponent={(imageIndex) => Footer(imageIndex)}
            HeaderComponent={(imageIndex) => Header(imageIndex)}
          />
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
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
        <DraggableFlatList
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          style={{ paddingLeft: 10, marginRight: 100 }}
          data={newMedia}
          renderItem={renderItem}
          keyExtractor={(item, index) => `item-${index}`}
          onDragEnd={({ data }) => setNewMedia(data)}
        />
      </View>
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
  },
  trash: {
    position: "absolute",
    left: -5,
    zIndex: 99,
    height: "13%",
    width: "13%",
    backgroundColor: "red",
    borderRadius: 30,
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignSelf: "center",
  },
  miniContainer: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  footerContainer: {
    backgroundColor: "rgba(255,255,255, 0.8)",
    padding: 10,
    alignItems: "center",
    marginBottom: "13%",
    width: "80%",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 10,
  },
  footerText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  playUnderlay: {
    marginTop: "60%",
    top: "50%",
    left: "50%",
    transform: [{ translateY: -25 }, { translateX: -25 }],
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "rgba(5,5,5,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeUnderlay: {
    position: "absolute",
    top: 50,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "rgba(5,5,5,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  icon: {
    alignSelf: "center",
    marginLeft: 4,
  },
  videoContainer: {
    marginVertical: 50,
    width: "100%",
    height: Dimensions.get("screen").height-70,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    backgroundColor: "#000",
  },
});
