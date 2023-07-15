import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioType } from "../models/media_class";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";
import { uploadAudio } from "../utils/S3_proxy";

function getDurationFormatted(millis: number) {
  const minutes = millis / 1000 / 60;
  const minutesDisplay = Math.floor(minutes);
  const seconds = Math.round((minutes - minutesDisplay) * 60);
  const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
  return `${minutesDisplay}:${secondsDisplay}`;
}

function AudioContainer({
  newAudio,
  setNewAudio,
}: {
  newAudio: AudioType[];
  setNewAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);

  async function startRecording() {
    setIsRecording(true);
    try {
      console.log("Starting Recording");
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync();
        await recording.startAsync();

        setRecording(recording);
      } else {
        alert("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      console.log("Stopping recording");

      if (recording) {
        await recording.stopAndUnloadAsync();

        const uri = await recording.getURI();
        const dat = await uploadAudio(uri || "");
        const index = newAudio ? newAudio.length : 0;

        if (uri) {
          const { sound, status } = await Audio.Sound.createAsync({ uri: uri });

          const newRecording = new AudioType({
            uuid: uuid.v4().toString(),
            type: "audio",
            uri: dat || "",
            duration:
              status && status.durationMillis
                ? getDurationFormatted(status.durationMillis)
                : "",
            name: `Recording ${index + 1}`,
          });

          setNewAudio([...newAudio, newRecording]);
        } else {
          console.error("Failed to get URI from recording");
        }
      } else {
        console.error("Recording is not set");
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  async function playAudio(index: number) {
    console.log("entered audio player");
    const current = newAudio[index];
    const player = new Audio.Sound();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    try {
      await player.loadAsync({ uri: current.getUri() });

      await player.playAsync();
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeleteAudio = (index: number) => {
    const updatedAudio = [...newAudio];
    updatedAudio.splice(index, 1);
    setNewAudio(updatedAudio);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Ionicons name={"mic-outline"} size={60} color="#111111" />
        <Text style={{ fontSize: 24, fontWeight: "600" }}> Record </Text>
        {isRecording ? (
          <TouchableOpacity onPress={() => stopRecording()}>
            <Ionicons name={"stop-circle-outline"} size={45} color="#111111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => startRecording()}>
            <Ionicons name={"radio-button-on-outline"} size={45} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          backgroundColor: "darkGrey",
          width: "95%",
          height: 5,
          borderRadius: 30,
          marginBottom: 10,
        }}
      ></View>

      <View
        style={{
          width: "100%",
          alignItems: "center",
        }}
      >
        {newAudio?.map((audio, index) => (
          <View
            style={{
              flexDirection: "row",
              width: "70%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            key={index}
          >
            <TouchableOpacity
              onPress={() => playAudio(index)}
              style={{ flex: 1 }}
            >
              <Text style={{ textAlign: "center" }}>
                {audio.name} ------- {audio.duration} {"\n"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteAudio(index)}
              style={{ marginBottom: "10%" }}
            >
              <Ionicons name="trash-outline" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

export default AudioContainer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 25,
  },
});
