import React, { useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Note, RootStackParamList } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { User } from "../utils/user_class";
import { Ionicons } from "@expo/vector-icons";
import { createdAt } from "expo-updates";


const user = User.getInstance();
// console.log("User id: ", user.getId());

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    console.log("new Images array:", newImages);
  }, [newImages]);


  const createNote = async (title: string, body: string) => {
    const response = await fetch(
      "http://lived-religion-dev.rerum.io/deer-lr/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "message",
          title: title,
          items: newImages,
          BodyText: body,
          creator: user.getId(),
        }),
      }
    );

    const obj = await response.json();
    console.log(obj["@id"]);
    return obj["@id"];
  };

  const saveNote = async () => {
    try {
      const id = await createNote(titleText, bodyText);
      const note: Note = { id, title: titleText, text: bodyText, time: '', images: [] }; // The note will get assigned a time

      if (route.params?.onSave) {
        route.params.onSave(note);
      }
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
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
        <Text style={styles.topText}>Creating Note</Text>
        <TouchableOpacity style={styles.backButton} onPress={saveNote}>
          <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 100 }}
        >
          <TextInput
            style={styles.title}
            placeholder="Title your note here"
            onChangeText={(text) => setTitleText(text)}
            value={titleText}
          />
          { <PhotoScroller newImages={newImages} setNewImages={setNewImages} />}
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
  backButton: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
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

export default AddNoteScreen;
