import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from "expo-audio";
import uuid from "react-native-uuid";

import { uploadAudio } from "../utils/S3_proxy";
import type { AudioType } from "../models/media_class";

type AudioContainerProps = {
  newAudio: AudioType[];
  setNewAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
  insertAudioToEditor: (audioUri: string) => void;
};

const AudioContainer = ({ newAudio, setNewAudio, insertAudioToEditor }: AudioContainerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    if (playerStatus.didJustFinish) {
      setPlayingAudio(null);
    }
  }, [playerStatus.didJustFinish]);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone Permission Denied", "Please enable microphone access.");
        return;
      }

      setIsRecording(true);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error("Failed to start recording", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      if (recorder.isRecording) {
        await recorder.stop();
        const uri = recorder.uri;
        await setAudioModeAsync({ allowsRecording: false });

        if (uri) {
          const uploadedUri = await uploadAudio(uri);
          const newRecording: AudioType = {
            uuid: uuid.v4().toString(),
            type: "audio",
            uri: uploadedUri,
            duration: "00:30",
            name: `Recording ${newAudio.length + 1}`,
            isPlaying: false,
          };

          setNewAudio((prevAudio) => [...prevAudio, newRecording]);
          insertAudioToEditor(uploadedUri);
        }
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const playAudio = async (uri: string) => {
    try {
      player.replace({ uri });
      setPlayingAudio(uri);
      player.play();
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  const stopAudio = async () => {
    player.pause();
    setPlayingAudio(null);
  };

  return (
    <View className="mb-2.5 w-full items-center bg-white p-2.5" testID="audio-container">
      <View className="w-full flex-row items-center justify-between">
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
          <View className="mb-2.5 w-[90%] flex-row items-center justify-between rounded-[5px] bg-[#f0f2f3] p-2.5">
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
        ListEmptyComponent={<Text className="mt-5 text-base text-[#888]">No recordings available</Text>}
      />
    </View>
  );
};

export default AudioContainer;
