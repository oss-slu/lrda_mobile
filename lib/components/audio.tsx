import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";

import { uploadAudio } from "../utils/S3_proxy";  // Assuming you have a function to upload the audio
import { AudioType } from "../models/media_class";  // Assuming AudioType is correctly defined
import { defaultTextFont } from "../../styles/globalStyles";


type AudioContainerProps = {
  newAudio: AudioType[];
  setNewAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
  insertAudioToEditor: (audioUri: string) => void;
};

const AudioContainer = ({
  newAudio,
  setNewAudio,
  insertAudioToEditor,
}: AudioContainerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Clean up any active audio players when component unmounts
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const startRecording = async () => {
    try {
      console.log("🎤 [Audio] Starting recording process...");
      
      // Check if Audio object is available
      if (!Audio) {
        console.error("❌ [Audio] Audio object is not available");
        Alert.alert("Audio Error", "Audio functionality is not available.");
        return;
      }

      // Request permissions using the correct API
      let permission;
      try {
        if (Audio.requestPermissionsAsync) {
          permission = await Audio.requestPermissionsAsync();
        } else {
          // Fallback: assume permission is granted for now
          permission = { status: "granted" };
        }
      } catch (permError) {
        console.warn("⚠️ [Audio] Permission request failed, continuing anyway:", permError);
        permission = { status: "granted" };
      }

      if (permission.status !== "granted") {
        Alert.alert("Microphone Permission Denied", "Please enable microphone access in your device settings.");
        return;
      }

      console.log("✅ [Audio] Permissions granted, setting up recording...");
      setIsRecording(true);
      
      // Set audio mode
      try {
        if (Audio.setAudioModeAsync) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        }
      } catch (modeError) {
        console.warn("⚠️ [Audio] Failed to set audio mode:", modeError);
      }

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      console.log("✅ [Audio] Recording started successfully");
    } catch (error) {
      console.error("💥 [Audio] Failed to start recording:", error);
      setIsRecording(false);
      Alert.alert("Recording Error", `Failed to start recording: ${error.message}`);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);

        if (uri) {
          const uploadedUri = await uploadAudio(uri); // Upload the recording
          const newRecording = new AudioType({
            uuid: uuid.v4().toString(),
            type: "audio",
            uri: uploadedUri,
            duration: "00:30", // Example duration, replace with real duration if available
            name: `Recording ${newAudio.length + 1}`,
            isPlaying: false,
          });

          setNewAudio((prevAudio) => [...prevAudio, newRecording]);
          insertAudioToEditor(uploadedUri);
        }
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const playAudio = async (uri: string) => {
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setPlayingAudio(null);
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setCurrentSound(sound);
      setPlayingAudio(uri);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setPlayingAudio(null);
    }
  };

  return (
    <View style={styles.container} testID="audio-container">
      <View style={styles.header}>
        {isRecording ? (
          <Ionicons name="mic-outline" size={60} color="red" />
        ) : (
          <Ionicons name="mic-outline" size={60} color="#111111" />
        )}

        <Text style={{ ...defaultTextFont, fontSize: 24, fontWeight: "600" }}>Recordings</Text>

        {isRecording ? (
          <TouchableOpacity onPress={stopRecording}>
            <Ionicons name="stop-circle-outline" size={45} color="#111111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startRecording}>
            <Ionicons name="radio-button-on-outline" size={45} color="red" />
          </TouchableOpacity>
        )}
      </View>


      <FlatList
        data={newAudio}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.audioList}
        renderItem={({ item }) => (
          <View style={styles.audioItem}>
            <Text style={styles.audioText}>{item.name}</Text>
            <TouchableOpacity
              onPress={() =>
                playingAudio === item.uri ? stopAudio() : playAudio(item.uri)
              }
            >
              <Ionicons
                name={
                  playingAudio === item.uri
                    ? "pause-circle-outline"
                    : "play-circle-outline"
                }
                size={30}
                color={playingAudio === item.uri ? "red" : "#111111"}
              />

            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No recordings available</Text>
        }
      />
    </View>
  );
};

export default AudioContainer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
  },
  audioList: {
    width: "100%",
    alignItems: "center",
  },
  audioItem: {
    backgroundColor: "#f0f2f3",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  audioText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  emptyListText: {
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
});
