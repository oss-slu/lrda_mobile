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
  const [isImageTouched, setIsImageTouched] = useState(false);

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
      <View className="w-full flex-1 items-center justify-center pt-[45px]">
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={videos && videos.length > 2 ? handleImageTouchStart : undefined}
        >
          {videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <View key={index} className="w-full items-center pb-[1.25px]">
                <Video
                  source={{ uri: video.uri }}
                  style={{ width, height: width }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>
            ))
          ) : (
            <Text className="mt-[200px] justify-center self-center font-inter">No Videos</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          className="mb-[30px] mt-5 h-10 w-[75px] items-center justify-center rounded-[5px] bg-[#ddd] p-2.5"
          onPress={onClose}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VideoModal;
