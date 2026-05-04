import React, { useState, useEffect } from "react";
import { Modal, View, ScrollView, Text, TouchableOpacity, Dimensions } from "react-native";
import { Video, ResizeMode, Audio } from "expo-av";

interface VideoType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  videos: VideoType[];
}

const { width } = Dimensions.get("window");

const VideoModal: React.FC<Props> = ({ isVisible, onClose, videos }) => {
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isImageTouched, setIsImageTouched] = useState(false);
  const [status, setStatus] = React.useState({});
  const video = React.useRef(null);

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch((error) => {
      console.error("Failed to configure audio mode:", error);
    });
  }, []);

  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center pt-[45px] w-full">
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={videos && videos.length > 2 ? handleImageTouchStart : undefined}
        >
          {videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <View key={index} className="items-center w-full pb-[1.25px]">
                <Video
                  source={{ uri: video.uri }}
                  style={{ width, height: width }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                />
              </View>
            ))
          ) : (
            <Text className="font-inter self-center justify-center mt-[200px]">No Videos</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          className="h-10 w-[75px] items-center justify-center mt-5 bg-[#ddd] p-2.5 rounded-[5px] mb-[30px]"
          onPress={onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VideoModal;
