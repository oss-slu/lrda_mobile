import React, { useState, useEffect, memo, useMemo } from "react";
import {
  Modal,
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderHTML, { TNodeRendererProps } from "react-native-render-html";
import ApiService from "../../utils/api_calls";
import { useTheme } from "../../components/ThemeProvider";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import AudioPlayer from "../../components/AudioPlayer"; // Assuming you have this component
import { VideoType } from "../../models/media_class";

interface Note {
  title: string;
  description: string;
  creator?: string;
  time?: string;
  images?: { uri: string }[];
  videos?: { uri: string }[]; // Video URIs if applicable
  audios?: { uri: string }[]; // Audio URIs to store uploaded audio
}

interface NoteDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = memo(({ isVisible, onClose, note }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>("");
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  useEffect(() => {
    if (note?.creator) {
      ApiService.fetchCreatorName(note.creator)
        .then((name) => setCreatorName(name))
        .catch(() => setCreatorName("Unknown Creator"));
    } else {
      setCreatorName("Creator not available");
    }
  }, [note]);

  const onPicturePress = (src: string) => {
    setSelectedImage(src);
    setIsModalVisible(true);
  };

  const onVideoPress = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoVisible(true);
  };

  const customRenderers = useMemo(() => ({
    img: ({ tnode }: TNodeRendererProps<any>) => {
      const { src, alt } = tnode.attributes;
      return (
        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={() => onPicturePress(src as string)} testID="imageButton">
            <Image
              source={{ uri: src as string }}
              style={styles.image}
              accessibilityLabel={alt as string}
            />
          </TouchableOpacity>
        </View>
      );
    },
    a: ({ tnode }: TNodeRendererProps<any>) => {
      const { href } = tnode.attributes;

      if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
        return (
          <View style={[styles.videoContainer, { width: width - 40 }]}>
            <TouchableOpacity onPress={() => onVideoPress({ uri: href as string })} testID="videoButton">
              <View style={styles.videoInner}>
                <Ionicons name="play-circle-outline" size={50} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        );
      } else if (href && (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))) {
        return (
          <View style={styles.audioWrapper}>
            <AudioPlayer audioUri={href as string} />
          </View>
        );
      }
      return <Text style={{ color: theme.text, marginVertical: 10 }}>{tnode.data}</Text>;
    },
  }), [theme]);

  const htmlSource = useMemo(() => ({ html: note?.description || "" }), [note]);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeIcon}>
          <Ionicons name="close" size={30} color={theme.text} />
        </View>
      </TouchableOpacity>

      <View style={[styles.textContainer, { height: "100%" }]}>
        <Text style={styles.modalTitle}>{note?.title}</Text>

        <View style={styles.metaDataContainer}>
          <View style={styles.creatorContainer}>
            <Ionicons name="person-circle-outline" size={18} color={theme.text} />
            <Text style={styles.creatorText}>{creatorName}</Text>
          </View>

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={18} color={theme.text} />
            <Text style={styles.dateText}>{note?.time || "Date not available"}</Text>
          </View>
        </View>

        <View style={styles.dividerLine} />

        <ScrollView>
          <RenderHTML
            baseStyle={{ color: theme.text }}
            contentWidth={width}
            source={htmlSource}
            tagsStyles={tagsStyles}
            renderers={customRenderers}
          />
        </ScrollView>
      </View>

      <ImageModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} images={selectedImage ? [{ uri: selectedImage }] : []} />
      <VideoModal isVisible={isVideoVisible} onClose={() => setIsVideoVisible(false)} videos={selectedVideo ? [selectedVideo] : []} />
    </Modal>
  );
});

export default NoteDetailModal;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
    borderRadius: 25,
    padding: 5,
  },
  closeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderTopColor: "#ddd",
    borderTopWidth: 2,
    flex: 1,
    paddingTop: 100,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  metaDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  creatorText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
  dividerLine: {
    height: 2,
    backgroundColor: "#ddd",
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
  },
  imageWrapper: {
    marginVertical: 10,
    alignItems: "center",
    zIndex: 1,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  videoContainer: {
    height: 200, // Reduced height for better touch interaction
    backgroundColor: "#000",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    zIndex: 1,
  },
  videoInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  audioWrapper: {
    marginTop: 10,
    width: "85%", // Smaller width for the audio player
    alignSelf: "center",
    zIndex: 1,
  },
});

const tagsStyles = {
  img: {
    maxWidth: "100%",
    height: "auto",
  },
};
