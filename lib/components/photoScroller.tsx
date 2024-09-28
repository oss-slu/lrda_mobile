import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync
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
import { PhotoStyles } from "../../styles/components/PhotoScrollerStyles"

const PhotoScroller = forwardRef(
  (
    {
      newMedia,
      setNewMedia,
      active,
      insertImageToEditor,
      addVideoToEditor,
    }: {
      newMedia: Media[];
      setNewMedia: React.Dispatch<React.SetStateAction<Media[]>>;
      active: Boolean;
      insertImageToEditor: Function;
      addVideoToEditor: Function;
    },
    ref
  ) => {
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

    useImperativeHandle(
      ref,
      () => ({
        goBig,
      }),
      []
    );

    useEffect(() => {
      console.log("PhotoScroller mounted");
      return () => {
        console.log("PhotoScroller unmounted");
      };
    }, []);

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
        insertImageToEditor(uploadedUrl);
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
        if (insertImageToEditor) {
          insertImageToEditor(uploadedUrl, 'Captured Image');
        }
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
        addVideoToEditor(uploadedUrl);
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
      const mediaItem = media;
      const ImageType = mediaItem.getType();
      const ImageURI = ImageType === 'image' ? mediaItem.getUri() : (mediaItem as VideoType).getThumbnail();
    
      return (
        <View key={index} style={styles.mediaContainer}>
          <TouchableOpacity style={PhotoStyles.trash} onPress={() => handleDeleteMedia(index)}>
            <Ionicons name="close-outline" size={15} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onLongPress={drag} delayLongPress={100} onPress={() => goBig(index)}>
            <View style={styles.mediaItem}>
              <LoadingImage imageURI={ImageURI} type={ImageType} isImage={ImageType === 'image'} />
            </View>
          </TouchableOpacity>
        </View>
      );
    };
    

    const handleNewMedia = async () => {
      Alert.alert(
        'Select Media',
        'Choose the source for your media:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Take Photo',
            onPress: async () => {
              const { status } = await requestCameraPermissionsAsync();
              if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
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
            text: 'Choose from Camera Roll',
            onPress: async () => {
              const { status } = await requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
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
                // Pass the selected image to handleImageSelection
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
        <View style={PhotoStyles.footerContainer}>
          <Text style={PhotoStyles.footerText}>Media Saved to Device</Text>
        </View>
      ) : null;
    }

    function Header({ imageIndex }: { imageIndex: number }) {
      const [showVideo, setShowVideo] = useState(false);
      const showHeader = newMedia[imageIndex].getType() === "video";

      return showHeader ? (
        <View>
          <TouchableOpacity
            style={PhotoStyles.closeUnderlay}
            onPress={() => setPlaying(false)}
          >
            <Ionicons
              name="close-outline"
              size={24}
              // color="#dfe5e8"
              style={PhotoStyles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={PhotoStyles.playUnderlay}
            onPress={() => setShowVideo(true)}
          >
            <Ionicons
              name="play-outline"
              size={24}
              color="#dfe5e8"
              style={PhotoStyles.icon}
            />
          </TouchableOpacity>
          {showVideo && (
            <View style={PhotoStyles.videoContainer}>
              <Video
                source={{ uri: newMedia[imageIndex].getUri() }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                useNativeControls={true}
                isLooping={true}
                style={PhotoStyles.video}
              />
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={PhotoStyles.closeUnderlay}
          onPress={() => setPlaying(false)}
        >
          <Ionicons
            name="close-outline"
            size={24}
            color="#dfe5e8"
            style={PhotoStyles.icon}
          />
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
          onLongPress={() =>
            handleSaveMedia(newMedia[currentImageIndex].getUri())
          }
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
          style={[
            PhotoStyles.container,
            {
              marginBottom: playing ? 100 : 0,
              marginTop: playing ? 30 : 0,
              height: playing ? "auto" : 110,
            },
          ]}
        >
          {playing && renderImageView()}
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              testID="photoScrollerButton"
              style={[
                PhotoStyles.image,
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
    } else {
      return <View>{playing && renderImageView()}</View>;
    }
  }
);

export default PhotoScroller;

const styles = StyleSheet.create({
  container: {
    marginBottom: 100,
    marginTop: 30,
    height: 110,
  },
  addButton: {
    backgroundColor: "rgb(240,240,240)",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    marginRight: 10,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows items to wrap when they overflow
    justifyContent: 'space-between', // Evenly distributes items
    marginBottom: 10, // Adds spacing at the bottom
  },
  mediaItem: {
    width: 100, // You can adjust these values
    height: 100,
    marginRight: 5, // Spacing between images
  },
});

