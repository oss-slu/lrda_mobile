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
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";
import { Media, VideoType, PhotoType } from "../models/media_class";
import uuid from "react-native-uuid";
import { getThumbnail, convertHeicToJpg, uploadMedia } from "../utils/S3_proxy";
import LoadingImage from "./loadingImage";
import DraggableFlatList from "react-native-draggable-flatlist";
import ImageView from "react-native-image-viewing";
import { File, Paths } from "expo-file-system";
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



    // 🎥 VIDEO COMPONENT
    const VideoComponent = ({ mediaItem }) => {
      if (!mediaItem || mediaItem.getType() !== "video") return null;
      
      const player = useVideoPlayer({ uri: mediaItem.getUri() }, (player) => {
        player.loop = true;
        player.muted = true;
      });

      // Listen to player events
      const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
      const { status } = useEvent(player, 'statusChange', { status: player.status });

      return (
        <VideoView
          player={player}
          contentFit="contain"
          nativeControls
          style={PhotoStyles.video}
        />
      );
    };

    useImperativeHandle(
      ref,
      () => ({
        goBig,
      }),
      []
    );

  useEffect(() => {
    return () => {
      // Component cleanup
    };
  }, []);

  useEffect(() => {
    // Media array updated
  }, [newMedia]);
    

    const handleImageSelection = async (result: {
      canceled?: false;
      assets: any;
    }) => {
      const { uri } = result.assets[0];

      try {
        if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {
          const jpgUri = await convertHeicToJpg(uri);
          const uploadedUrl = await uploadMedia(jpgUri, "image");
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
      } catch (error) {
        displayErrorInEditor(`Failed to upload media: ${error.message}`);
      }
    };

    const displayErrorInEditor = async (errorMessage: string) => {
      Alert.alert("Error", errorMessage); // Alerts the error message to the user
    };


    const handleSaveMedia = async (imageURI: string) => {
      try {
        const fileName = imageURI.replace(/^.*[\\\/]/, "");
        // Use the new FileSystem API for saving media
        const sourceFile = new File(imageURI);
        const destinationFile = new File(Paths.cache, fileName);
        
        // Copy the file to cache directory
        sourceFile.copy(destinationFile);
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(destinationFile.uri);
        
        setShowFooter(true);
        setTimeout(() => {
          setShowFooter(false);
        }, 2000);
      } catch (error) {
        displayErrorInEditor(`Error uploading media: ${error.message}`);
      }
    };

    const goBig = (index: number) => {
      setImageToShow(index);

      let curImages: string[] = [];

      for (let x = 0; x < newMedia.length; x++) {
        const mediaItem = newMedia[x];
        const mediaType = mediaItem.getType();
        
        if (mediaType === "image") {
          curImages.push(mediaItem.getUri());
        } else if (mediaType === "video") {
          try {
            if (mediaItem instanceof VideoType) {
              const thumbnail = mediaItem.getThumbnail();
              curImages.push(thumbnail);
            } else {
              // Fallback: try to access thumbnail property directly
              const videoItem = mediaItem as any;
              
              if (videoItem.thumbnail) {
                curImages.push(videoItem.thumbnail);
              } else {
                // Last resort: use the video URI itself
                curImages.push(mediaItem.getUri());
              }
            }
          } catch (error) {
            curImages.push(mediaItem.getUri());
          }
        }
      }

      setImages(curImages);
      setPlaying(true);
      setShowVideo(false); // Ensure video overlay is hidden when going to full view
    };

    const renderItem = ({
      item: media,
      getIndex,
      drag,
    }: {
      item: Media;
      getIndex: Function;
      drag: () => void;
    }) => {
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
        try {
          // Check if it's actually a VideoType instance
          if (mediaItem instanceof VideoType) {
            ImageURI = mediaItem.getThumbnail();
            IsImage = true;
          } else {
            // Fallback: try to access thumbnail property directly
            const videoItem = mediaItem as any;
            
            if (videoItem.thumbnail) {
              ImageURI = videoItem.thumbnail;
              IsImage = true;
            } else {
              // Last resort: use the video URI itself
              ImageURI = mediaItem.getUri();
              IsImage = true;
            }
          }
        } catch (error) {
          // Fallback to video URI
          ImageURI = mediaItem.getUri();
          IsImage = true;
        }
      }
      
      
      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.5}
          onLongPress={drag}
          delayLongPress={100}
          onPress={() => goBig(index)}
        >
          <View style={styles.mediaItem}>
            {IsImage ? (
              <LoadingImage
                imageURI={ImageURI}
                type={ImageType}
                isImage={true}
                width={100}
                height={100}
              />
            ) : (
              <View style={[styles.mediaItem, { 
                backgroundColor: '#f0f0f0', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }]}>
                <Ionicons 
                  name={ImageType === "video" ? "play-circle-outline" : "image-outline"} 
                  size={40} 
                  color="#666" 
                />
                <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>
                  {ImageType === "video" ? "Video" : "Media"}
                </Text>
              </View>
            )}
            
            {/* Delete/Archive X Button */}
            <TouchableOpacity
              style={PhotoStyles.deleteButton}
              onPress={() => handleDeleteMedia(index)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    };

    const handleDeleteMedia = (index: number) => {
      Alert.alert(
        'Delete Media',
        'Are you sure you want to delete this media item?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const updatedMedia = newMedia.filter((_, i) => i !== index);
              setNewMedia(updatedMedia);
            },
          },
        ]
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
                handleImageSelection(cameraResult as any);
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
                handleImageSelection(galleryResult as any);
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
          {showVideo && newMedia && newMedia.length > 0 && currentImageIndex < newMedia.length && (
            <View style={[PhotoStyles.videoContainer, { marginTop: 10 }]}>
              <VideoComponent mediaItem={newMedia[currentImageIndex]} />
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
              position: "relative", // Ensure proper positioning context
            },
          ]}
        >
          {playing && renderImageView()}
          <View style={{ 
            flexDirection: "row",
            flexWrap: "wrap", // Allow wrapping if needed
            alignItems: "center",
            justifyContent: "flex-start",
          }}>
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
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 5,
    borderRadius: 10,
    overflow: "hidden", // Prevent content from overflowing
    position: "relative", // Ensure proper positioning context
  },
});
