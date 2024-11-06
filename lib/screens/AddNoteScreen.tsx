import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Text,
  StyleSheet
} from "react-native";
import { WebViewMessageEvent } from "react-native-webview";
import * as Location from 'expo-location';
import ToastMessage from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";
import { Media, AudioType } from "../models/media_class";
import { getThumbnail } from "../utils/S3_proxy";
import { User } from "../models/user_class";
import ApiService from "../utils/api_calls";
import PhotoScroller from "../components/photoScroller";
import AudioContainer from "../components/audio";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Video } from "expo-av";
import { Link } from "@react-navigation/native";

const user = User.getInstance();

const AddNoteScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState<string>("");
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState<boolean>(true);
  const [bodyText, setBodyText] = useState<string>("");
  const [newMedia, setNewMedia] = useState<Media[]>([]);
  const [newAudio, setNewAudio] = useState<AudioType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [time, setTime] = useState<Date>(new Date());
  const [viewMedia, setViewMedia] = useState<boolean>(false);
  const [viewAudio, setViewAudio] = useState<boolean>(false);
  const [isTagging, setIsTagging] = useState<boolean>(false);
  const [isLocation, setIsLocation] = useState<boolean>(false);
  const [isTime, setIsTime] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const editor = useEditorBridge({
    initialContent: bodyText || "",
    autofocus: true,
    avoidIosKeyboard: true,
  });
  
  const { theme } = useTheme();
  const titleTextRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  useEffect(() => {
    if (editor?.focus) {
      const timeout = setTimeout(() => {
        editor.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

  const toggleLocationVisibility = async () => {
    if (isLocation) {
      setLocation({ latitude: 0, longitude: 0 });
      setIsLocation(false);
    } else {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
          if (requestStatus !== 'granted') {
            Alert.alert("Location permission denied", "Please enable location permissions to use this feature.");
            return;
          }
        }
        const userLocation = await Location.getCurrentPositionAsync({});
        if (userLocation) {
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });
          setIsLocation(true);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to retrieve location. Please try again.");
      }
    }
  };

  const insertImageToEditor = async (imageUri: string) => {
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
    const audioTag = `<audio controls src="${audioUri}"></audio>`;
    editor.setContent(editor.getHTML() + audioTag);
  };

  const handleShareButtonPress = async () => {
    setIsPublished(!isPublished);
    ToastMessage.show({
      type: 'success',
      text1: isPublished ? 'Note Unpublished' : 'Note Published',
      visibilityTime: 3000,
    });
    await saveNote();
  };

  const saveNote = async () => {
    console.log("Back button pressed - saveNote function invoked.");
    setIsUpdating(true);
    setIsSaveButtonEnabled(true);

    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const finalLocation = userLocation ? userLocation.coords : { latitude: 0, longitude: 0 };
      const textContent = await editor.getHTML();
      const uid = await user.getId();

      const newNote = {
        title: titleText || "Untitled",
        text: textContent,
        media: newMedia || [],
        audio: newAudio || [],
        tags: tags || [],
        latitude: finalLocation.latitude.toString(),
        longitude: finalLocation.longitude.toString(),
        published: isPublished,
        time: new Date(time).toISOString(),
        creator: uid,
      };

      const response = await ApiService.writeNewNote(newNote);
      await response.json();
      route.params.refreshPage();
      navigation.goBack();
    } catch (error) {
      console.error("Error saving the note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 150 : 0}
          keyboardOpeningTime={0}
        >
          <View style={{ flex: 1 }}>
            <View style={NotePageStyles().topContainer}>
              <View style={NotePageStyles().topButtonsContainer}>
                <TouchableOpacity style={NotePageStyles().topButtons} onPress={saveNote}>
                  <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TextInput
                  ref={titleTextRef}
                  style={NotePageStyles().title}
                  placeholder="Title Field Note"
                  placeholderTextColor={NotePageStyles().title.color}
                  onChangeText={setTitleText}
                  value={titleText}
                />
                <TouchableOpacity style={NotePageStyles().topButtons} onPress={handleShareButtonPress}>
                  <Ionicons
                    name={isPublished ? "share" : "share-outline"}
                    size={30}
                    color={NotePageStyles().saveText.color}
                  />
                </TouchableOpacity>
              </View>
              <View style={NotePageStyles().keyContainer}>
                <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
                  <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                  <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleLocationVisibility}>
                  <Ionicons name="location-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsTime(!isTime)}>
                  <Ionicons name="time-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
                  <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={NotePageStyles().container}>
              <PhotoScroller
                active={viewMedia}
                newMedia={newMedia}
                setNewMedia={setNewMedia}
                insertImageToEditor={insertImageToEditor}
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
              {isLocation && <LocationWindow location={location} setLocation={setLocation} />}
              {isTime && <TimeWindow time={time} setTime={setTime} />}
            </View>
            <View style={NotePageStyles().richTextContainer}>
              <RichText
                editor={editor}
                placeholder="Write Content Here..."
                style={[
                  NotePageStyles().editor,
                  { backgroundColor: Platform.OS === "android" ? "white" : undefined },
                ]}
                onChange={handleEditorLinkClick} // Listen for content changes to detect link clicks
              />
            </View>
            <View style={NotePageStyles().toolBar}>
              <Toolbar
                editor={editor}
                style={NotePageStyles().container}
                actions={['bold', 'italic', 'underline', 'bullet_list', 'blockquote', 'indent', 'outdent', 'close_keyboard']}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
          {/* Video Player Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isVideoModalVisible}
          onRequestClose={() => setIsVideoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {videoUri && (
                <Video
                  source={{ uri: videoUri }}
                  useNativeControls
                  resizeMode="contain"
                  style={styles.videoPlayer}
                />
              )}
              <TouchableOpacity onPress={() => setIsVideoModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <LoadingModal visible={isUpdating} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddNoteScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: 200,
  },
  closeButton: {
    color: "blue",
    marginTop: 20,
  },
});