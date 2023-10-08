import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioType } from "../models/media_class";
import Slider from "@react-native-community/slider";
// Checkout Audio for expo av!
import { Audio} from "expo-av";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<null | Audio.Sound>(null);
  const [reNaming, setRenaming] = useState("");
  const [newName, setNewName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sliderValues, setSliderValues] = useState<number[]>([]);
  const [pausedPosition, setPausedPosition] = useState<number | null>(null);
  const [pausedAudioIndex, setPausedAudioIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkPlayerStatus = async () => {
      if (player) {
        const status = await player.getStatusAsync();
        console.log("status: ", status);
        setIsPlaying(false);
      }
    };
    checkPlayerStatus();
  }, [isPlaying, player]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && currentIndex !== null) {
      interval = setInterval(() => updateSlider(currentIndex), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex]);

  const updateSlider = async (index: number) => {
    if (player && isPlaying && currentIndex === index) {
      const status = await player.getStatusAsync();
      if (pausedAudioIndex === index && pausedPosition !== null) {
        setSliderValueAtIndex(index, pausedPosition / status.durationMillis);
      } else {
        setSliderValueAtIndex(
          index,
          status.positionMillis / status.durationMillis
        );
      }
    }
  };
  const HIGH_QUALITY = {
    isMeteringEnabled: true,
    android: {
      extension: '.mp3',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.4ma',
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  }
  const recordingOptions = {
    ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
    ...HIGH_QUALITY,
  };

  async function startRecording() {
    setIsRecording(true);
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: true,
        });
        
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(recordingOptions);
        await recording.startAsync();

          setRecording(recording);
        } else {
          alert("Please grant permission to app to access microphone");
        }
      } catch (err) {
        console.error("Failed to start recording", err);
      }
      console.log("Start recording");
    }

   async function stopRecording() {
    setIsRecording(false);
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    try {
      console.log("Stopping recording");
      console.log(recording);
      if (recording) {
        await recording.stopAndUnloadAsync();

        const uri = recording.getURI();
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
            isPlaying: false,
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
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      if (player !== null && isLoaded) {
        await player.unloadAsync();
        setIsLoaded(false);
      }
      const newPlayer = new Audio.Sound();

      console.log("play uri===", current.getUri());
      await newPlayer.loadAsync({ uri:current.getUri() });
      newPlayer.setOnPlaybackStatusUpdate((status) => {

        setIsLoaded(status.isLoaded);

        if (status.didJustFinish) {
          setIsPlaying(false);
          const updatedAudio = [...newAudio];
          updatedAudio[index].isPlaying = false;
          setNewAudio(updatedAudio);
          setCurrentIndex(-1);
          setSliderValueAtIndex(index, 0); // Reset the slider value for the finished audio clip
        } else if (status.isPlaying) {
          setSliderValueAtIndex(
            index,
            status.positionMillis / status.durationMillis
          );
        }
      });

      if (pausedPosition !== null && pausedAudioIndex === index) {
        await newPlayer.setPositionAsync(pausedPosition);
      }

      await newPlayer.playAsync();

      const updatedAudio = [...newAudio];
      updatedAudio[index].isPlaying = true;
      setNewAudio(updatedAudio);
      setPlayer(newPlayer);
      setCurrentIndex(index);
      setPausedAudioIndex(null);
    } catch (error) {
      console.error("Error while playing audio:", error);
    }
  }

  async function pauseAudio(index: number) {
    try {
      if (player) {
        const status = await player.getStatusAsync();
        setPausedPosition(status.positionMillis);
        await player.pauseAsync();
      }

      const updatedAudio = [...newAudio];
      updatedAudio[index].isPlaying = false;
      setNewAudio(updatedAudio);
      setCurrentIndex(-1);
      setPausedAudioIndex(index);
    } catch (error) {
      console.error("Error while pausing audio:", error);
    }
  }

  async function handleSliderChange(value: number, index: number) {
    const newSliderValues = [...sliderValues];
    newSliderValues[index] = value;
    setSliderValues(newSliderValues);

    if (player && isLoaded) {
      const status = await player.getStatusAsync();
      await player.setPositionAsync(value * status.durationMillis);
      if (!status.isPlaying) {
        await playAudio(index);
      }
    }
  }

  const setSliderValueAtIndex = (index: number, value: number) => {
    const newSliderValues = [...sliderValues];
    newSliderValues[index] = value;
    setSliderValues(newSliderValues);
  };

  const handleRename = (index: number) => {
    if (newName == "") {
      setRenaming("");
      return;
    }
    const updatedAudio = [...newAudio];
    updatedAudio[index].name = newName;
    setNewAudio(updatedAudio);
    setRenaming("");
  };

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
        <Text style={{ fontSize: 24, fontWeight: "600" }}>Recordings</Text>
        {isRecording ? (

          <TouchableOpacity 
            onPress={ () => stopRecording() }
            testID="stopRecordingButton"
          >
          <Ionicons name={"stop-circle-outline"} size={45} color="#111111" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={ () => startRecording() }
            testID="startRecordingButton"
          >
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
              borderRadius: 10,
              backgroundColor: "rgb(240,242,243)",
              marginBottom: 10,
              paddingHorizontal: 20,
              paddingVertical: 5,
            }}
            key={index}
          >
            {reNaming === audio.uuid && (
              <TextInput
                style={styles.textBox}
                placeholder={audio.name}
                onChangeText={(text) => setNewName(text)}
                onSubmitEditing={() => {
                  handleRename(index);
                }}
                testID="textInput"
              ></TextInput>
            )}
            <View
              style={{
                flexDirection: "row",
                width: "90%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {audio.isPlaying ? (
                <TouchableOpacity onPress={() => pauseAudio(index)}>
                  <Ionicons name={"pause-outline"} size={25} color="#111111" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => playAudio(index)}testID="playButton">
                  <Ionicons name={"play-outline"} size={25} color="#111111" />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setRenaming(audio.uuid)}>
                  <Text style={{ textAlign: "center" }}>{audio.name}</Text>
                </TouchableOpacity>
                <Slider
                  style={{ width: 200, height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={sliderValues[index]}
                  onValueChange={(value) => handleSliderChange(value, index)}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                />
                <Text style={{ textAlign: "center" }}>{audio.duration}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteAudio(index)}
                style={{ marginBottom: 5 }}
              >
                <Ionicons name="trash-outline" size={25} color="#111111" />
              </TouchableOpacity>
            </View>
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
  textBox: {
    borderColor: "black",
    borderBottomWidth: 2,
    borderRadius: 2,
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
    width: 200,
    textAlign: "center",
  },
});