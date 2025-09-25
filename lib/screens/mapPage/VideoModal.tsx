import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Button,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';

// Video Item Component
const VideoItem = ({ video }) => {
  const player = useVideoPlayer({ uri: video.uri }, (player) => {
    player.loop = true;
  });
  
  // Listen to player events for better state management
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  
  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};
import { useTheme } from "../../components/ThemeProvider";
import { defaultTextFont } from '../../../styles/globalStyles';

interface VideoType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  videos: VideoType[];
}

const { width, height } = Dimensions.get("window");

const VideoModal: React.FC<Props> = ({ isVisible, onClose, videos }) => {
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isImageTouched, setIsImageTouched] = useState(false);
  const [status, setStatus] = React.useState({});
  const video = React.useRef(null);
  const theme = useTheme();

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };


  console.log(videos);

  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={videos && videos.length > 2 ? handleImageTouchStart : undefined}
        >
          {videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <VideoItem key={index} video={video} />
            ))
          ) : (
            <Text style={styles.noVideosText}>No Videos</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 45,
    width: '100%',
  },
  videoContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 1.25,
  },
  video: {
    width: width,
    height: width,
  },
  noVideosText: {
    ...defaultTextFont,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 200,
  },
  closeButton: {
    height: 40,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 30,
  },
});

export default VideoModal;