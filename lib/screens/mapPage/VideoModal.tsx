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
import { Video, ResizeMode, Audio } from 'expo-av';
import { useTheme } from "../../components/ThemeProvider";

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

  async function configureAudioPlayback() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio playback configured to play in silent mode.');
    } catch (error) {
      console.error('Failed to configure audio mode:', error);
    }
  }
  configureAudioPlayback();

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
              <View key={index} style={styles.videoContainer}>
                <Video
                  source={{ uri: video.uri }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
              </View>
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
  },
  video: {
    width: width,
    height: width,
  },
  noVideosText: {
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
