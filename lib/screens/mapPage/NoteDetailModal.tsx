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
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // Current progress in seconds
  const [audioDuration, setAudioDuration] = useState(0); // Total duration in seconds
  const [isSeeking, setIsSeeking] = useState(false); // Track if user is interacting with slider

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

  const playPauseAudio = async (uri: string) => {
    if (!audioSound) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setAudioSound(sound);
      setIsPlaying(true);

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setAudioDuration(status.durationMillis / 1000); // Convert ms to seconds
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !isSeeking) {
          setAudioProgress(status.positionMillis / 1000); // Convert ms to seconds
          if (status.didJustFinish) {
            setIsPlaying(false);
            setAudioProgress(0);
            sound.unloadAsync();
            setAudioSound(null);
          }
        }
      });
    } else {
      if (isPlaying) {
        await audioSound.pauseAsync();
      } else {
        await audioSound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSlidingComplete = async (value: number) => {
    if (audioSound) {
      await audioSound.setPositionAsync(value * 1000);
      setIsSeeking(false);
      setAudioProgress(value);
    }
  };

  useEffect(() => {
    return () => {
      if (audioSound) {
        audioSound.unloadAsync();
      }
    };
  }, [audioSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const customRenderers = useMemo(() => ({
    img: ({ tnode }: TNodeRendererProps<any>) => {
      const { src, alt } = tnode.attributes;
      return (
        <View style={{ marginVertical: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={() => onPicturePress(src as string)}>
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
      if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
        return (
          <View style={{ width: width - 40, height: (width - 40) / 1.77, marginVertical: 20, alignSelf: "center" }}>
            <TouchableOpacity onPress={() => onVideoPress({ uri: href as string })}>
              <View style={{ width: "100%", height: "100%", backgroundColor: "#000", justifyContent: "center" }}>
                <Image
                  source={{ uri: `${href}.thumbnail.jpg` }}
                  style={{ width: "100%", height: "100%", position: "absolute" }}
                />
                <Ionicons name="play-circle-outline" size={50} color="white" style={{ alignSelf: "center" }} />
              </View>
            </TouchableOpacity>
          </View>
        );
      } else if (href && (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))) {
        return (
          <View style={[styles.audioContainer, { marginVertical: 10, alignItems: "center", width: width - 40 }]}>
            <TouchableOpacity onPress={() => playPauseAudio(href as string)}>
              <Ionicons name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={30} color={theme.text} />
            </TouchableOpacity>
            <Slider
              style={styles.audioSlider}
              minimumValue={0}
              maximumValue={audioDuration}
              value={audioProgress}
              minimumTrackTintColor={theme.primaryColor}
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor={theme.primaryColor}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
            />
            <Text style={styles.audioTimer}>{formatTime(audioProgress)} / {formatTime(audioDuration)}</Text>
          </View>
        );
      }
      return <Text style={{ color: theme.text, marginVertical: 10 }}>{tnode.data}</Text>;
    },
  }), [isPlaying, audioProgress, audioDuration, theme]);
  
  

  const htmlSource = useMemo(() => ({ html: note?.description || "" }), [note]);

  const tagsStyles = {
    img: {
      maxWidth: "100%",
      height: "auto",
    },
  };

  const styles = StyleSheet.create({
    closeButton: {
      position: "absolute",
      top: 50,
      left: 20,
      zIndex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primaryColor,
      borderRadius: 25,
      padding: 5,
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
    audioContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f0f0f0",
      padding: 10,
      borderRadius: 10,
      marginTop: 10,
      width: width - 40,
      alignSelf: "center",
    },
    audioSlider: {
      flex: 1,
      marginHorizontal: 10,
    },
    audioTimer: {
      color: theme.text,
      textAlign: "right",
      width: 60,
    },
  });
  

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeIcon}>
          <Ionicons name="close" size={30} color={theme.text} />
        </View>
      </TouchableOpacity>

      <View style={[styles.textContainer, { height: "100%" }]}>
        <Text style={styles.modalTitle}>{note?.title}</Text>
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
