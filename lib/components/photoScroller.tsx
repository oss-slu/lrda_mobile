import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import type { Media, VideoType, PhotoType } from "../models/media_class";
import uuid from "react-native-uuid";
import { getThumbnail, convertHeicToJpg, uploadMedia } from "../utils/S3_proxy";
import LoadingImage from "./loadingImage";
import DraggableFlatList from "react-native-draggable-flatlist";
import ImageView from "react-native-image-viewing";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

const PhotoScroller = forwardRef(function PhotoScroller(
  {
    newMedia,
    setNewMedia,
    active,
    insertImageToEditor,
    addVideoToEditor,
  }: {
    newMedia: Media[];
    setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
    active: boolean;
    insertImageToEditor: Function;
    addVideoToEditor: Function;
  },
  ref
) {
  const [imageToShow, setImageToShow] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    setShowFooter(false);
  }, [currentImageIndex]);

  const goBig = useCallback(
    (index: number) => {
      setImageToShow(index);

      let curImages: string[] = [];

      for (let x = 0; x < newMedia.length; x++) {
        if (newMedia[x].type === "image") {
          curImages.push(newMedia[x].uri);
        } else if (newMedia[x].type === "video") {
          curImages.push((newMedia[x] as VideoType).thumbnail);
        }
      }

      setImages(curImages);
      setPlaying(true);
    },
    [newMedia]
  );

  useImperativeHandle(
    ref,
    () => ({
      goBig,
    }),
    [goBig]
  );

  useEffect(() => {
    console.log("PhotoScroller mounted");
    return () => {
      console.log("PhotoScroller unmounted");
    };
  }, []);

  const handleImageSelection = async (result: { assets: any }) => {
    const { uri } = result.assets[0];
    console.log("Selected image URI: ", uri);

    if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {
      const jpgUri = await convertHeicToJpg(uri);
      const uploadedUrl = await uploadMedia(jpgUri, "image");
      const newMediaItem: PhotoType = { uuid: uuid.v4().toString(), type: "image", uri: uploadedUrl };
      setNewMedia([...newMedia, newMediaItem]);
      insertImageToEditor(uploadedUrl);
    } else if (uri.endsWith(".jpg") || uri.endsWith("png") || uri.endsWith(".jpeg")) {
      const uploadedUrl = await uploadMedia(uri, "image");
      const newMediaItem: PhotoType = { uuid: uuid.v4().toString(), type: "image", uri: uploadedUrl };
      setNewMedia([...newMedia, newMediaItem]);
      if (insertImageToEditor) {
        insertImageToEditor(uploadedUrl, "Captured Image");
      }
    } else if (uri.endsWith(".MOV") || uri.endsWith(".mov") || uri.endsWith(".mp4")) {
      const uploadedUrl = await uploadMedia(uri, "video");
      const thumbnail = await getThumbnail(uri);
      const newMediaItem: VideoType = { uuid: uuid.v4().toString(), type: "video", uri: uploadedUrl, thumbnail, duration: "0:00" };
      setNewMedia([...newMedia, newMediaItem]);
      addVideoToEditor(uploadedUrl);
    }
  };

  const displayErrorInEditor = async (errorMessage: string) => {
    Alert.alert("Error", errorMessage);
  };

  const handleSaveMedia = async (imageURI: string) => {
    try {
      const fileName = imageURI.replace(/^.*[\\\/]/, "");
      const imageFullPathInLocalStorage = FileSystem.documentDirectory + fileName;

      await FileSystem.downloadAsync(imageURI, imageFullPathInLocalStorage);
      await MediaLibrary.saveToLibraryAsync(imageFullPathInLocalStorage);
      setShowFooter(true);
      setTimeout(() => {
        setShowFooter(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving media:", error);
      displayErrorInEditor(`Error saving media: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const renderItem = ({ item: media, getIndex, drag }: { item: Media; getIndex: Function; drag: () => void }) => {
    const index = getIndex();
    const key = `media-${index}`;
    const mediaItem = media;
    const ImageType = mediaItem?.type;
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.uri;
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = (mediaItem as VideoType).thumbnail;
      IsImage = true;
    }
    return (
      <View key={key}>
        <TouchableOpacity
          className="absolute z-[99] h-[15%] w-[15%] items-center justify-center rounded-full bg-black/75"
          onPress={() => handleDeleteMedia(index)}
        >
          <Ionicons name="close-outline" size={15} color="white" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} onLongPress={drag} delayLongPress={100} onPress={() => goBig(index)}>
          <View className="mr-[5px] h-[100px] w-[100px]">
            {IsImage ? (
              <LoadingImage imageURI={ImageURI} type={ImageType} isImage={true} />
            ) : (
              <LoadingImage imageURI={""} type={ImageType} isImage={false} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const handleNewMedia = async () => {
    Alert.alert(
      "Select Media",
      "Choose the source for your media:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Take Photo",
          onPress: async () => {
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
          },
        },
        {
          text: "Choose from Camera Roll",
          onPress: async () => {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              alert("Sorry, we need camera roll permissions to make this work!");
              return;
            }
            const galleryResult = await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              allowsEditing: false,
              aspect: [3, 4],
              quality: 0.75,
              videoMaxDuration: 300,
            });
            if (!galleryResult.canceled) {
              handleImageSelection(galleryResult);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  function Footer({ imageIndex }: { imageIndex: number }) {
    return showFooter ? (
      <View className="mb-[13%] w-[80%] items-center justify-center self-center rounded-sm bg-white/80 p-[10px]">
        <Text className="text-center font-inter text-base font-bold text-foreground">Media Saved to Device</Text>
      </View>
    ) : null;
  }

  function Header({ imageIndex }: { imageIndex: number }) {
    const [showVideo, setShowVideo] = useState(false);
    const showHeader = newMedia[imageIndex].type === "video";

    return showHeader ? (
      <View>
        <TouchableOpacity
          className="absolute right-[10px] top-[50px] z-[100] h-[50px] w-[50px] items-center justify-center rounded-full bg-black/50"
          onPress={() => setPlaying(false)}
        >
          <Ionicons name="close-outline" size={24} className="ml-1 self-center text-[#dfe5e8]" />
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-[60%] items-center justify-center rounded-full bg-black/50"
          style={{
            top: "50%",
            left: "50%",
            transform: [{ translateY: -25 }, { translateX: -25 }],
            width: 50,
            height: 50,
          }}
          onPress={() => setShowVideo(true)}
        >
          <Ionicons name="play-outline" size={24} color="#dfe5e8" className="ml-1 self-center text-[#dfe5e8]" />
        </TouchableOpacity>
        {showVideo && (
          <View
            className="absolute my-[50px] w-full items-center justify-center bg-primary"
            style={{ height: Dimensions.get("screen").height - 70 }}
          >
            <Video
              source={{ uri: newMedia[imageIndex].uri }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              useNativeControls={true}
              isLooping={true}
              className="h-full w-full justify-center self-center"
            />
          </View>
        )}
      </View>
    ) : (
      <TouchableOpacity
        className="absolute right-[10px] top-[50px] z-[100] h-[50px] w-[50px] items-center justify-center rounded-full bg-black/50"
        onPress={() => setPlaying(false)}
      >
        <Ionicons name="close-outline" size={24} color="#dfe5e8" className="ml-1 self-center text-[#dfe5e8]" />
      </TouchableOpacity>
    );
  }

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = [...newMedia];
    updatedMedia.splice(index, 1);
    setNewMedia(updatedMedia);
  };

  const renderImageView = () => (
    <View>
      <ImageView
        images={images.map((image, index) => ({
          uri: image,
          key: `image-${index}`,
        }))}
        imageIndex={imageToShow}
        onImageIndexChange={(index) => setCurrentImageIndex(index)}
        onLongPress={() => handleSaveMedia(newMedia[currentImageIndex].uri)}
        visible={playing}
        onRequestClose={() => setPlaying(false)}
        FooterComponent={(imageIndex) => Footer(imageIndex)}
        HeaderComponent={(imageIndex) => Header(imageIndex)}
      />
    </View>
  );

  if (active) {
    return (
      <View
        className="w-full justify-center bg-primary"
        style={{
          marginBottom: playing ? 100 : 0,
          marginTop: playing ? 30 : 0,
          height: playing ? "auto" : 110,
        }}
      >
        {playing && renderImageView()}
        <View className="flex-row">
          <TouchableOpacity
            testID="photoScrollerButton"
            className="h-[100px] w-[100px] items-center justify-center rounded-lg bg-[rgb(240,240,240)]"
            onPress={handleNewMedia}
          >
            <Ionicons className="self-center" name="camera-outline" size={60} color="#111111" />
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
  } else {
    return <View>{playing && renderImageView()}</View>;
  }
});

export default PhotoScroller;
