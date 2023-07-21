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
        <View style={styles.closeIcon}>
          <Ionicons name="close" size={30} color="#000" />
        </View>
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
      </ScrollView>
      <View style={styles.textContainer}>
        <ScrollView>
          <Text style={styles.modalTitle}>{note?.title}</Text>
          <Text style={styles.modalText}>{note?.description}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
  };



const styles = StyleSheet.create({
  modalView: {
    paddingBottom: 200, // equals to the height of textContainer plus a bit of margin
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    padding: 20,
    backgroundColor: '#fafafa',
    height: 200, // Height of text container
    position: 'absolute',
    bottom: 0, // Positioning it at the bottom
    left: 0,
    right: 0,
    borderTopColor: '#ddd', // Add a border to distinguish from rest of modal
    borderTopWidth: 1,
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
    marginBottom: 2,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    position: "absolute",
  },
});

export default NoteDetailModal;
