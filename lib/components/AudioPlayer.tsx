import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackStatus } from "expo-av";

interface AudioPlayerProps {
  audioUri: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUri }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: false }, onPlaybackStatusUpdate);
      setSound(sound);

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleSliderChange = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <View className="items-center my-5">
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
        <View className="flex-row justify-between w-full mt-[5px]">
          <Text className="text-xs text-[#555]">{formatTime(position)}</Text>
          <Text className="text-xs text-[#555]">{formatTime(duration || 0)}</Text>
        </View>
      </View>
      <Button title={isPlaying ? "Pause" : "Play"} onPress={handlePlayPause} />
    </View>
  );
};

export default AudioPlayer;
