import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Note, AddNoteScreenProps } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { User } from "../models/user_class";
import { Ionicons } from "@expo/vector-icons";
import { Media, AudioType } from "../models/media_class";
import AudioContainer from "../components/audio";
import * as Location from "expo-location";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging"

const user = User.getInstance();

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [newMedia, setNewMedia] = useState<Media[]>([]);
  const [newAudio, setNewAudio] = useState<AudioType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    console.log("new Media array:", newMedia);
  }, [newMedia]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const saveNote = async () => {
    try {
      const newNote = {
        title: titleText,
        text: bodyText,
        media: newMedia,
        audio: newAudio,
        creator: user.getId(),
        latitude: location?.latitude.toString() || "",
        longitude: location?.longitude.toString() || "",
        published: isPublished,
        tags: tags,
      };
      const response = await ApiService.writeNewNote(newNote);

      const obj = await response.json();
      const id = obj["@id"];

      route.params.refreshPage();
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
  };

  return (
    <View>
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.topButtons} onPress={saveNote}>
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TextInput
          style={styles.title}
          placeholder="Title Field Note"
          onChangeText={(text) => setTitleText(text)}
          value={titleText}
        />

        {isPublished ? (
          <TouchableOpacity
            style={styles.topButtons}
            onPress={() => setIsPublished(!isPublished)}
          >
            <Ionicons name="earth" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.topButtons}
            onPress={() => setIsPublished(!isPublished)}
          >
            <Ionicons name="earth-outline" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.keyContainer}>
          <TouchableOpacity onPress={() =>{
            setViewMedia(!viewMedia);
            setViewAudio(false);
            setIsTagging(false);
          }}>
            <Ionicons name="images-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>{
            setViewMedia(false);
            setViewAudio(!viewAudio);
            setIsTagging(false);
          }}>
            <Ionicons name="mic-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="location-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="time-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() =>{
            setViewMedia(false);
            setViewAudio(false);
            setIsTagging(!isTagging);
          }}>
            <Ionicons name="pricetag-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 100 }}
        >
          {viewMedia && (
            <PhotoScroller newMedia={newMedia} setNewMedia={setNewMedia} />
          )}
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && (
          <TagWindow tags={tags} setTags={setTags} />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write your note here"
              multiline={true}
              textAlignVertical="top"
              onChangeText={(text) => setBodyText(text)}
              value={bodyText}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 5,
    minHeight: "15%",
    paddingTop: "15%",
    flexDirection: "row",
    backgroundColor: "#F4DFCD",
    alignItems: "center",
    textAlign: "center",
  },
  topText: {
    flex: 1,
    maxWidth: "100%",
    fontWeight: "700",
    fontSize: 32,
    textAlign: "center",
  },
  topButtons: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  toggles: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    zIndex: 99,
  },
  container: {
    paddingHorizontal: 16,
    backgroundColor: "white",
    overflow: "hidden",
    paddingBottom: "50%",
  },
  title: {
    height: 45,
    width: "70%",
    borderColor: "#111111",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    textAlign: "center",
    fontSize: 30,
  },
  input: {
    flex: 1,
    borderColor: "#111111",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    paddingBottom: "90%",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  keyContainer: {
    height: 60,
    paddingVertical: 5,
    width: "100%",
    backgroundColor: "#F4DFCD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  saveText: {
    color: "#111111",
    fontWeight: "bold",
    fontSize: 12,
  },
  inputContainer: {
    height: 400,
    justifyContent: "space-between",
  },
});

export default AddNoteScreen;
