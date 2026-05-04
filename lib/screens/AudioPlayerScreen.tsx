import React from "react";
import { View, Text, Button } from "react-native";
import { Audio } from "expo-av";
import { defaultTextFont } from "../../styles/globalStyles";
import { useRouter, useLocalSearchParams } from "expo-router";

const AudioPlayerScreen: React.FC = () => {
  const router = useRouter();
  const { audioUri } = useLocalSearchParams<{ audioUri: string }>();
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);

  React.useEffect(() => {
    async function loadAudio() {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      await sound.playAsync();
    }

    loadAudio();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [audioUri]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ ...defaultTextFont }}>Audio Playback</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

export default AudioPlayerScreen;
