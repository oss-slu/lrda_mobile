import React, { useState } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Video // Assuming you want to use a Video component
} from 'react-native';
import { useTheme } from "../../components/ThemeProvider";

// Update the interface to reflect the nature of the content you are displaying
interface VideoType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  videos: VideoType[]; // Rename images to videos for clarity
}

const { width } = Dimensions.get("window");

const VideoModal: React.FC<Props> = ({ isVisible, onClose, videos }) => {
  const [videoLoadedState, setVideoLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isVideoTouched, setIsVideoTouched] = useState(false);
  const theme = useTheme(); // Assuming `useTheme` returns the current theme

  const handleLoad = (uri: string) => {
    setVideoLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  // Define a missing handler if needed, or remove if not used
  const handleVideoTouchStart = () => setIsVideoTouched(!isVideoTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView
          style={{ height: isVideoTouched ? "80%" : "50%" }}
          onTouchStart={videos && videos.length > 2 ? handleVideoTouchStart : undefined}
        >
          {videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <View key={index} style={styles.videoContainer}>
                {!videoLoadedState[video.uri] && (
                  <ActivityIndicator size="large" color="#0000ff" />
                )}
                {/* You might need to use a different Video component based on your package, like react-native-video */}
                <Video
                  source={{ uri: video.uri }}
                  style={styles.video}
                  onLoad={() => handleLoad(video.uri)}
                  // Additional props for controlling playback, etc.
                />
              </View>
            ))
          ) : (
            <Text style={styles.noVideosText}>No videos</Text>
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
    width: width, // You may want to adjust this to maintain the aspect ratio of your videos
    height: width * (9 / 16), // Example aspect ratio of 16:9
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
