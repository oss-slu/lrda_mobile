// EditNoteScreen.tsx
import React, { useState } from "react";
import { Alert, View, TextInput, Text, StyleSheet, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAvoidingScrollView } from 'react-native-keyboard-avoiding-scroll-view';
import { KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { User } from "../utils/user_class";
import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

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
    const updatedNote = { ...note, title, text };
    updateNote(updatedNote);
  };

  const handleGoBackCheck = () => {
    Alert.alert(
      "Going Back?",
      "Your note will not be saved!",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            navigation.goBack();
        },
      }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{flex:1}} >
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBackCheck}
        >
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.topText}>Editing Note</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleSaveNote}>
          <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
          <TextInput
            style={styles.title}
            value={title}
            onChangeText={setTitle}
          />
            {/* <PhotoScroller /> */}
            <TextInput
              style={styles.input}
              multiline={true}
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
            />
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
    Height: "15%",
    paddingTop: "15%",
    paddingBottom: "5%",
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
  title: {
    width: '90%',
    alignSelf: 'center',
    height: 45,
    borderColor: "#111111",
    borderBottomWidth: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlign: "center",
    fontSize: 30,
  },
  input: {
    flex: 1,
    fontSize: 22,
    padding: 10,
    paddingBottom: '90%',
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
