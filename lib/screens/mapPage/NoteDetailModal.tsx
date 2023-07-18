import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Note } from "../../../types";
import { Media } from "../../../lib/models/media_class";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = ({ isVisible, onClose, note }) => {
  let images: Media[] = [];
  
  if (note?.media) {
    images = note.media.filter((mediaItem) => mediaItem.getType() === "image");
  }

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <View style={styles.modalView}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{note?.title}</Text>
        <Text style={styles.modalText}>{note?.text}</Text>
        {images && images.length > 0 ? images.map((image, index) => {
          if(image) {
            return (
              <Image
                key={index}
                source={{ uri: image.getUri() }}
                style={styles.image}
              />
            )
          } else {
            return null;
          }
        }) : <Text>No images</Text>}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
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
