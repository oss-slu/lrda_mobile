// EditNoteScreen.tsx
import React, { useState } from "react";
import { Alert, View, TextInput, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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
  const [images, setimages] = useState<string[]>(note.images);

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
            items: updatedNote.images,
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
    const updatedNote = { ...note, title, text, images };
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
    <View>
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
      <View style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 10 }}
        >
          <TextInput
            style={styles.title}
            value={title}
            onChangeText={setTitle}
          />
          { <PhotoScroller newImages={images} setNewImages={setimages} />}
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
    height: 45,
    borderColor: "#111111",
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 20,
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
