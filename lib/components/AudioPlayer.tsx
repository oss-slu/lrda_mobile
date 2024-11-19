import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  audioUri: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUri }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load the audio when the component mounts
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
    };
    loadSound();

    // Cleanup the sound when the component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View>
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={handlePlayPause} />
    </View>
  );
};

export default AudioPlayer;
