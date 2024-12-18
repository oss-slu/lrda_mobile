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
import Slider from "@react-native-community/slider";
import RenderHTML, { TNodeRendererProps } from "react-native-render-html";
import ApiService from "../../utils/api_calls";
import { useTheme } from "../../components/ThemeProvider";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import { Audio } from "expo-av";
import { VideoType } from "../../models/media_class";

interface Note {
  title: string;
  description: string;
  creator?: string;
  time?: string;
  images?: { uri: string }[];
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

  const [audioStates, setAudioStates] = useState<{ [key: string]: { sound: Audio.Sound | null, isPlaying: boolean, progress: number, duration: number } }>({});
  const [playingMedia, setPlayingMedia] = useState<string | null>(null);

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

  const initializeAudio = async (uri: string) => {
    if (audioStates[uri]?.sound) return audioStates[uri];

    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();
    const newAudioState = {
      sound,
      isPlaying: false,
      progress: 0,
      duration: status.isLoaded ? status.durationMillis / 1000 : 0,
    };

    setAudioStates((prev) => ({ ...prev, [uri]: newAudioState }));
    return newAudioState;
  };

  const playPauseAudio = async (uri: string) => {
    const audioState = await initializeAudio(uri);
    if (audioState.sound) {
      if (audioState.isPlaying) {
        await audioState.sound.pauseAsync();
        setAudioStates((prev) => ({
          ...prev,
          [uri]: {
            ...audioState,
            isPlaying: false,
          },
        }));
        setPlayingMedia(null);
      } else {
        if (playingMedia && playingMedia !== uri) {
          const currentPlayingSound = audioStates[playingMedia]?.sound;
          if (currentPlayingSound) await currentPlayingSound.pauseAsync();
          setAudioStates((prev) => ({
            ...prev,
            [playingMedia]: { ...prev[playingMedia], isPlaying: false },
          }));
        }
        setPlayingMedia(uri);
        const status = await audioState.sound.getStatusAsync();
        if (status.positionMillis === status.durationMillis) {
          await audioState.sound.replayAsync();
        } else {
          await audioState.sound.playAsync();
        }
        audioState.sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setAudioStates((prev) => ({
              ...prev,
              [uri]: {
                ...audioState,
                isPlaying: status.isPlaying,
                progress: status.positionMillis / 1000,
                duration: status.durationMillis / 1000,
              },
            }));
            if (status.didJustFinish) {
              audioState.sound.stopAsync();
              setAudioStates((prev) => ({
                ...prev,
                [uri]: { ...audioState, isPlaying: false, progress: 0 },
              }));
              setPlayingMedia(null);
            }
          }
        });
      }
    }
  };

  const handleSlidingComplete = async (value: number, uri: string) => {
    const audioState = await initializeAudio(uri);
    if (audioState.sound) {
      await audioState.sound.setPositionAsync(value * 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const customRenderers = useMemo(() => ({
    img: ({ tnode }: TNodeRendererProps<any>) => {
      const { src, alt } = tnode.attributes;
      console.log("Image view ",src)
      return (
        <View style={{ marginVertical: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={() => onPicturePress(src as string)} testID="imageButton">
            <Image
              source={{ uri: src as string }}
              style={{ width: 400, height: 400, resizeMode: "contain" }}
              accessibilityLabel={alt as string}
            />
          </TouchableOpacity>
        </View>
      );
    },
    a: ({ tnode }: TNodeRendererProps<any>) => {
      const { href } = tnode.attributes;
      const audioState = audioStates[href as string] || { progress: 0, duration: 0, isPlaying: false };

      if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
        return (
          <View style={{ width: width - 40, height: (width - 40) / 1.77, marginVertical: 20, alignSelf: "center" }}>
            <TouchableOpacity onPress={() => onVideoPress({ uri: href as string })} testID="videoButton">
              <View style={{ width: "100%", height: "100%", backgroundColor: "#000", justifyContent: "center" }}>
                <Ionicons name="play-circle-outline" size={50} color="white" style={{ alignSelf: "center" }} />
              </View>
            </TouchableOpacity>
          </View>
        );
      } else if (href && (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))) {
        return (
          <View style={[styles.audioContainer, { marginVertical: 10, alignItems: "center", width: width - 40 }]}>
            <TouchableOpacity onPress={() => playPauseAudio(href as string)} testID="videoButton">
              <Ionicons
                name={audioState.isPlaying ? "pause-circle-outline" : "play-circle-outline"}
                size={30}
                color={theme.text}
              />
            </TouchableOpacity>
            <Slider
              style={styles.audioSlider}
              minimumValue={0}
              maximumValue={audioState.duration}
              value={audioState.progress}
              minimumTrackTintColor={theme.primaryColor}
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor={theme.primaryColor}
              onSlidingComplete={(value) => handleSlidingComplete(value, href as string)}
            />
            <Text style={styles.audioTimer}>{formatTime(audioState.progress)} / {formatTime(audioState.duration)}</Text>
          </View>
        );
      }
      return <Text style={{ color: theme.text, marginVertical: 10 }}>{tnode.data}</Text>;
    },
  }), [audioStates, theme]);

  const htmlSource = useMemo(() => ({ html: note?.description || "" }), [note]);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} >
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
    zIndex: 1,
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
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  audioSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  audioTimer: {
    color: "#333",
    textAlign: "right",
    width: 60,
  },
});

const tagsStyles = {
  img: {
    maxWidth: "100%",
    height: "auto",
  },
};