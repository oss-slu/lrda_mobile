import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';

interface VideoPlayerProps {
  videoUri: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri }) => {
  const player = useVideoPlayer({ uri: videoUri }, (player) => {
    // Auto-play when component mounts
    player.play();
  });

  // Listen to player state changes
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.videoPlayer}
        nativeControls
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
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
  