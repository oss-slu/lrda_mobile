import React, { useState } from 'react';
import { Modal, View, ScrollView, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

const ImageModal = ({ images }) => {
  // State to manage if the modal is visible
  const [modalVisible, setModalVisible] = useState(false);
  // State to manage if an image is touched, assuming `handleImageTouchStart` changes this state
  const [isImageTouched, setIsImageTouched] = useState(false);
  // State to manage which images are loaded
  const [imageLoadedState, setImageLoadedState] = useState({});

  // Function to handle image load
  const handleLoad = (uri) => {
    setImageLoadedState((prevState) => ({ ...prevState, [uri]: true }));
  };

  // Assuming you have a `handleImageTouchStart` function
  const handleImageTouchStart = () => {
    setIsImageTouched(!isImageTouched); // Toggle the state for demonstration
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text>Show Images</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={images.length > 2 ? handleImageTouchStart : undefined}
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

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    margin: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  noImagesText: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 200,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
});

export default ImageModal;
