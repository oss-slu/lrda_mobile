import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";

import { uploadAudio } from "../utils/S3_proxy";
import { AudioType } from "../models/media_class";

type AudioContainerProps = {
  newAudio: AudioType[];
  setNewAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
  insertAudioToEditor: (audioUri: string) => void;
};

const AudioContainer = ({ newAudio, setNewAudio, insertAudioToEditor }: AudioContainerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Microphone Permission Denied", "Please enable microphone access.");
        return;
      }

      setIsRecording(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      setRecording(recording);
    } catch (error) {
      console.error("Failed to start recording", error);
      setIsRecording(false);
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
          const uploadedUri = await uploadAudio(uri);
          const newRecording = new AudioType({
            uuid: uuid.v4().toString(),
            type: "audio",
            uri: uploadedUri,
            duration: "00:30",
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
    <View className="bg-white mb-2.5 w-full items-center p-2.5" testID="audio-container">
      <View className="flex-row items-center justify-between w-full">
        {isRecording ? <Ionicons name="mic-outline" size={60} color="red" /> : <Ionicons name="mic-outline" size={60} color="#111111" />}

        <Text className="font-inter text-2xl font-semibold">Recordings</Text>

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
        contentContainerStyle={{ width: "100%", alignItems: "center" }}
        renderItem={({ item }) => (
          <View className="bg-[#f0f2f3] mb-2.5 p-2.5 rounded-[5px] flex-row justify-between items-center w-[90%]">
            <Text className="text-base font-medium text-[#333]">{item.name}</Text>
            <TouchableOpacity onPress={() => (playingAudio === item.uri ? stopAudio() : playAudio(item.uri))}>
              <Ionicons
                name={playingAudio === item.uri ? "pause-circle-outline" : "play-circle-outline"}
                size={30}
                color={playingAudio === item.uri ? "red" : "#111111"}
              />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text className="text-[#888] text-base mt-5">No recordings available</Text>}
      />
    </View>
  );
};

export default AudioContainer;
