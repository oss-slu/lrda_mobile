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

const user = User.getInstance();

export type EditNoteScreenProps = {
  route: {
    params: {
      note: Note;
      onSave: (note: Note) => void;
    };
  };
  navigation: {
    goBack: () => void;
  };
};

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({
  route,
  navigation,
}) => {
  const { note, onSave } = route.params;
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [media, setMedia] = useState<Media[]>(note.media);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio);
  const [creator, setCreator] = useState(note.creator);
  const [owner, setOwner] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);

  useEffect(() => {
    if (creator === user.getId()) {
      setOwner(true);
    } else {
      setOwner(false);
    }
  }, [creator]);

  const updateNote = async (updatedNote: Note) => {
    try {
      const response = await fetch(
        "http://lived-religion-dev.rerum.io/deer-lr/overwrite",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "@id": updatedNote.id,
            title: updatedNote.title,
            BodyText: updatedNote.text,
            type: "message",
            creator: user.getId(),
            media: updatedNote.media,
            latitude: updatedNote.latitude,
            longitude: updatedNote.longitude,
            audio: newAudio,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating the note.");
      }

      // Update note in the app
      onSave(updatedNote);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    }
  };

  const handleSaveNote = () => {
    const updatedNote = { ...note, title, text, media };
    updateNote(updatedNote);
  };

  const handleGoBackCheck = () => {
    if (Platform.OS === "web") {
      navigation.goBack();
    } else {
      Alert.alert(
        "Going Back?",
        "Your note will not be saved!",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View>
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBackCheck}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <TextInput style={styles.title} value={title} onChangeText={setTitle} />
        {owner ? (
          <TouchableOpacity style={styles.backButton} onPress={handleSaveNote}>
            <Ionicons name="save-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
      <View style={styles.keyContainer}>
        <TouchableOpacity
          style={styles.toggles}
          onPress={() => {
            setViewMedia(!viewMedia);
          }}
        >
          <Ionicons name="images-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggles}
          onPress={() => {
            setViewAudio(!viewAudio);
          }}
        >
          <Ionicons name="mic-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 10 }}
        >
          {viewMedia && (
            <PhotoScroller newMedia={media} setNewMedia={setMedia} />
          )}
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
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
  backButton: {
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
    height: "7%",
    paddingVertical: 5,
    width: 130,
    backgroundColor: "tan",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
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
