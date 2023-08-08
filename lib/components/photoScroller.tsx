import React, { useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
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

function PhotoScroller({
  newMedia,
  setNewMedia,
}: {
  newMedia: Media[];
  setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
}) {
  const [videoToPlay, setVideoToPlay] = useState("");
  const [imageToShow, setImageToShow] = useState(0);
  const [type, setType] = useState("photo");
  const [playing, setPlaying] = useState(false);
  const [images, setImages] = useState([]);

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

  const goBig = (index: number) => {
    setImageToShow(index);

    let curImages: string[] = [];

    for (let x = 0; x < newMedia.length; x++) {
      if (newMedia[x].getType() === "image") {
        curImages.push(newMedia[x].getUri());
      } else if (newMedia[x].getType() === "video"){
        curImages.push((newMedia[x] as VideoType).getThumbnail())
      }
    }

    setImages(curImages);
    setType("image");
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
      {playing && type === "video" ? (
        <View style={styles.miniContainer}>
          <Button
            title="Close Viewer"
            onPress={() => setPlaying(false)}
          ></Button>
          <Video
            source={{ uri: videoToPlay }}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            useNativeControls
            isLooping
            style={styles.video}
          />
        </View>
      ) : playing && type === "image" ? (
        <ImageView
          images={images.map((image, index) => ({
            uri: image,
            key: `image-${index}`,
          }))}
          imageIndex={imageToShow}
          visible={playing}
          onRequestClose={() => setPlaying(false)}
        />
      ) : (
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
});
