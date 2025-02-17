// NoteDetailModal.tsx
import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
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


// LoadingImage Component
// Displays an ActivityIndicator overlay until the image loads.
// If the image fails to load, it displays an error icon and message.

interface LoadingImageProps {
  uri: string;
  alt?: string;
  onPress: (uri: string) => void;
}

const LoadingImage: React.FC<LoadingImageProps> = ({ uri, alt, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View testID="no-image" style={loadingImageStyles.container}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff0000" />
        <Text style={styles.errorText}>Couldn't load image</Text>
      </View>
    );
  }

  return (
    <View style={loadingImageStyles.container}>
      <Image
        testID="bufferingImage"
        source={{ uri }}
        style={[loadingImageStyles.image, { opacity: loading ? 0 : 1 }]}
        accessibilityLabel={alt}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={loadingImageStyles.loadingOverlay}>
          <ActivityIndicator testID="loadingIndicator" size="large" color="#0000ff" />
        </View>
      )}
      <TouchableOpacity
        testID="imageButton"
        style={StyleSheet.absoluteFill}
        onPress={() => onPress(uri)}
      />
    </View>
  );
};

const loadingImageStyles = StyleSheet.create({
  container: {
    width: 400, // adjust as needed
    height: 400, // adjust as needed
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
});


// LoadingVideoButton Component
// Displays an ActivityIndicator overlay while attempting to load the video thumbnail.
// If the thumbnail fails to load, it shows an error icon and message.

interface LoadingVideoButtonProps {
  uri: string;
  onPress: (video: VideoType) => void;
}

const LoadingVideoButton: React.FC<LoadingVideoButtonProps> = ({ uri, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[loadingImageStyles.container, { width: 400, height: 400 / 1.77 }]}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff0000" />
        <Text style={styles.errorText}>Couldn't load video</Text>
      </View>
    );
  }

  return (
    <View style={[loadingImageStyles.container, { width: 400, height: 400 / 1.77 }]}>
      <Image
        source={{ uri }}
        style={[loadingImageStyles.image, { opacity: loading ? 0 : 1, resizeMode: "cover" }]}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={loadingImageStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <TouchableOpacity
        testID="videoButton"
        style={StyleSheet.absoluteFill}
        onPress={() => onPress({ uri })}
      />
    </View>
  );
};

// LoadingDots Component
// If tests are running, simply render static text.
// Otherwise, run the animated dots sequence.

const LoadingDots: React.FC = () => {
  if (!!process.env.JEST_WORKER_ID) {
    return <Text testID="loadingDotsStatic">...</Text>;
  }

  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(dot1Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ]).start(() => animateDots());
    };

    animateDots();
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={loadingDotsStyles.container}>
      <Animated.Text style={[loadingDotsStyles.dot, { opacity: dot1Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[loadingDotsStyles.dot, { opacity: dot2Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[loadingDotsStyles.dot, { opacity: dot3Opacity }]}>
        .
      </Animated.Text>
    </View>
  );
};

const loadingDotsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    fontSize: 18,
    color: "#333",
    marginHorizontal: 2,
  },
});

// NoteDetailModal Component

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

  // Reset internal state on note change to avoid flashing previous note data.
  useEffect(() => {
    setCreatorName("");
    setSelectedImage(null);
    setSelectedVideo(null);
    setIsModalVisible(false);
    setIsVideoVisible(false);

    if (note?.creator) {
      ApiService.fetchCreatorName(note.creator)
        .then((name) => setCreatorName(name))
        .catch(() => setCreatorName("Unknown Creator"));
    } else {
      setCreatorName("Creator not available");
    }
  }, [note]);

  const [audioStates, setAudioStates] = useState<{ 
    [key: string]: { 
      sound: Audio.Sound | null, 
      isPlaying: boolean, 
      progress: number, 
      duration: number 
    } 
  }>({});
  const [playingMedia, setPlayingMedia] = useState<string | null>(null);

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
          [uri]: { ...audioState, isPlaying: false },
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

  // Custom renderers for RenderHTML
  const customRenderers = useMemo(() => ({
    img: ({ tnode }: TNodeRendererProps<any>) => {
      const { src, alt } = tnode.attributes;
      return (
        <View style={{ marginVertical: 10, alignItems: "center" }}>
          <LoadingImage
            uri={src as string}
            alt={alt as string}
            onPress={onPicturePress}
          />
        </View>
      );
    },
    a: ({ tnode }: TNodeRendererProps<any>) => {
      const { href } = tnode.attributes;
      const audioState =
        audioStates[href as string] || { progress: 0, duration: 0, isPlaying: false };

      if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
        return (
          <View
            style={{
              width: width - 40,
              height: (width - 40) / 1.77,
              marginVertical: 20,
              alignSelf: "center",
            }}
          >
            <LoadingVideoButton uri={href as string} onPress={onVideoPress} />
          </View>
        );
      } else if (
        href &&
        (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))
      ) {
        return (
          <View
            style={[
              styles.audioContainer,
              { marginVertical: 10, alignItems: "center", width: width - 40 },
            ]}
          >
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
            <Text style={styles.audioTimer}>
              {formatTime(audioState.progress)} / {formatTime(audioState.duration)}
            </Text>
          </View>
        );
      }
      return <Text style={{ color: theme.text, marginVertical: 10 }}>{tnode.data}</Text>;
    },
  }), [audioStates, theme, width]);

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
            {creatorName ? (
              <Text style={styles.creatorText}>{creatorName}</Text>
            ) : (
              <LoadingDots />
            )}
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

      <ImageModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        images={selectedImage ? [{ uri: selectedImage }] : []}
      />
      <VideoModal
        isVisible={isVideoVisible}
        onClose={() => setIsVideoVisible(false)}
        videos={selectedVideo ? [selectedVideo] : []}
      />
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
  errorText: {
    marginTop: 10,
    color: "#ff0000",
    fontSize: 16,
  },
});

const tagsStyles = {
  img: {
    maxWidth: "100%",
    height: "auto",
  },
};
