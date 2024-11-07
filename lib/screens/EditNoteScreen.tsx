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
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
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
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
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
    avoidIosKeyboard:true
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

  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

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

  const addImageToEditor = async (imageUri: string) => {
    if (editor && editor.setContent) {
      console.log("Inserting image with URI at cursor:", imageUri);
      try {
        const currentContent = await editor.getHTML();
        const imageTag = `<img src="${imageUri}" style="max-width: 200px; max-height: 200px; object-fit: cover;" /><br />`;
        const newContent = currentContent + imageTag;
        editor.setContent(newContent);
        editor.focus();


      } catch (error) {
        console.error("Error retrieving editor content:", error);
      }
    } else {
      console.error("Editor or setContent method is not available.");
    }
  };

  const addVideoToEditor = (videoUri: string) => {
    if (editor?.setLink) {
      const linkWithSpacing = `${videoUri}<br><br>`; // Add line breaks after the URL for spacing
      editor.setContent(linkWithSpacing); // Insert URL with extra spacing
      editor.setLink({ href: videoUri}); // Set URL as clickable link, if possible
    } else {
      console.error("Editor instance is not available.");
    }
  };
  


  // Function to detect and handle link clicks to open the video player modal
  const handleEditorLinkClick = async () => {
    const content = await editor.getHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const links = doc.querySelectorAll("a");

    links.forEach((link) => {
      const url = link.getAttribute("href");
      if (url) {
        link.addEventListener("click", (event) => {
          event.preventDefault(); // Prevents navigation
          setVideoUri(url); // Set URL to open in the video player modal
          setIsVideoModalVisible(true); // Open the modal
        });
      }
    });
  };

  

  const insertAudioToEditor = (audioUri: string) => {
    if (editor?.setLink) {
      const linkWithSpacing = `${audioUri}<br><br>`; // Add line breaks after the URL for spacing
      editor.setContent(linkWithSpacing); // Insert URL with extra spacing
      editor.setLink({ href: audioUri}); // Set URL as clickable link, if possible
    } else {
      console.error("Editor instance is not available.");
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
                <AudioContainer
                  newAudio={newAudio}
                  setNewAudio={setNewAudio}
                  insertAudioToEditor={insertAudioToEditor}
                />
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
                placeholder="Write Content Here..."
                style={[
                  NotePageStyles().editor,
                  { backgroundColor: Platform.OS === "android" ? "white" : undefined },
                ]}
                onChange={handleEditorLinkClick} // Listen for content changes to detect link clicks
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
