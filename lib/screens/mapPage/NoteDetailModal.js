import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const NoteDetailModal = ({ isVisible, onClose, note }) => {
  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <View style={styles.modalView}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{note?.title}</Text>
        <Text style={styles.modalText}>{note?.description}</Text>
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
});

export default NoteDetailModal;
