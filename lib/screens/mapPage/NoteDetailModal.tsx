import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import {
  Modal,
  TouchableOpacity,
  Image,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import RenderHTML, { TNodeRendererProps } from "react-native-render-html";
import { fetchCreatorName } from "../../utils/api_calls";
import { useTheme } from "../../components/ThemeProvider";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import { Audio, Video, ResizeMode } from "expo-av";

const LoadingAudio: React.FC<{ uri: string }> = ({ uri }) => {
  const { colors, accentColor } = useTheme();
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
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
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
        duration: status.isLoaded ? (status.durationMillis ?? 0) / 1000 : 0,
      };
      setAudioState(newAudioState);
      return newAudioState;
    } catch (err) {
      setError(true);
      throw err;
    }
  };

  const playPauseAudio = async (uri: string) => {
    const state = await initializeAudio(uri);
    if (state.sound) {
      if (state.isPlaying) {
        await state.sound.pauseAsync();
        setAudioState({ ...state, isPlaying: false });
        setPlayingMedia(null);
      } else {
        if (playingMedia && playingMedia !== uri && audioState?.sound) {
          await audioState.sound.pauseAsync();
          setAudioState((prev) => (prev ? { ...prev, isPlaying: false } : null));
        }

        setPlayingMedia(uri);
        const status = await state.sound.getStatusAsync();
        if (status.isLoaded && status.positionMillis === status.durationMillis) {
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
                    duration: (status.durationMillis ?? 0) / 1000,
                  }
                : null
            );
            if (status.didJustFinish) {
              state.sound.stopAsync();
              setAudioState((prev) => (prev ? { ...prev, isPlaying: false, progress: 0 } : null));
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

  if (error) {
    return (
      <View className="flex-row items-center bg-[#f0f0f0] p-2.5 rounded-[10px] self-center">
        <Ionicons name="alert-circle-outline" size={30} color={accentColor} />
        <Text className="font-inter ml-2.5 text-[#333] text-base">Couldn't load audio</Text>
      </View>
    );
  }

  if (loading || !audioState) {
    return (
      <View className="flex-row items-center bg-[#f0f0f0] p-2.5 rounded-[10px] self-center">
        <ActivityIndicator testID="audioLoadingIndicator" size="large" color={accentColor} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center bg-[#f0f0f0] p-2.5 rounded-[10px] self-center my-2.5" style={{ width: width - 40 }}>
      <TouchableOpacity onPress={() => playPauseAudio(uri)} testID="audioButton">
        <Ionicons name={audioState.isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={30} color={colors.foreground} />
      </TouchableOpacity>
      <Slider
        style={{ flex: 1, marginHorizontal: 10 }}
        minimumValue={0}
        maximumValue={audioState.duration}
        value={audioState.progress}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor={colors.primary}
        onSlidingComplete={handleSlidingComplete}
      />
      <Text className="font-inter text-[#333] text-right w-[60px]">
        {formatTime(audioState.progress)} / {formatTime(audioState.duration)}
      </Text>
    </View>
  );
};

interface LoadingImageProps {
  uri: string;
  alt?: string;
  onPress: (uri: string) => void;
}

const LoadingImage: React.FC<LoadingImageProps> = ({ uri, alt, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { colors, accentColor } = useTheme();

  if (error) {
    return (
      <View testID="no-image" className="w-[400px] h-[400px] relative justify-center items-center">
        <View className="flex-1 justify-center items-center p-2.5">
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text className="font-inter mt-2.5 text-black text-base">Couldn't load image</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-[400px] h-[400px] relative justify-center items-center">
      <Image
        testID="bufferingImage"
        source={{ uri }}
        className="w-full h-full"
        style={{ resizeMode: "contain", opacity: loading ? 0 : 1 }}
        accessibilityLabel={alt}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white/70">
          <ActivityIndicator testID="loadingIndicator" size="large" color={accentColor} />
        </View>
      )}
      <TouchableOpacity testID="imageButton" className="absolute top-0 left-0 right-0 bottom-0" onPress={() => onPress(uri)} />
    </View>
  );
};

const LoadingDots: React.FC = () => {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  if (!!process.env.JEST_WORKER_ID) {
    return (
      <Text className="font-inter" testID="loadingDotsStatic">
        ...
      </Text>
    );
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
    <View className="flex-row items-center">
      <Animated.Text style={{ fontFamily: "Inter", fontSize: 18, color: "#333", marginHorizontal: 2, opacity: dot1Opacity }}>.</Animated.Text>
      <Animated.Text style={{ fontFamily: "Inter", fontSize: 18, color: "#333", marginHorizontal: 2, opacity: dot2Opacity }}>.</Animated.Text>
      <Animated.Text style={{ fontFamily: "Inter", fontSize: 18, color: "#333", marginHorizontal: 2, opacity: dot3Opacity }}>.</Animated.Text>
    </View>
  );
};

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
  const { colors, accentColor } = useTheme();

  if (error) {
    return (
      <View testID="no-video" className="relative justify-center items-center bg-black" style={{ width: containerWidth, height: containerHeight }}>
        <View className="flex-1 justify-center items-center p-2.5">
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text className="font-inter mt-2.5 text-red-500 text-base">Couldn't load video</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="relative justify-center items-center bg-black" style={{ width: containerWidth, height: containerHeight }}>
      <Video
        source={{ uri }}
        className="w-full h-full"
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
          <ActivityIndicator testID="videoLoadingIndicator" size="large" color={accentColor} />
        </View>
      )}
      <TouchableOpacity testID="videoButton" className="absolute top-0 left-0 right-0 bottom-0" onPress={() => onPress(uri)}>
        <Ionicons name="play-circle-outline" size={50} color="white" style={{ alignSelf: "center", marginTop: 70 }} />
      </TouchableOpacity>
    </View>
  );
};

export interface NoteDetailData {
  title: string;
  description: string;
  creatorId?: string;
  time?: string;
  images?: { uri: string }[];
}

interface NoteDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  note?: NoteDetailData;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = memo(({ isVisible, onClose, note }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(false);
  const [creatorName, setCreatorName] = useState<string>("");
  const { width } = useWindowDimensions();
  const { colors, accentColor } = useTheme();

  useEffect(() => {
    setCreatorName("");
    setSelectedImage(null);
    setSelectedVideo(null);
    setIsModalVisible(false);
    setIsVideoVisible(false);

    if (note?.creatorId) {
      fetchCreatorName(note.creatorId)
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

  const onVideoPress = (video: { uri: string }) => {
    setSelectedVideo(video);
    setIsVideoVisible(true);
  };

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

        if (href && (href.endsWith(".mp4") || href.endsWith(".mov"))) {
          return (
            <View style={{ marginVertical: 20, alignSelf: "center" }}>
              <LoadingVideo uri={href as string} onPress={(uri) => onVideoPress({ uri })} width={width} />
            </View>
          );
        }

        if (href && (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".3gp"))) {
          return (
            <View style={{ marginVertical: 10, alignItems: "center", width: width - 40 }}>
              <LoadingAudio uri={href as string} />
            </View>
          );
        }

        return <Text style={{ fontFamily: "Inter", color: colors.foreground, marginVertical: 10 }}>{tnode.data}</Text>;
      },
    }),
    [colors, width]
  );

  const htmlSource = useMemo(() => ({ html: note?.description || "" }), [note]);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <TouchableOpacity onPress={onClose} className="absolute top-[50px] left-5 z-10 items-center justify-center bg-[#ccc] rounded-xl p-[5px]">
        <View className="w-10 h-10 rounded-lg bg-[#ccc] items-center justify-center">
          <Ionicons name="close" size={30} color={colors.foreground} />
        </View>
      </TouchableOpacity>

      <View className="p-2.5 bg-[#f5f5f5] border-t-2 border-t-[#ddd] flex-1 pt-[100px] h-full">
        <Text className="font-inter text-[22px] font-bold text-[#333] text-center mb-[5px]">{note?.title}</Text>

        <View className="flex-row items-center justify-between px-[15px] py-2.5">
          <View className="flex-row items-center flex-1">
            <Ionicons name="person-circle-outline" size={18} color={colors.foreground} />
            {creatorName ? <Text className="font-inter text-base text-[#333] ml-[5px]">{creatorName}</Text> : <LoadingDots />}
          </View>

          <View className="flex-row items-center justify-end flex-1">
            <Ionicons name="calendar-outline" size={18} color={colors.foreground} />
            <Text className="font-inter text-base text-[#333] ml-[5px]">{note?.time || "Date not available"}</Text>
          </View>
        </View>

        <View className="h-[2px] bg-[#ddd] my-2.5 w-full self-center" />

        <ScrollView>
          <RenderHTML
            baseStyle={{ color: colors.foreground }}
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

      <VideoModal isVisible={isVideoVisible} onClose={() => setIsVideoVisible(false)} videos={selectedVideo ? [selectedVideo] : []} />
    </Modal>
  );
});

export default NoteDetailModal;

const tagsStyles = {
  img: {
    maxWidth: "100%",
    height: "auto",
  },
};
