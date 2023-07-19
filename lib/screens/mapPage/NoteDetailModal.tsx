import React, { useState } from "react";
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Note } from "../../../types";
import { Media } from "../../../lib/models/media_class";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = ({ isVisible, onClose, note }) => {
  let images: {uri: string}[] = [];
  
  // Declare a new state variable for image loading
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  
  if (note?.images) {
    images = note.images.filter((mediaItem) => mediaItem.uri.endsWith(".jpg") || mediaItem.uri.endsWith(".png"));
  }

  const handleLoad = (uri: string) => {
    setImageLoadedState(prev => ({...prev, [uri]: true}));
  }

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <ScrollView contentContainerStyle={styles.modalView}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        {images && images.length > 0 ? images.map((image, index) => {
          return (
            <View key={index} style={styles.imageContainer}>
              {!imageLoadedState[image.uri] && <ActivityIndicator size="large" color="#0000ff" />}
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                onLoad={() => handleLoad(image.uri)}
              />
            </View>
          )
        }) : <Text>No images</Text>}
      </ScrollView>
      <Text style={styles.modalTitle}>{note?.title}</Text>
      <Text style={styles.modalText}>{note?.description}</Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 20, // Add padding to ensure all content can be scrolled to
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
  },
  imageContainer: {
    width: "100%", // Adjust as necessary
    height: 200, // Adjust as necessary
    marginBottom: 10, // Adds some space between images
  },
  image: {
    width: "100%", // Adjust as necessary
    height: 200, // Adjust as necessary
    resizeMode: "cover", // Or "contain", according to your needs
    position: "absolute",
  },
});

export default NoteDetailModal;
