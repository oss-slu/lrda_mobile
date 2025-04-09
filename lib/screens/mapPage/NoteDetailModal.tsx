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
import { Audio, Video } from "expo-av";
import { VideoType } from "../../models/media_class";
import { defaultTextFont } from "../../../styles/globalStyles";

// Audio component.
const LoadingAudio: React.FC<{ uri: string }> = ({ uri }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const [audioState, setAudioState] = useState<{
    sound: Audio.Sound;
    isPlaying: boolean;
    progress: number;
    duration: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [playingMedia, setPlayingMedia] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const initializeAudio = async (uri: string) => {
    if (audioState?.sound) return audioState;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      const newAudioState = {
        sound,
        isPlaying: false,
        progress: 0,
        duration: status.isLoaded ? status.durationMillis / 1000 : 0,
      };
      setAudioState(newAudioState);
      return newAudioState;
    } catch (err) {
      setError(true);
      throw err;
    }
  };

  // Handles play/pause logic, including stopping any other playing audio
  const playPauseAudio = async (uri: string) => {
    const state = await initializeAudio(uri);
    if (state.sound) {
      if (state.isPlaying) {
        await state.sound.pauseAsync();
        setAudioState({ ...state, isPlaying: false });
        setPlayingMedia(null);
      } else {
        if (playingMedia && playingMedia !== uri) {
          const currentPlayingSound = audioState[playingMedia]?.sound;
          if (currentPlayingSound) await currentPlayingSound.pauseAsync();
          setAudioState((prev) => ({
            ...prev,
            [playingMedia]: { ...prev[playingMedia], isPlaying: false },
          }));
        }

        setPlayingMedia(uri);
        const status = await state.sound.getStatusAsync();
        if (status.positionMillis === status.durationMillis) {
          await state.sound.replayAsync();
        } else {
          await state.sound.playAsync();
        }
        state.sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setAudioState((prev) =>
              prev
                ? {
                    ...prev,
                    isPlaying: status.isPlaying,
                    progress: status.positionMillis / 1000,
                    duration: status.durationMillis / 1000,
                  }
                : null
            );
            if (status.didJustFinish) {
              state.sound.stopAsync();
              setAudioState((prev) =>
                prev ? { ...prev, isPlaying: false, progress: 0 } : null
              );
              setPlayingMedia(null);
            }
          }
        });
      }
    }
  };

  const handleSlidingComplete = async (value: number) => {
    if (audioState?.sound) {
      await audioState.sound.setPositionAsync(value * 1000);
      setAudioState({ ...audioState, progress: value });
    }
  };

  useEffect(() => {
    let isMounted = true;
    initializeAudio(uri)
      .then(() => {
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (audioState?.sound) {
        audioState.sound.unloadAsync();
      }
    };
  }, [uri]);

  // Error case
  if (error) {
    return (
      <View style={styles.audioContainer}>
        <Ionicons name="alert-circle-outline" size={30} color={theme.homeColor} />
        <Text style={styles.errorText}>Couldn't load audio</Text>
      </View>
    );
  }

  // Loading state case
  if (loading || !audioState) {
    return (
      <View style={styles.audioContainer}>
        <ActivityIndicator testID="audioLoadingIndicator" size="large" color={theme.homeColor} />
      </View>
    );
  }
  // Normal case
  return (
    <View
      style={[
        styles.audioContainer,
        { marginVertical: 10, alignItems: "center", width: width - 40 },
      ]}
    >
      <TouchableOpacity onPress={() => playPauseAudio(uri)} testID="audioButton">
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
        onSlidingComplete={handleSlidingComplete}
      />
      <Text style={styles.audioTimer}>
        {formatTime(audioState.progress)} / {formatTime(audioState.duration)}
      </Text>
    </View>
  );
};

// LoadingImage Component
interface LoadingImageProps {
  uri: string;
  alt?: string;
  onPress: (uri: string) => void;
}

const LoadingImage: React.FC<LoadingImageProps> = ({ uri, alt, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();

  if (error) {
    return (
      <View testID= "no-image"  style={loadingImageStyles.container}>
        <View style={loadingImageStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text style={loadingImageStyles.errorText}>Couldn't load image</Text>
        </View>
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
          <ActivityIndicator testID="loadingIndicator" size="large" color={theme.homeColor} />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    ...defaultTextFont,
    marginTop: 10,
    color: "black",
    fontSize: 16,
  },
});

const LoadingDots: React.FC = () => {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  // Skip animation if in Jest environment
  if (!!process.env.JEST_WORKER_ID) {
    return <Text style={{...defaultTextFont}} testID="loadingDotsStatic">...</Text>;
  }

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
    ...defaultTextFont,
    fontSize: 18,
    color: "333",
    marginHorizontal: 2,
  },
});

