import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Note, RootStackParamList } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { User } from "../utils/user_class";
import { Ionicons } from "@expo/vector-icons";
import AudioContainer from "../components/audio";

const user = User.getInstance();

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [viewMedia, setViewMedia] = useState(true);
  const [viewAudio, setViewAudio] = useState(false);

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
    return obj["@id"];
  };

  const saveNote = async () => {
    try {
      const id = await createNote(titleText, bodyText);
      const note: Note = {
        id,
        title: titleText,
        text: bodyText,
        time: "",
        images: [],
        creator: "",
      }; // The note will get assigned a time

      if (route.params?.onSave) {
        route.params.onSave(note);
      }
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
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
        <TouchableOpacity style={styles.topButtons} onPress={handleGoBackCheck}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <TextInput
          style={styles.title}
          placeholder="Title Note"
          onChangeText={(text) => setTitleText(text)}
          value={titleText}
        />
        <TouchableOpacity style={styles.topButtons} onPress={saveNote}>
          <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.keyContainer}>
        <TouchableOpacity style={styles.toggles} onPress={() => {setViewMedia(!viewMedia)}}>
          <Ionicons name="images-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggles} onPress={() => {setViewAudio(!viewAudio)}}>
          <Ionicons name="mic-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 100 }}
        >
          {viewMedia && (
            <PhotoScroller newImages={newImages} setNewImages={setNewImages} />
          )}
          {viewAudio && (
            <AudioContainer
              newImages={[]}
              setNewAudio={function (
                value: React.SetStateAction<string[]>
              ): void {
                throw new Error("Function not implemented.");
              }}
            />
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
    width: '70%',
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
    height: "7%",
    paddingVertical: 5,
    width: 130,
    backgroundColor: "tan",
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
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
