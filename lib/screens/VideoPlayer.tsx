import React from "react";
import { View } from "react-native";
import { Video, ResizeMode } from "expo-av";

interface VideoPlayerProps {
  videoUri: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri }) => {
  const videoRef = React.useRef<Video>(null);

  return (
    <View className="h-[50%] w-[90%] items-center justify-center">
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
