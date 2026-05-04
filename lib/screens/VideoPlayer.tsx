import React from "react";
import { View } from "react-native";
import { Video, ResizeMode } from "expo-av";

interface VideoPlayerProps {
  videoUri: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri }) => {
  const videoRef = React.useRef<Video>(null);

  return (
    <View className="w-[90%] h-[50%] items-center justify-center">
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={{ width: "100%", height: "100%" }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        shouldPlay
      />
    </View>
  );
};

export default VideoPlayer;
