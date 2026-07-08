import React, { useState, useEffect } from "react";
import { Modal, View, ScrollView, Text, TouchableOpacity, Dimensions } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { setAudioModeAsync } from "expo-audio";

interface VideoType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  videos: VideoType[];
}

const { width } = Dimensions.get("window");

const VideoItem: React.FC<{ uri: string }> = ({ uri }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
  });

  return <VideoView player={player} style={{ width, height: width }} nativeControls contentFit="contain" />;
};

const VideoModal: React.FC<Props> = ({ isVisible, onClose, videos }) => {
  const [isImageTouched, setIsImageTouched] = useState(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
      interruptionMode: "duckOthers",
      shouldRouteThroughEarpiece: false,
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
                <VideoItem uri={video.uri} />
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
