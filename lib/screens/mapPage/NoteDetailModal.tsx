import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../../types";
import RenderHTML from "react-native-render-html";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = ({ isVisible, onClose, note }) => {
  let images: { uri: string }[] = [];
  const [creatorName, setCreatorName] = useState<string>("");
  const [isImageTouched, setImageTouched] = useState(false);
  const [isTextTouched, setTextTouched] = useState(true);
  const {height, width} = useWindowDimensions();

  const handleImageTouchStart = () => {
    setImageTouched(true);
    setTextTouched(false);
  };

  const handleTextTouchStart = () => {
    setTextTouched(true);
    setImageTouched(false);
  };

  useEffect(() => {
    if (note && note.creator) {
      fetch(note.creator)
        .then((response) => response.json())
        .then((data) => setCreatorName(data.name))
        .catch((err) => console.error("Error fetching creator: ", err));
    }
  }, [note]);

  // Declare a new state variable for image loading
  const [imageLoadedState, setImageLoadedState] = useState<{
    [key: string]: boolean;
  }>({});

  if (note?.images) {
    images = note.images.filter(
      (mediaItem) =>
        mediaItem.uri.endsWith(".jpg") || mediaItem.uri.endsWith(".png")
    );
  }

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  const html = note?.description;

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeIcon}>
          <Ionicons name="close" size={30} color="#000" />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={{ height: isImageTouched ? "80%" : "50%" }}
        onTouchStart={images.length > 2 ? handleImageTouchStart : undefined}
      >
        {images && images.length > 0 ? (
          images.map((image, index) => {
            return (
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
            );
          })
        ) : (
          <Text style={{ alignSelf: "center", justifyContent: "center" }}>
            No images
          </Text>
        )}
        <View style={{ height: 250 }}></View>
      </ScrollView>
      <View
        style={[
          styles.textContainer,
          {
            height: isTextTouched ? "60%" : "30%",
          },
        ]}
        onTouchStart={handleTextTouchStart}
      >
        <ScrollView>
          <Text style={styles.modalTitle}>{note?.title}</Text>
          <Text style={styles.modalText}>{`Created by: ${creatorName}`}</Text>
          <Text style={[styles.modalText, { marginBottom: 5 }]}>
            {note?.time}
          </Text>
          <View
            style={{
              height: 2,
              width: "100%",
              backgroundColor: "black",
              marginBottom: 10,
            }}
          ></View>
          <RenderHTML baseStyle={{color: '#666'}} contentWidth={width} source={{ html }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default NoteDetailModal;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    padding: 20,
    backgroundColor: "#fafafa",
    height: 200, // Height of text container
    position: "absolute",
    bottom: 0, // Positioning it at the bottom
    left: 0,
    right: 0,
    borderTopColor: "#ddd", // Add a border to distinguish from rest of modal
    borderTopWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  modalText: {
    fontSize: 18,
    lineHeight: 24,
    color: "#666",
  },
  metaData: {
    fontSize: 14,
    color: "#888",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
});
