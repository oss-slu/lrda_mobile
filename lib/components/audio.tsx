import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Media, AudioType } from "../models/media_class";
import { Audio, Video } from "expo-av";
import uuid from "react-native-uuid";
import * as FileSystem from "expo-file-system";

const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/";

let attempts = 0;

async function uploadAudio(uri: string): Promise<string> {
  console.log("uploadMedia - Input URI:", uri);

  let data = new FormData();
  const uniqueName = `media-${Date.now()}.mp3`; // Use fileType variable

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, {
      type: `audio/mp3`,
    });
    console.log("Blob size:", blob.size);
    console.log("File size:", file.size);

    data.append("file", file);
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    base64 = `data:audio/mp3;base64,${base64}`;
    data.append("file", {
      type: `audio/mp3`,
      uri: base64,
      name: uniqueName,
    });
  }

  return fetch(S3_PROXY_PREFIX + "uploadFile", {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then((resp) => {
      console.log("Got the response from the upload file servlet");
      console.log("uploadMedia - Server response status:", resp.status);
      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("uploadMedia - Uploaded successfully, Location:", location);
        attempts = 0;
        return location;
      } else {
        console.log("uploadMedia - Server response body:", resp.body);
      }
    })
    .catch((err) => {
      if (attempts > 3) {
        console.error("uploadMedia - Error:", err);
        return err;
      }
      attempts++;
      return uploadAudio(uri);
    });
}

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState<null | Audio.Recording>(null);
  const [playingUI, setPlayingUI] = useState(false);
  const [audio, setAudio] = useState<AudioType[]>([]);

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
        const dat = await uploadAudio(uri);
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

          console.log("This is the recording object: ", newRecording);

          setNewAudio([...newAudio, newRecording]);

          // setRecording(null);
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

  // const loadAudio = (index: number) => {
  //   const audioToLoad = newAudio[index];
  //   if (audioToLoad) {
  //     setAudio(audioToLoad);
  //     setPlayingUI(true);
  //   }
  // };

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
            <Ionicons name={"stop-outline"} size={45} color="#111111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => startRecording()}>
            <Ionicons name={"radio-button-on-outline"} size={45} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{backgroundColor: 'darkGrey', width: '95%', height: 5, borderRadius: 30, marginBottom: 10}}>
      </View>

      <View
        style={{
          width: "100%",
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        {newAudio?.map((audio, index) => (
          <View
            style={{
              flexDirection: "row",
              width: "70%",
              justifyContent: "space-between",
              alignItems: 'center',
            }}
            key={index}
          >
            <TouchableOpacity onPress={() => playAudio(index)} style={{ flex: 1 }}>
                <Text style={{ textAlign: "center" }}>
                  {audio.name} ------- {audio.duration} {"\n"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDeleteAudio(index)} style={{ marginBottom: "10%" }}>
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
    // height: ,
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
