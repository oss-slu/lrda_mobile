import React from "react";
import { View, Text, Button } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useRouter, useLocalSearchParams } from "expo-router";

const AudioPlayerScreen: React.FC = () => {
  const router = useRouter();
  const { audioUri } = useLocalSearchParams<{ audioUri: string }>();
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);

  React.useEffect(() => {
    player.play();
  }, [player]);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="font-inter">Audio Playback</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

export default AudioPlayerScreen;
