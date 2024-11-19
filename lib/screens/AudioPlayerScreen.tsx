import React from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';

const AudioPlayerScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { audioUri } = route.params;
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Audio Playback</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default AudioPlayerScreen;
