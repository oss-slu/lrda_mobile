import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PhotoScroller from "../components/photoScroller";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType } from "../models/media_class";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import * as Location from "expo-location";

const user = User.getInstance();

const EditNoteScreen = ({ route, navigation }) => {
  const { note, onSave } = route.params;

  // State management for all note properties
  const [title, setTitle] = useState(note.title || "Untitled");
  const [time, setTime] = useState(new Date(note.time));
  const [tags, setTags] = useState(note.tags || []);
  const [media, setMedia] = useState<Media[]>(note.media || []);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio || []);
  const [isPublished, setIsPublished] = useState(note.published || false);
  const [location, setLocation] = useState({
    latitude: parseFloat(note.latitude) || 0,
    longitude: parseFloat(note.longitude) || 0,
  });
  const [isLocationVisible, setIsLocationVisible] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const { theme } = useTheme();

  const editor = useEditorBridge({
    initialContent: note.text || "",
    avoidIosKeyboard: true,
  });

  const scrollViewRef = useRef(null);

  // Inject custom CSS for images in the editor
  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

  // Fetch the user's current location
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      setIsLocationVisible(true);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Error handling for media and content addition
  const displayErrorInEditor = async (errorMessage) => {
    const currentContent = await editor.getHTML();
    const errorTag = `<p style="color: red; font-weight: bold;">${errorMessage}</p><br />`;
    editor.setContent(currentContent + errorTag);
    editor.focus();
  };

  const insertImageToEditor = async (imageUri) => {
    try {
      const currentContent = await editor.getHTML();
      const imageTag = `<img src="${imageUri}" style="max-width: 200px; max-height: 200px; object-fit: cover;" /><br />`;
      editor.setContent(currentContent + imageTag);
      editor.focus();
    } catch (error) {
      console.error("Error inserting image:", error);
      displayErrorInEditor(`Error inserting image: ${error.message}`);
    }
  };

  const addVideoToEditor = async (videoUri) => {
    try {
      const currentContent = await editor.getHTML();
      const videoLink = `${currentContent}<a href="${videoUri}">${videoUri}</a><br>`;
      editor.setContent(videoLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding video:", error);
      displayErrorInEditor(`Error adding video: ${error.message}`);
    }
  };

  const insertAudioToEditor = async (audioUri) => {
    try {
      const currentContent = await editor.getHTML();
      const audioLink = `${currentContent}<a href="${audioUri}">${audioUri}</a><br>`;
      editor.setContent(audioLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding audio:", error);
      displayErrorInEditor(`Error adding audio: ${error.message}`);
    }
  };

  // Save edited note
  const handleSaveNote = async () => {
    setIsUpdating(true);
    try {
      const userId = await user.getId();
      const textContent = await editor.getHTML();
      const editedNote = {
        id: note.id,
        title,
        text: textContent,
        creator: userId,
        media,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        audio: newAudio,
        published: isPublished,
        time,
        tags,
      };
      await ApiService.overwriteNote(editedNote);
      onSave(editedNote);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={NotePageStyles().topContainer}>
            <View style={NotePageStyles().topButtonsContainer}>
              <TouchableOpacity style={NotePageStyles().topButtons} onPress={handleSaveNote}>
                <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().title.color} />
              </TouchableOpacity>
              <TextInput
                style={NotePageStyles().title}
                placeholder="Title Field Note"
                value={title}
                onChangeText={setTitle}
              />
              <TouchableOpacity style={NotePageStyles().topButtons} onPress={() => setIsPublished(!isPublished)}>
                <Ionicons name={isPublished ? "share" : "share-outline"} size={30} color={NotePageStyles().title.color} />
              </TouchableOpacity>
            </View>
            <View style={NotePageStyles().keyContainer}>
              <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
                <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsLocationVisible(!isLocationVisible)}>
                <Ionicons name="location-outline" size={30} color={isLocationVisible ? "red" : NotePageStyles().saveText.color} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
                <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={NotePageStyles().container}>
            <PhotoScroller active={viewMedia} newMedia={media} setNewMedia={setMedia} insertImageToEditor={insertImageToEditor} addVideoToEditor={addVideoToEditor} />
            {viewAudio && <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} insertAudioToEditor={insertAudioToEditor} />}
            {isTagging && <TagWindow tags={tags} setTags={setTags} />}
            {isLocationVisible && <LocationWindow location={location} setLocation={setLocation} />}
          </View>
          <View style={NotePageStyles().richTextContainer}>
            <RichText
              editor={editor}
              placeholder="Write Content Here..."
              style={[
                NotePageStyles().editor,
                { backgroundColor: Platform.OS === "android" ? "white" : undefined },
              ]}
            />
          </View>
          <View style={NotePageStyles().toolBar}>
            <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
          </View>
        </ScrollView>
        <LoadingModal visible={isUpdating} />
      </KeyboardAvoidingView>
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
