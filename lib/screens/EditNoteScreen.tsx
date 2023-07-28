// EditNoteScreen.tsx
import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  View,
  TextInput,
  Text,
  StyleSheet,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType } from "../models/media_class";
import { EditNoteScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";

const user = User.getInstance();

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({
  route,
  navigation,
}) => {
  const { note, onSave } = route.params;
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [tags, setTags] = useState(note.tags);
  const [media, setMedia] = useState<Media[]>(note.media);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio);
  const [isPublished, setIsPublished] = useState(note.published);
  const [creator, setCreator] = useState(note.creator);
  const [owner, setOwner] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isLocation, setIsLocation] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    note.latitude && note.longitude
      ? {
          latitude: parseFloat(note.latitude),
          longitude: parseFloat(note.longitude),
        }
      : null
  );

  useEffect(() => {
    if (creator === user.getId()) {
      setOwner(true);
    } else {
      setOwner(false);
    }
  }, [creator]);

  const handleSaveNote = async () => {
    try {
      const editedNote: Note = {
        id: note.id,
        title: title,
        text: text,
        creator: user.getId() || "",
        media: media,
        latitude: location?.latitude.toString() || "",
        longitude: location?.longitude.toString() || "",
        audio: newAudio,
        published: isPublished,
        time: note.time,
        tags: tags,
      };

      const response = await ApiService.overwriteNote(editedNote);

      onSave(editedNote);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    }
  };

  return (
    <View>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.topButtons}
          onPress={owner ? handleSaveNote : () => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="Title Field Note"
          style={styles.title}
          value={title}
          onChangeText={setTitle}
        />
        {owner ? (
          isPublished ? (
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
          )
        ) : (
          <View />
        )}
      </View>
      <View style={{ backgroundColor: "black" }}>
        <View style={styles.keyContainer}>
          <TouchableOpacity
            onPress={() => {
              setViewMedia(!viewMedia);
              setViewAudio(false);
              setIsTagging(false);
              setIsLocation(false);
            }}
          >
            <Ionicons name="images-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setViewMedia(false);
              setViewAudio(!viewAudio);
              setIsTagging(false);
              setIsLocation(false);
            }}
          >
            <Ionicons name="mic-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setViewMedia(false);
              setViewAudio(false);
              setIsTagging(false);
              setIsLocation(!isLocation);
            }}
          >
            <Ionicons name="location-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="time-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setViewMedia(false);
              setViewAudio(false);
              setIsTagging(!isTagging);
              setIsLocation(false);
            }}
          >
            <Ionicons name="pricetag-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 10 }}
        >
          {viewMedia && (
            <PhotoScroller newMedia={media} setNewMedia={setMedia} />
          )}
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={location} setLocation={setLocation} />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              multiline={true}
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
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
    maxWidth: "100%",
    fontWeight: "700",
    fontSize: 32,
  },
  topButtons: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 16,
    backgroundColor: "white",
    overflow: "hidden",
    paddingBottom: "50%",
  },
  title: {
    width: "70%",
    alignSelf: "center",
    height: 45,
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
  saveButton: {
    backgroundColor: "#C7EBB3",
    paddingHorizontal: 120,
    padding: 10,
    alignItems: "center",
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: "center",
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

export default EditNoteScreen;
