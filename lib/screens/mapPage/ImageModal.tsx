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
const ImageModal: React.FC<Props> = ({ isVisible, onClose, images }) => {
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isImageTouched, setIsImageTouched] = useState(false);
  const theme = useTheme(); // Assuming `useTheme` returns the current theme

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  // Define a missing handler if needed, or remove if not used
  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.container}>
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={images && images.length > 2 ? handleImageTouchStart : undefined}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                {!imageLoadedState[image.uri] && (
                  <ActivityIndicator size="large" color="#0000ff" />
                )}
                <Image
                  source={{ uri: image.uri }}
                  style={styles.image}
                  onLoad={() => handleLoad(image.uri)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noImagesText}>No images</Text>
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
    width: '100%',
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

export default ImageModal;
