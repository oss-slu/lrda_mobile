import React, { useState, useEffect, memo, useMemo } from "react";
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
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../../types";
import RenderHTML from "react-native-render-html";
import Video from 'react-native-video';
import ApiService from "../../utils/api_calls";  // Import ApiService here
import { useTheme } from "../../components/ThemeProvider";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = memo(
  ({ isVisible, onClose, note }) => {
    const [isImageTouched, setImageTouched] = useState(false);
    const [isTextTouched, setTextTouched] = useState(true);
    const [creatorName, setCreatorName] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const { height, width } = useWindowDimensions();
    const { theme } = useTheme();

    useEffect(() => {
      setTextTouched(true);
      if (note?.creator) {
        console.log("Fetching creator data for ID:", note.creator);

        ApiService.fetchCreatorName(note.creator)
          .then((name) => {
            setCreatorName(name);
          })
          .catch((err) => {
            console.error("Error fetching creator name:", err);
            setCreatorName("Unknown Creator");
          });
      } else {
        setCreatorName("Creator not available");
      }
    }, [note]);

    const handleImageTouchStart = () => {
      setImageTouched(true);
      setTextTouched(false);
    };

    const handleTextTouchStart = () => {
      setTextTouched(true);
      setImageTouched(false);
    };

    const onPicturePress = () => {
      setIsModalVisible(true); // Open the PictureModal
    };

    const onVideoPress = () => {
      setIsVideoVisible(true);
    };

    const tagsStyles = {
      img: {
        maxWidth: '100%',
        height: 'auto',
      },
    };

    const customRenderers = {
      img: ({ tnode }) => {
        const { src, alt } = tnode.attributes;
        const imageSize = { width: width, height: width };
    
        return <Image source={{ uri: src }} style={imageSize} accessibilityLabel={alt} />;
      },
    };

    const html = typeof note?.description === "string" ? note.description : "";
    const newNote = html.includes("<div>");

    const htmlSource = useMemo(() => {
      return { html };
    }, [html]);

    const images = useMemo(() => {
      if (note?.images) {
        return note.images.filter(
          (mediaItem) => mediaItem.uri.endsWith(".jpg") || mediaItem.uri.endsWith(".png")
        );
      }
      return [];
    }, [note]);

    const videos = useMemo(() => {
      if (note?.images) {
        return note.images.filter(
          (mediaItem) =>
            mediaItem.uri.endsWith(".MOV") ||
            mediaItem.uri.endsWith(".mov") ||
            mediaItem.uri.endsWith(".mp4")
        );
      }
      return [];
    }, [note]);

    const CustomVideoPlayer = ({ src }) => (
      <Video source={{ uri: src }} style={{ width: 300, height: 300 }} controls />
    );

    const styles = StyleSheet.create({
      closeButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
        borderRadius: 25,
        backgroundColor: theme.primaryColor,
      },
      pictureButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
        borderRadius: 25,
        backgroundColor: theme.primaryColor,
      },
      videoButton: {
        position: "absolute",
        top: 50,
        right: 70,
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
        borderRadius: 25,
        backgroundColor: theme.primaryColor,
      },
      closeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primaryColor,
        alignItems: "center",
        justifyContent: "center",
      },
      textContainer: {
        padding: 10,
        paddingLeft: 15,
        backgroundColor: theme.primaryColor,
        borderTopColor: theme.text,
        borderTopWidth: 2,
        flex: 1,
        paddingTop: 100,
      },
      modalTitle: {
        fontSize: 26,
        fontWeight: "bold",
        marginLeft: 15,
        marginBottom: 8,
        color: theme.text,
      },
      modalText: {
        fontSize: 18,
        lineHeight: 24,
        marginLeft: 15,
        color: theme.text,
      },
      metaDataContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10,
      },
      creatorContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      creatorIcon: {
        fontSize: 16,
        color: theme.text,
      },
      creatorText: {
        fontSize: 16,
        color: theme.text,
        marginLeft: 5,
      },
      dateContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      dateIcon: {
        fontSize: 16,
        color: theme.text,
      },
      dateText: {
        fontSize: 16,
        color: theme.text,
        marginLeft: 5,
      },
      imageContainer: {
        width: "100%",
        height: 360,
        marginBottom: 2,
        overflow: "hidden",
        borderColor: '#e0e0e0'
      },
      image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },
      separator: {
        height: 1,
        width: "90%",
        backgroundColor: "#e0e0e0",
        marginLeft: "5%",
        marginRight: "5%",
        marginBottom: 20,
      },
    });

    return (
      <Modal animationType="slide" transparent={false} visible={isVisible}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <View style={styles.closeIcon}>
            <Ionicons name="close" size={30} color={theme.text} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPicturePress} style={styles.pictureButton}>
          <View style={styles.closeIcon}>
            <Ionicons name="image" size={30} color={theme.text} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onVideoPress} style={styles.videoButton}>
          <View style={styles.closeIcon}>
            <Ionicons name="videocam" size={30} color={theme.text} />
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.textContainer,
            {
              height: isTextTouched ? "60%" : "30%",
            },
          ]}
          onTouchStart={handleTextTouchStart}
        >
          <Text style={styles.modalTitle}>{note?.title}</Text>
          <View style={styles.metaDataContainer}>
            <View style={styles.creatorContainer}>
              <Ionicons name="person-circle-outline" size={18} color={theme.text} />
              <Text style={styles.creatorText}>{creatorName}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={18} color={theme.text} />
              <Text style={styles.dateText}>{note?.time}</Text>
            </View>
          </View>
          <ScrollView>
            {newNote ? (
              <RenderHTML
                baseStyle={{ color: theme.text }}
                contentWidth={width}
                source={htmlSource}
                tagsStyles={tagsStyles}
                renderers={customRenderers}
              />
            ) : (
              <Text style={{ color: theme.text }}>{note?.description}</Text>
            )}
          </ScrollView>
        </View>

        <ImageModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} images={images} />
        <VideoModal isVisible={isVideoVisible} onClose={() => setIsVideoVisible(false)} videos={videos} />
      </Modal>
    );
  }
);

export default NoteDetailModal;
