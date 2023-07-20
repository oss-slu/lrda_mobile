import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Note } from "../../../types";
import { Media } from "../../../lib/models/media_class";
import { format } from 'date-fns'; // Use date-fns or a similar library to format dates nicely

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = ({ isVisible, onClose, note }) => {
  let images: {uri: string}[] = [];
  console.log("This is a NoteDetailModal: ", note);

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
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={30} color="#000" />
        </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.modalView}>
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
        <View style={styles.textContainer}>
          <Text style={styles.modalTitle}>{note?.title}</Text>
          <Text style={styles.modalText}>{note?.description}</Text>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 20,
  },
  closeButton: {
    top: 50,
    left: 20,
    zIndex: 1,
    position: 'absolute',
  },
  textContainer: {
    padding: 20,
    backgroundColor: '#fafafa',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 20,
    color: '#666',
  },
  metaData: {
    fontSize: 14,
    color: '#888',
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    position: "absolute",
  },
});

export default NoteDetailModal;
