import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
  StyleSheet,
} from "react-native";
import { WebViewMessageEvent } from "react-native-webview";
import * as Location from 'expo-location';
import ToastMessage from 'react-native-toast-message';
import AudioContainer from "../components/audio";
import LocationWindow from "../components/location";
import TagWindow from "../components/tagging";

import TimeWindow from "../components/time";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Video } from "expo-av";
import { Link } from "@react-navigation/native";
import { User } from "../models/user_class";
import { AudioType, Media } from "../models/media_class";
import PhotoScroller from "../components/photoScroller";

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
  const [locationButtonColor, setLocationButtonColor] = useState<string>("#000"); // Default color
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const editor = useEditorBridge({
    initialContent: bodyText || "",
    avoidIosKeyboard: true,
  });
  
  const { theme } = useTheme();
  const titleTextRef = useRef<TextInput>(null);

  useEffect(()=>{
        // Listen for keyboard events to show/hide toolbar
        const showKeyboardListener = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        });
        const hideKeyboardListener = Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        });
        return () => {
          showKeyboardListener.remove();
          hideKeyboardListener.remove();
        };
      }, []);
    
  
      const customToolbarItems = [
        ...DEFAULT_TOOLBAR_ITEMS,
        {
          icon: () => <Ionicons name="close" size={24} color={theme.text} />, // Close keyboard icon
          onPress: () => Keyboard.dismiss(), // Dismiss the keyboard when tapped
          id: 'closeKeyboard', // Unique ID for this toolbar item
        },
      ];

  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

  const setLocationToZero = () => {
    setLocation({ latitude: 0, longitude: 0 });
    setLocationButtonColor("red");
    console.log("Location set to (0, 0) due to permission denial or manual setting.");
  };

  const fetchCurrentLocation = async () => {
    console.log("Requesting location permission...");
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      console.log("Location permission granted. Fetching current location...");
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        console.log("User location fetched:", userLocation.coords);
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
        setLocationButtonColor("#000"); // Reset icon color to default
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to retrieve location.");
      }
    } else {
      console.log("Location permission denied. Setting location to (0, 0).");
      setLocationToZero();
    }
  };

  const toggleLocation = () => {
    if (location && location.latitude === 0 && location.longitude === 0) {
      console.log("Re-fetching current location...");
      fetchCurrentLocation();
    } else {
      setLocationToZero();
    }
  };

  // Automatically check location on component mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);
  // Toggle location to (0, 0) when the location button is pressed
  const toggleLocationToZero = () => {
    setLocationToZero();
  };

    // Function to display an error message inside the editor
    const displayErrorInEditor = async (errorMessage) => {
      const currentContent = await editor.getHTML();
      const errorTag = `<p style="color: red; font-weight: bold;">${errorMessage}</p><br />`;
      editor.setContent(currentContent + errorTag);
      editor.focus();
    };

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
    

  
    // Function to add audio
    const insertAudioToEditor = async (audioUri: string) => {
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
        time: new Date().toISOString(), // Automatically grabs current time
        creator: uid,
      };

      await ApiService.writeNewNote(newNote);
      route.params.refreshPage();  // Refresh the parent page if needed
      navigation.goBack();  // Navigate back after saving the note
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
          extraScrollHeight={Platform.OS === 'ios' ? 80 : 0}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled" 
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
                  onFocus={() => {
                    // Remove focus from the editor when the title is being edited
                    if (editor?.blur) {
                      editor.blur();
                    }
                  }}
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
                <TouchableOpacity onPress={() => setViewMedia(!viewMedia)} testID="imageButton">
                  <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                  <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleLocation}testID="checklocationpermission">
                <Ionicons name="location-outline" size={30} color={locationButtonColor} />
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
              {isLocation && <LocationWindow location={location} setLocation={setLocation}/>}
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
              />
            </View>
            <View style={NotePageStyles().toolbar}testID="RichEditor">
            <Toolbar
            editor={editor}
            style={NotePageStyles().container}
            actions={['bold', 'italic', 'underline', 'bullet_list', 'blockquote', 'indent', 'outdent', 'close_keyboard' ]}
          />
        </View>


      </KeyboardAvoidingView>

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