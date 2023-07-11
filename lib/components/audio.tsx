import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Media, AudioType } from "../models/media_class";
import { Audio } from "expo-av";
import uuid from "react-native-uuid";

function AudioContainer() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);
  const [recordings, setRecordings] = useState<AudioType[]>([]);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      if (recording) {
        stopRecording();
      }
    }
  }, [isRecording]);

  async function startRecording() {
    try {
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
    try {
      console.log("Stopping recording");

      await recording?.stopAndUnloadAsync();
  
      const uri = recording?.getURI();
      console.log(uri);

      const { sound, status } = await Audio.Sound.createAsync({ uri });

      const newMedia = new AudioType({
        uuid: uuid.v4().toString(),
        type: 'audio',
        uri: uri,
        duration: getDurationFormatted(status.durationMillis),
      });
  
      const updatedRecordings = [...newAudio, {
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: uri
      }];
  
      setRecordings(updatedRecordings);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <Image
          style={styles.image}
          source={require("./public/microphone.jpg")}
        />
        <TouchableOpacity onPress={() => setIsRecording(!isRecording)}>
          <Ionicons
            name={recording ? "stop-outline" : "radio-button-on-outline"}
            size={24}
            color="#111111"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default AudioContainer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
    height: 300,
    alignItems: 'center'
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 25,
  },
});
