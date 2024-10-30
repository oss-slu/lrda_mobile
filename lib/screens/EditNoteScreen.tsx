import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PhotoScroller from "../components/photoScroller";
import { getThumbnail } from "../utils/S3_proxy";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType } from "../models/media_class";
import { EditNoteScreenProps, Note } from "../../types";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles from "../../styles/pages/NoteStyles";
import ToastMessage from "react-native-toast-message";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import * as Location from "expo-location";

const user = User.getInstance();

// Utility function to format the note
const formatNote = (note) => ({
  id: note.id || "",
  title: note.title || "Untitled",
  text: typeof note.text === "string" ? note.text : "",
  time: note.time ? new Date(note.time) : new Date(),
  creator: note.creator || "",
  latitude: note.latitude || "0",
  longitude: note.longitude || "0",
  media: note.media || [],
  audio: note.audio || [],
  published: note.published || false,
  tags: note.tags || [],
});

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({ route, navigation }) => {
  const { note, onSave } = route.params;
  const formattedNote = formatNote(note);

  // State management for all note properties
  const [title, setTitle] = useState(formattedNote.title);
  const [time, setTime] = useState(formattedNote.time);
  const [tags, setTags] = useState(formattedNote.tags);
  const [media, setMedia] = useState<Media[]>(formattedNote.media);
  const [newAudio, setNewAudio] = useState<AudioType[]>(formattedNote.audio);
  const [isPublished, setIsPublished] = useState(formattedNote.published);
  const [creator, setCreator] = useState(formattedNote.creator);
  const [owner, setOwner] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [keyboardOpen, setKeyboard] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLocation, setIsLocation] = useState(false);
  const [isLocationShown, setIsLocationShown] = useState(
    formattedNote.latitude === "0" && formattedNote.longitude === "0"
  );
  const [isLocationIconPressed, setIsLocationIconPressed] = useState(
    formattedNote.latitude === "0" && formattedNote.longitude === "0"
  );
  const [isTime, setIsTime] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const locationRef = useRef({
    latitude: parseFloat(formattedNote.latitude),
    longitude: parseFloat(formattedNote.longitude),
  });

  const scrollViewRef = useRef<ScrollView | null>(null);
  const photoScrollerRef = useRef<{ goBig(index: number): void } | null>(null);
  const { theme } = useTheme();

  const editor = useEditorBridge({
    initialContent: formattedNote.text,
    autofocus: false,
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboard(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboard(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const checkOwner = async () => {
      const userId = await user.getId();
      setOwner(creator === userId);
    };
    checkOwner();
  }, [creator]);

  const callGoBig = (index: number) => {
    if (photoScrollerRef.current) {
      photoScrollerRef.current.goBig(index);
    }
  };

  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return null;
      }
      return await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  const toggleLocationVisibility = async () => {
    if (isLocationShown) {
      locationRef.current = null;
    } else {
      const userLocation = await getLocation();
      if (userLocation) {
        locationRef.current = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
      }
    }
    setIsLocationShown((prev) => !prev);
    setIsLocationIconPressed((prev) => !prev);
  };

  const handleSaveNote = async () => {
    setIsUpdating(true);

    try {
      const userId = await user.getId();
      const textContent = await editor.getHTML();

      const formattedTags = tags.map((tag) => ({
        label: tag.label,
        origin: tag.origin || "user",
      }));

      const editedNote: Note = {
        id: note.id,
        title,
        text: textContent,
        creator: userId,
        media,
        latitude: locationRef.current?.latitude.toString() || "0",
        longitude: locationRef.current?.longitude.toString() || "0",
        audio: newAudio,
        published: isPublished,
        time,
        tags: formattedTags,
      };

      console.log("Formatted Note for API:", editedNote);

      await ApiService.overwriteNote(editedNote);
      onSave(editedNote);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addImageToEditor = (imageUri: string) => {
    const imgTag = `<img src="${imageUri}" style="max-width: 100%; height: auto;" />`;
    editor.commands.setContent(editor.getHTML() + imgTag);
  };

  const addVideoToEditor = async (videoUri: string) => {
    try {
      const thumbnailUri = await getThumbnail(videoUri);
      const videoTag = `
        <video width="320" height="240" controls poster="${thumbnailUri}">
          <source src="${videoUri}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
      editor.commands.setContent(editor.getHTML() + videoTag);
    } catch (error) {
      console.error("Error adding video: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={NotePageStyles().topContainer}>
        <View style={NotePageStyles().topButtonsContainer}>
          <TouchableOpacity
            style={NotePageStyles().topButtons}
            onPress={owner ? handleSaveNote : () => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back-outline"
              size={30}
              color={NotePageStyles().title.color}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Title Field Note"
            style={NotePageStyles().title}
            value={title}
            onChangeText={setTitle}
          />
          {owner && (
            isPublished ? (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={() => setIsPublished(!isPublished)}
              >
                <Ionicons name="share" size={30} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={() => setIsPublished(!isPublished)}
              >
                <Ionicons
                  name="share-outline"
                  size={30}
                  color={NotePageStyles().title.color}
                />
              </TouchableOpacity>
            )
          )}
        </View>
        <View style={NotePageStyles().keyContainer}>
          <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
            <Ionicons
              name="images-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
            <Ionicons
              name="mic-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLocationVisibility}>
            <Ionicons
              name="location-outline"
              size={30}
              color={isLocationIconPressed ? "red" : NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsTime(!isTime)}>
            <Ionicons
              name="time-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
            <Ionicons
              name="pricetag-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: NotePageStyles().container.backgroundColor }}>
          <PhotoScroller
            ref={photoScrollerRef}
            active={viewMedia}
            newMedia={media}
            setNewMedia={setMedia}
            insertImageToEditor={addImageToEditor}
            addVideoToEditor={addVideoToEditor}
          />
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={locationRef.current} setLocation={(loc) => (locationRef.current = loc)} />
          )}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>

        {/* RichText Editor and Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.editorContainer]}>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              ref={scrollViewRef}
            >
              <RichText
                editor={editor}
                placeholder="Write your note here"
                style={{
                  minHeight: 400,
                  backgroundColor: theme.primaryColor,
                  color: theme.text,
                  padding: 10,
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Toolbar for text formatting */}
        <View style={NotePageStyles().toolBar}>
          <Toolbar
            editor={editor}
            style={NotePageStyles().container}
            actions={[
              "bold",
              "italic",
              "underline",
              "bullet_list",
              "blockquote",
              "indent",
              "outdent",
              "close_keyboard",
            ]}
          />
        </View>

        <LoadingModal visible={isUpdating} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
    minHeight: 400,
  },
});

export default EditNoteScreen;
