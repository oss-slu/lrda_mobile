import React from "react";
import { ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Note } from "../../../types";
import { Media } from "../../../lib/models/media_class";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = ({ isVisible, onClose, note }) => {
  console.log("Im a component: ", note)
  let images: {uri: string}[] = [];
  
  if (note?.images) {
    images = note.images.filter((mediaItem) => mediaItem.uri.endsWith(".jpg") || mediaItem.uri.endsWith(".png"));
  }

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <ScrollView contentContainerStyle={styles.modalView}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{note?.title}</Text>
        <Text style={styles.modalText}>{note?.description}</Text>
        {images && images.length > 0 ? images.map((image, index) => {
          if(image) {
            return (
              <Image
                key={index}
                source={{ uri: image.uri }}
                style={styles.image}
              />
            )
          } else {
            return null;
          }
        }) : <Text>No images</Text>}
      </ScrollView>
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
  image: {
    width: "100%", // Adjust as necessary
    height: 200, // Adjust as necessary
    resizeMode: "cover", // Or "contain", according to your needs
    marginBottom: 10, // Adds some space between images
  },
});

export default NoteDetailModal;
