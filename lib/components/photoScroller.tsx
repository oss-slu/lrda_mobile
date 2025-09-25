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
    console.log("PhotoScroller mounted");
    console.log("PhotoScroller initial media:", newMedia);
    return () => {
      console.log("PhotoScroller unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("🎬 [PhotoScroller] Media array updated:", {
      mediaCount: newMedia.length,
      mediaTypes: newMedia.map(m => m.getType()),
      videoItems: newMedia.filter(m => m.getType() === "video").map(m => ({
        uuid: m.getUuid(),
        uri: m.getUri(),
        isVideoType: m instanceof VideoType,
        thumbnail: m instanceof VideoType ? m.getThumbnail() : 'N/A'
      }))
    });
  }, [newMedia]);
    

    const handleImageSelection = async (result: {
      canceled?: false;
      assets: any;
    }) => {
      const { uri } = result.assets[0];
      console.log("Selected image URI: ", uri);

      try {
        if (uri.endsWith(".heic") || uri.endsWith(".HEIC")) {
          console.log("🖼️ [PhotoScroller] Processing HEIC image:", uri);
          const jpgUri = await convertHeicToJpg(uri);
          console.log("🔄 [PhotoScroller] Converted HEIC to JPG:", jpgUri);
          const uploadedUrl = await uploadMedia(jpgUri, "image");
          console.log("✅ [PhotoScroller] HEIC image uploaded successfully:", uploadedUrl);
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
          console.log("🖼️ [PhotoScroller] Processing image:", uri);
          const uploadedUrl = await uploadMedia(uri, "image");
          console.log("✅ [PhotoScroller] Image uploaded successfully:", uploadedUrl);
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
          console.log("🎥 [PhotoScroller] Processing video:", uri);
          console.log("🎥 [PhotoScroller] Video file details:", {
            uri: uri,
            fileName: uri.split('/').pop(),
            fileExtension: uri.split('.').pop()
          });
          
          console.log("🎥 [PhotoScroller] Starting video upload to S3...");
          const uploadedUrl = await uploadMedia(uri, "video");
          console.log("✅ [PhotoScroller] Video uploaded successfully to S3:", uploadedUrl);
          
          console.log("🎥 [PhotoScroller] Starting thumbnail generation...");
          const thumbnail = await getThumbnail(uri);
          console.log("🖼️ [PhotoScroller] Video thumbnail generated and uploaded:", thumbnail);
          
          console.log("🎥 [PhotoScroller] Creating VideoType instance with:", {
            uuid: uuid.v4().toString(),
            type: "video",
            uri: uploadedUrl,
            thumbnail: thumbnail,
            duration: "0:00"
          });
          
          const newMediaItem = new VideoType({
            uuid: uuid.v4().toString(),
            type: "video",
            uri: uploadedUrl,
            thumbnail: thumbnail,
            duration: "0:00",
          });
          
          console.log("🎥 [PhotoScroller] VideoType instance created:", newMediaItem);
          console.log("🎥 [PhotoScroller] VideoType thumbnail getter:", newMediaItem.getThumbnail());
          
          setNewMedia([...newMedia, newMediaItem]);
          addVideoToEditor(uploadedUrl);
        }
      } catch (error) {
        console.error("💥 [PhotoScroller] Error during media upload:", error);
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
        console.log("✅ [PhotoScroller] Media saved successfully:", destinationFile.uri);
        
        setShowFooter(true);
        setTimeout(() => {
          setShowFooter(false);
        }, 2000);
      } catch (error) {
        console.error("💥 [PhotoScroller] Error saving media:", error);
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
          console.log("🎬 [PhotoScroller] Processing video for goBig:", {
            mediaItem: mediaItem,
            isVideoType: mediaItem instanceof VideoType,
            videoUri: mediaItem.getUri()
          });
          
          try {
            if (mediaItem instanceof VideoType) {
              const thumbnail = mediaItem.getThumbnail();
              console.log("🎬 [PhotoScroller] VideoType thumbnail:", thumbnail);
              curImages.push(thumbnail);
            } else {
              // Fallback: try to access thumbnail property directly
              const videoItem = mediaItem as any;
              console.log("🎬 [PhotoScroller] Fallback video item:", {
                hasThumbnail: !!videoItem.thumbnail,
                thumbnail: videoItem.thumbnail,
                videoUri: mediaItem.getUri()
              });
              
              if (videoItem.thumbnail) {
                curImages.push(videoItem.thumbnail);
              } else {
                // Last resort: use the video URI itself
                console.log("🎬 [PhotoScroller] Using video URI as fallback:", mediaItem.getUri());
                curImages.push(mediaItem.getUri());
              }
            }
          } catch (error) {
            console.error("❌ [PhotoScroller] Error processing video thumbnail:", error);
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
        console.log("🎬 [PhotoScroller] renderItem processing video:", {
          mediaItem: mediaItem,
          isVideoType: mediaItem instanceof VideoType,
          videoUri: mediaItem.getUri()
        });
        
        try {
          // Check if it's actually a VideoType instance
          if (mediaItem instanceof VideoType) {
            ImageURI = mediaItem.getThumbnail();
            console.log("🎬 [PhotoScroller] renderItem VideoType thumbnail:", ImageURI);
            IsImage = true;
          } else {
            // Fallback: try to access thumbnail property directly
            const videoItem = mediaItem as any;
            console.log("🎬 [PhotoScroller] renderItem fallback video item:", {
              hasThumbnail: !!videoItem.thumbnail,
              thumbnail: videoItem.thumbnail,
              videoUri: mediaItem.getUri()
            });
            
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
          console.error("❌ [PhotoScroller] renderItem error processing video thumbnail:", error);
          // Fallback to video URI
          ImageURI = mediaItem.getUri();
          IsImage = true;
        }
      }
      
      console.log("🎬 [PhotoScroller] renderItem final values:", {
        ImageType: ImageType,
        ImageURI: ImageURI,
        IsImage: IsImage,
        key: key
      });
      
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
              console.log("🗑️ [PhotoScroller] Deleting media at index:", index);
              const updatedMedia = newMedia.filter((_, i) => i !== index);
              setNewMedia(updatedMedia);
              console.log("🗑️ [PhotoScroller] Media deleted. Remaining items:", updatedMedia.length);
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