interface LoadingVideoProps {
  uri: string;
  onPress: (uri: string) => void;
  width: number;
}

const LoadingVideo: React.FC<LoadingVideoProps> = ({ uri, onPress, width }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerWidth = width - 40;
  const containerHeight = containerWidth / 1.77;
  const {theme} = useTheme();

  if (error) {
    return (
      <View testID= "no-video" style={[loadingVideoStyles.container, { width: containerWidth, height: containerHeight }]}>
        <View style={loadingVideoStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text style={loadingVideoStyles.errorText}>Couldn't load video</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[loadingVideoStyles.container, { width: containerWidth, height: containerHeight }]}>
      <Video
        source={{ uri }}
        style={loadingVideoStyles.video}
        resizeMode="contain"
        shouldPlay={false}
        isLooping={false}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={loadingVideoStyles.loadingOverlay}>
          <ActivityIndicator testID="videoLoadingIndicator" size="large" color={theme.homeColor} />
        </View>
      )}
      <TouchableOpacity
        testID="videoButton"
        style={StyleSheet.absoluteFill}
        onPress={() => onPress(uri)}
      >
        <Ionicons
          name="play-circle-outline"
          size={50}
          color="white"
          style={{ alignSelf: "center", marginTop: 70 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const loadingVideoStyles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    ...defaultTextFont,
    marginTop: 10,
    color: "red",
    fontSize: 16,
  },
});

// NoteDetailModal
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

  // Reset state whenever the note changes
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

  // Handlers for images & videos
  const onPicturePress = (src: string) => {
    setSelectedImage(src);
    setIsModalVisible(true);
  };

  const onVideoPress = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoVisible(true);
  };

  // Custom renderers for RenderHTML
  const customRenderers = useMemo(
    () => ({
      img: ({ tnode }: TNodeRendererProps<any>) => {
        const { src, alt } = tnode.attributes;
        return (
          <View style={{ marginVertical: 10, alignItems: "center" }}>
            <LoadingImage uri={src as string} alt={alt as string} onPress={onPicturePress} />
          </View>
        );
      },
      a: ({ tnode }: TNodeRendererProps<any>) => {
        const { href } = tnode.attributes;

        // If it's a video
        if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
          return (
            <View style={{ marginVertical: 20, alignSelf: "center" }}>
              <LoadingVideo uri={href as string} onPress={(uri) => onVideoPress({ uri })} width={width} />
            </View>
          );
        }

        // If it's an audio file
        if (href && (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))) {
          return (
            <View style={{ marginVertical: 10, alignItems: "center", width: width - 40 }}>
              <LoadingAudio uri={href as string} />
            </View>
          );
        }

        // Otherwise, just render text
        return <Text style={{ ...defaultTextFont, color: theme.text, marginVertical: 10 }}>{tnode.data}</Text>;
      },
    }),
    [theme, width]
  );

  const htmlSource = useMemo(() => ({ html: note?.description || "" }), [note]);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      {/* Close Button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeIcon}>
          <Ionicons name="close" size={30} color={theme.text} />
        </View>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={[styles.textContainer, { height: "100%" }]}>
        <Text style={styles.modalTitle}>{note?.title}</Text>

        <View style={styles.metaDataContainer}>
          {/* Creator Name */}
          <View style={styles.creatorContainer}>
            <Ionicons name="person-circle-outline" size={18} color={theme.text} />
            {creatorName ? (
              <Text style={styles.creatorText}>{creatorName}</Text>
            ) : (
              <LoadingDots />
            )}
          </View>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={18} color={theme.text} />
            <Text style={styles.dateText}>{note?.time || "Date not available"}</Text>
          </View>
        </View>

        <View style={styles.dividerLine} />

        {/* Description Content */}
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

      {/* Image Modal */}
      <ImageModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        images={selectedImage ? [{ uri: selectedImage }] : []}
      />

      {/* Video Modal */}
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
    ...defaultTextFont,
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
    ...defaultTextFont,
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
    ...defaultTextFont,
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
  // Audio
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  audioSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  audioTimer: {
    ...defaultTextFont,
    color: "#333",
    textAlign: "right",
    width: 60,
  },
  errorText: {
    ...defaultTextFont,
    marginLeft: 10,
    color: "#333",
    fontSize: 16,
  },
});

const tagsStyles = {
  img: {
    maxWidth: "100%",
    height: "auto",
  },
};