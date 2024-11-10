import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

interface VideoPlayerProps {
  videoUri: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri }) => {
  const videoRef = React.useRef<Video>(null);

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.videoPlayer}
        useNativeControls
        resizeMode="contain"
        isLooping={false}
        shouldPlay
      />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
    videoContainer: {
      width: '90%',
      height: '50%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoPlayer: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain', // Ensures the video scales to fit within container
    },
  });
  