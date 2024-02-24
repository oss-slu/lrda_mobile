import React, { useState } from 'react';
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
} from 'react-native';
import { useTheme } from "../../components/ThemeProvider";

// Assuming `Image` type was intended to be an array of objects with a 'uri' property
interface ImageType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  images: ImageType[];
}

const { width, height } = Dimensions.get("window");

// Correctly destructure props and use them directly instead of internal state for visibility
const VideoModal: React.FC<Props> = ({ isVisible, onClose, videos }) => {
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isImageTouched, setIsImageTouched] = useState(false);
  const theme = useTheme();

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  // Define a missing handler if needed, or remove if not used
  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 45,
      width: '100%',
      backgroundColor: theme.primaryColor,
    },
    imageContainer: {
      alignItems: 'center',
      width: '100%',
    },
    image: {
      width: width,
      height: width,
    },
    noImagesText: {
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

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={videos && videos.length > 2 ? handleImageTouchStart : undefined}
        >
          {videos && videos.length > 0 ? (
            videos.map((videos, index) => (
              <View key={index} style={styles.imageContainer}>
                {!imageLoadedState[videos.uri] && (
                  <ActivityIndicator size="large" color="#0000ff" />
                )}
                <Image
                  source={{ uri: videos.uri }}
                  style={styles.videos}
                  onLoad={() => handleLoad(videos.uri)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noImagesText}>No Videos</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VideoModal;
