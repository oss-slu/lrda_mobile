import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";
import { uploadAudio } from "../utils/S3_proxy";  // Assuming you have a function to upload the audio
import { AudioType } from "../models/media_class";  // Assuming AudioType is correctly defined

type AudioContainerProps = {
  newAudio: AudioType[];
  setNewAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
  insertAudioToEditor: (audioUri: string) => void;
};

const AudioContainer = ({ newAudio, setNewAudio, insertAudioToEditor }: AudioContainerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);

  async function startRecording() {
    setIsRecording(true);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        alert("Please grant permission to access the microphone");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
        if (uri) {
          const uploadedUri = await uploadAudio(uri);  // Upload audio to your storage
          const newRecording = new AudioType({
            uuid: uuid.v4().toString(),
            type: "audio",
            uri: uploadedUri,
            duration: "00:30",  // Assuming a 30-second audio
            name: `Recording ${newAudio.length + 1}`,
          });

          setNewAudio([...newAudio, newRecording]);

          // Insert the uploaded audio into the editor
          insertAudioToEditor(uploadedUri);
        }
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isRecording ? (
          <Ionicons name={"mic-outline"} size={60} color="red" />
        ) : (
          <Ionicons name={"mic-outline"} size={60} color="#111111" />
        )}
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Recordings</Text>
        {isRecording ? (
          <TouchableOpacity onPress={stopRecording}>
            <Ionicons name={"stop-circle-outline"} size={45} color="#111111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startRecording}>
            <Ionicons name={"radio-button-on-outline"} size={45} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.audioList}>
        {newAudio?.map((audio, index) => (
          <View style={styles.audioItem} key={index}>
            <Text>{audio.name}</Text>
            <TouchableOpacity onPress={() => console.log("Play audio")}>
              <Ionicons name="play-outline" size={25} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
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
});
