import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, Alert } from "react-native";
import ToastMessage from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import PhotoScroller from "../components/photoScroller";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType } from "../models/media_class";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useDispatch } from "react-redux";
import { toogleAddNoteState } from "../../redux/slice/AddNoteStateSlice";

const user = User.getInstance();
const EditNoteScreen = ({ route, navigation }) => {
  const { note, onSave } = route.params;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [title, setTitle] = useState(note.title || "Untitled");
  const time = new Date(note.time);
  const [tags, setTags] = useState(note.tags || []);
  const [media, setMedia] = useState<Media[]>(note.media || []);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio || []);
  const [isPublished, setIsPublished] = useState(note.published || false);
  const [ispublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [location, setLocation] = useState({
    latitude: parseFloat(note.latitude) || 0,
    longitude: parseFloat(note.longitude) || 0,
  });
  const [isTagging, setIsTagging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const editor = useEditorBridge({
    initialContent: note.text || "",
    avoidIosKeyboard: true,
  });
  const { setPublishNote } = useAddNoteContext();

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e?.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleDonePress = () => {
    if (editor?.blur) editor.blur(); // blur the rich-text editor
    Keyboard.dismiss(); // dismiss the native keyboard
  };

  const initialText = useRef(note.text || "");

  useEffect(() => {
    setPublishNote(() => handlePublishPress);
  }, []);

  useEffect(() => {
    if (editor) {
      const combinedCSS = `
        ${customImageCSS}
        body {
          color: ${theme.text};
        }
      `;
      editor.injectCSS(combinedCSS);
    }
  }, [editor, theme.text]);

  const setLocationToZero = () => {
    setLocation({ latitude: 0, longitude: 0 });
  };

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve location.");
      }
    } else {
      setLocationToZero();
    }
  };

  const toggleLocation = () => {
    if (location.latitude === 0 && location.longitude === 0) {
      fetchCurrentLocation();
    } else {
      setLocationToZero();
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const insertImageToEditor = async (imageUri: string) => {
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

  const addVideoToEditor = async (videoUri: string) => {
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

  // Function to display an error message inside the editor
  const displayErrorInEditor = async (errorMessage) => {
    const currentContent = await editor.getHTML();
    const errorTag = `<p style="color: red; font-weight: bold;">${errorMessage}</p><br />`;
    editor.setContent(currentContent + errorTag);
    editor.focus();
  };

  const insertAudioToEditor = async (audioUri: string) => {
    try {
      const currentContent = await editor.getHTML();
      const audioLink = `${currentContent}<a href="${audioUri}">${audioUri}</a><br>`;
      editor.setContent(audioLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding audio:", error);
    }
  };

  const handlePublishPress = async () => {
    console.log("📤 Publish button pressed in EditNoteScreen");

    const latestContent = await editor.getHTML();
    initialText.current = latestContent;

    const titleIsEmpty = !title.trim();
    const bodyIsEmpty = latestContent.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0;

    if (!titleIsEmpty || !bodyIsEmpty || tags.length !== 0 || media.length !== 0 || newAudio.length !== 0) {
      console.log("✅ Valid content found. Proceeding to publish...");

      setIsPublished(true); // Only publish if explicitly pressed
      setIsUpdating(true);

      try {
        const userId = await user.getId();
        const editedNote = {
          id: note.id,
          title,
          text: latestContent,
          creator: userId,
          media,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          audio: newAudio,
          published: true,
          time,
          tags,
        };

        await ApiService.overwriteNote(editedNote);
        onSave(editedNote);
        setIsPublishBtnClicked(true);

        ToastMessage.show({
          type: "success",
          text1: "Note Published",
          visibilityTime: 3000,
        });

        console.log("🧭 Navigating back after publish");
        navigation.goBack();
      } catch (error) {
        console.error("❌ Error publishing note:", error);
      } finally {
        setIsUpdating(false);
        dispatch(toogleAddNoteState());
      }
    } else {
      console.log("⚠️ Empty note — publish skipped.");
    }
  };

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
    } catch (error) {
      console.error("Error updating the note:", error);
    } finally {
      setIsUpdating(false);
      dispatch(toogleAddNoteState());
      setIsPublishBtnClicked(true);
      navigation.goBack();
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (!ispublishBtnClicked) {
        setTimeout(async () => {
          try {
            const textContent = await editor.getHTML();

            const updatedNote = {
              ...note,
              title,
              text: textContent,
              media,
              audio: newAudio,
              tags,
              published: isPublished,
              latitude: location.latitude.toString(),
              longitude: location.longitude.toString(),
              time: new Date(),
            };

            console.log("Auto-saving EditNote on exit...");
            setIsUpdating(true);
            await ApiService.overwriteNote(updatedNote);
            onSave(updatedNote);
          } catch (e) {
            console.warn("Auto-save failed:", e);
          } finally {
            setIsUpdating(false);
            dispatch(toogleAddNoteState());
          }
        }, 300); // allow WebView to flush (note: react native doesnt use a webview - jacob)
      }
    });

    return unsubscribe;
  }, [navigation, title, editor, media, newAudio, tags, isPublished, location]);

  return (
    <View style={{ flex: 1 }} testID="EditNoteScreen">
      <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
        {/* Top bar with back arrow + title input */}
        <View style={[NotePageStyles().topContainer, { backgroundColor: theme.homeColor }]}>
          <View style={NotePageStyles().topButtonsContainer}>
            <TouchableOpacity style={NotePageStyles().topButtons} onPress={handleSaveNote}>
              <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().title.color} />
            </TouchableOpacity>
            <TextInput style={NotePageStyles().title} placeholder="Title Field Note" value={title} onChangeText={setTitle} />
          </View>
          <View style={NotePageStyles().keyContainer}>
            <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
              <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
              <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLocation}>
              <Ionicons
                name="location-outline"
                size={30}
                color={location.latitude === 0 && location.longitude === 0 ? "red" : theme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
              <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Media / Audio / Tagging panels */}
        <View style={NotePageStyles().container}>
          <PhotoScroller
            active={viewMedia}
            newMedia={media}
            setNewMedia={setMedia}
            insertImageToEditor={insertImageToEditor}
            addVideoToEditor={addVideoToEditor}
          />
          {viewAudio && <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} insertAudioToEditor={insertAudioToEditor} />}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
        </View>

        {/* Rich-text editor */}
        <View style={NotePageStyles().richTextContainer}>
          <RichText
            editor={editor}
            style={[
              NotePageStyles().editor,
              {
                backgroundColor: theme.backgroundColor,
                minHeight: 200,
                // paddingBottom: 120,
              },
            ]}
          />
        </View>

        {/* Loading spinner */}
        <LoadingModal visible={isUpdating} />
      </KeyboardAvoidingView>
      <View
        style={[
          styles.toolbar,
          {
            bottom: keyboardVisible ? (Platform.OS === "android" ? keyboardHeight + 20 : keyboardHeight) : 0,
            display: keyboardVisible ? "flex" : "none",
          },
        ]}
        pointerEvents={keyboardVisible ? "auto" : "none"}
      >
        {/* Wrap in a second View to nudge it up to hide the Toolbar border since it doesnt seem like we can style the Toolbar element directly */}
        <View style={styles.toolbarInner}>
          <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
        </View>
        <TouchableOpacity
          testID="doneButton"
          onPress={handleDonePress}
          style={[styles.doneButton, !keyboardVisible && { display: "none" }]}
        >
          <Ionicons name="chevron-down" size={28} color={"#007AFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  toolbar: {
    position: "absolute",
    width: "100%",
    height: 50,
    zIndex: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarInner: {
    height: "105%", // Important to hide default toolbar border
    justifyContent: "center",
    flex: 1,
  },
  doneButton: {
    height: "100%",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#00000000",
    zIndex: 30,
  },
});

export default EditNoteScreen;
