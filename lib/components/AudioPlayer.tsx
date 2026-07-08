import React from "react";
import { View, Button, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

interface AudioPlayerProps {
  audioUri: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUri }) => {
  const player = useAudioPlayer({ uri: audioUri });
  const status = useAudioPlayerStatus(player);

  const duration = status.isLoaded ? status.duration * 1000 : 0;
  const position = status.isLoaded ? status.currentTime * 1000 : 0;
  const isPlaying = status.playing;

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSliderChange = (value: number) => {
    player.seekTo(value / 1000);
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <View className="my-5 items-center">
      <View className="w-[90%] items-center">
        <Slider
          style={{ width: "100%" }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={handleSliderChange}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#D3D3D3"
          thumbTintColor="#1DB954"
        />
        <View className="mt-[5px] w-full flex-row justify-between">
          <Text className="text-xs text-[#555]">{formatTime(position)}</Text>
          <Text className="text-xs text-[#555]">{formatTime(duration || 0)}</Text>
        </View>
      </View>
      <Button title={isPlaying ? "Pause" : "Play"} onPress={handlePlayPause} />
    </View>
  );
};

export default AudioPlayer;
