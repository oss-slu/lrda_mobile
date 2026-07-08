import React from "react";
import { View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

interface VideoPlayerProps {
  videoUri: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri }) => {
  const player = useVideoPlayer(videoUri, (player) => {
    player.play();
  });

  return (
    <View className="h-[50%] w-[90%] items-center justify-center">
      <VideoView player={player} style={{ width: "100%", height: "100%" }} nativeControls contentFit="contain" />
    </View>
  );
};

export default VideoPlayer;
