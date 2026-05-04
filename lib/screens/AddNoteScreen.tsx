import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import ToastMessage from "react-native-toast-message";
import AudioContainer from "../components/audio";

import PhotoScroller from "../components/photoScroller";
import TagWindow from "../components/tagging";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import NotePageStyles, { customImageCSS } from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Video, ResizeMode } from "expo-av";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { AudioType, Media } from "../models/media_class";
import { createNote } from "../utils/api_calls";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useAddNoteContext } from "../context/AddNoteContext";
import { defaultTextFont } from "../../styles/globalStyles";
import TooltipContent from "../onboarding/TooltipComponent";
import Tooltip from "react-native-walkthrough-tooltip";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

const AddNoteScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ untitledNumber?: string }>();
  const [titleText, setTitleText] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>("<p></p>");
  const [newMedia, setNewMedia] = useState<Media[]>([]);
  const [newAudio, setNewAudio] = useState<AudioType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [viewMedia, setViewMedia] = useState<boolean>(false);
  const [viewAudio, setViewAudio] = useState<boolean>(false);
  const [isTagging, setIsTagging] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationButtonColor, setLocationButtonColor] = useState<string>("#000"); // Default color
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { setPublishNote } = useAddNoteContext();
  const bodyTextRef = useRef(bodyText);
  const tagsRef = useRef(tags);
  const mediaRef = useRef(newMedia);
  const audioRef = useRef(newAudio);
  const titleTxtRef = useRef(titleText);

  const { isAddNoteOpen, toggleAddNoteState } = useAddNoteStore();

  const editor = useEditorBridge({
    initialContent: bodyText || "",
    avoidIosKeyboard: true,
  });

  useEffect(() => {
    titleTxtRef.current = titleText;
  }, [titleText]);

  useEffect(() => {
    bodyTextRef.current = bodyText;
  }, [bodyText]);

  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  useEffect(() => {
    mediaRef.current = newMedia;
  }, [newMedia]);

  useEffect(() => {
    audioRef.current = newAudio;
  }, [newAudio]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setTimeout(async () => {
        if (!isPublished) {
          const latestContent = await editor.getHTML();
          bodyTextRef.current = latestContent;

          const bodyIsEmpty = isBodyEmpty(latestContent);

          if (
            titleTxtRef.current.length !== 0 ||
            !bodyIsEmpty ||
            tagsRef.current.length !== 0 ||
            mediaRef.current.length !== 0 ||
            audioRef.current.length !== 0
          ) {
            await saveNote(false);
          } else {
            toggleAddNoteState();
            router.back();
          }
        }
      }, 300);
    });

    return unsubscribe;
  }, [navigation, editor]);

  const { theme } = useTheme();
  const titleTextRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  useEffect(() => {
    setPublishNote(() => handleShareButtonPress);
  }, [titleText]);

  useEffect(() => {
    if (editor) {
      // Combine custom image CSS and dark mode CSS
      const combinedCSS = `
        ${customImageCSS}
        body {
          color: ${theme.text}; /* Text color for dark mode */
        }
      `;
      editor.injectCSS(combinedCSS); // Inject both styles at once
    }
  }, [editor, theme.text]);

  const isBodyEmpty = (htmlString: string) => {
    // Remove all tags and whitespace
    const textOnly = htmlString.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return textOnly.length === 0;
  };

  useEffect(() => {
    // Listen for keyboard events to show/hide toolbar
    const showKeyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideKeyboardListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    // Save the correct reference to handleShareButtonPress
    setPublishNote(() => handleShareButtonPress);

    return () => {
      showKeyboardListener.remove();
      hideKeyboardListener.remove();
    };
  }, []);

  useEffect(() => {
    if (editor) {
      editor.injectCSS(customImageCSS);
    }
  }, [editor]);

  const setLocationToZero = () => {
    setLocation({ latitude: 0, longitude: 0 });
    setLocationButtonColor("red");
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
        setLocationButtonColor("#000");
      } catch (error) {
        console.error("Error fetching location:", error);
        Alert.alert("Error", "Failed to retrieve location.");
      }
    } else {
      setLocationToZero();
    }
  };

  const toggleLocation = () => {
    if (location && location.latitude === 0 && location.longitude === 0) {
      fetchCurrentLocation();
    } else {
      setLocationToZero();
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

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
    await syncEditorContent();

    const bodyIsEmpty = isBodyEmpty(bodyTextRef.current);

    if (
      titleTxtRef.current.length !== 0 ||
      !bodyIsEmpty ||
      tagsRef.current.length !== 0 ||
      mediaRef.current.length !== 0 ||
      audioRef.current.length !== 0
    ) {
      setIsPublished(!isPublished);
      ToastMessage.show({
        type: "success",
        text1: isPublished ? "Note Unpublished" : "Note Published",
        visibilityTime: 3000,
      });
      await saveNote(true);
    }
  };

  const getTitle = () => {
    const title = titleText.trim() ? titleText.trim() : params.untitledNumber ? `Untitled ${params.untitledNumber}` : "Untitled";
    return title;
  };
  const prepareNoteData = async (publish: boolean) => {
    const userLocation = await Location.getCurrentPositionAsync({});
    const finalLocation = userLocation ? userLocation.coords : { latitude: 0, longitude: 0 };
    const textContent = await editor.getHTML();
    const sanitizedContent = textContent.replace(/<\/?p>/g, "");
    const title = getTitle();
    return {
      title,
      text: sanitizedContent,
      media: newMedia || [],
      audio: newAudio || [],
      tags: tags || [],
      latitude: finalLocation.latitude,
      longitude: finalLocation.longitude,
      isPublished: publish,
      time: new Date().toISOString(),
    };
  };

  const saveNote = async (published: boolean) => {
    const noteData = await prepareNoteData(published);

    setIsUpdating(true);

    try {
      await createNote(noteData);
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error("Error saving the note:", error);
    } finally {
      setIsUpdating(false);
      toggleAddNoteState();
    }
  };

  const handleDonePress = () => {
    editor.blur(); // Close TenTap editor keyboard
    Keyboard.dismiss(); //close keyboard when title is being edited
  };

  const syncEditorContent = async () => {
    const latestContent = await editor.getHTML();
    setBodyText(latestContent);
    bodyTextRef.current = latestContent;
  };

  /* CHECKING IF USER HAS DONE TUTORIAL */
  const [userTutorial, setUserTutorial] = useState<boolean>(false);
  const [mediaTip, setMediaTip] = useState<boolean>(true); // This is the first tip.

  // Update the userTutorial state once the async function resolves.
  useEffect(() => {
    // For the "AddNote" tutorial
    getHasDoneTutorial("AddNote").then((result: boolean) => {
      setUserTutorial(result);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1 }}>
            <Tooltip
              topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight : 0}
              isVisible={mediaTip === true && userTutorial === false}
              showChildInTooltip={true}
              content={
                <TooltipContent
                  message="Upload media to your notes! Hit publish once you are ready."
                  onPressOk={() => {
                    setMediaTip(false);
                    setUserTutorial(true);
                    setTutorialDone("AddNote", true);
                  }}
                  onSkip={() => {
                    setMediaTip(false);
                    setUserTutorial(true);
                    setTutorialDone("AddNote", true);
                  }}
                />
              }
              placement="bottom"
            >
              <View style={[NotePageStyles().topContainer]}>
                <View style={[NotePageStyles().topButtonsContainer, { backgroundColor: theme.homeColor }]}>
                  <TouchableOpacity style={NotePageStyles().topButtons} onPress={() => saveNote(false)}>
                    <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().saveText.color} />
                  </TouchableOpacity>
                  <TextInput
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
                </View>
                <View style={NotePageStyles().keyContainer}>
                  <TouchableOpacity onPress={() => setViewMedia(!viewMedia)} testID="imageButton">
                    <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                    <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleLocation} testID="checklocationpermission">
                    <Ionicons name="location-outline" size={30} color={locationButtonColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
                    <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
                  </TouchableOpacity>
                </View>
              </View>
            </Tooltip>

            <View style={NotePageStyles().container}>
              <PhotoScroller
                active={viewMedia}
                newMedia={newMedia}
                setNewMedia={setNewMedia}
                insertImageToEditor={insertImageToEditor}
                addVideoToEditor={addVideoToEditor}
              />
              {viewAudio && <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} insertAudioToEditor={insertAudioToEditor} />}
              {isTagging && <TagWindow tags={tags} setTags={setTags} />}
            </View>
            <View style={[NotePageStyles().richTextContainer]} testID="TenTapEditor">
              <RichText
                editor={editor}
                style={[
                  NotePageStyles().editor,
                  {
                    backgroundColor: theme.primaryColor,
                    minHeight: 200, // gives initial space to type
                    paddingBottom: 120, // prevents content from being hidden behind keyboard/toolbar
                  },
                ]}
              />
            </View>

            <View style={styles.toolbar} testID="RichEditor">
              <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
            </View>
            {Platform.OS === "ios" && <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />}
          </View>
          {keyboardVisible && (
            <View style={styles.doneButton} testID="doneButton">
              <TouchableOpacity onPress={handleDonePress}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAwareScrollView>
        {/* Video Player Modal */}
        <Modal animationType="slide" transparent={true} visible={isVideoModalVisible} onRequestClose={() => setIsVideoModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {videoUri && <Video source={{ uri: videoUri }} useNativeControls resizeMode={ResizeMode.CONTAIN} style={styles.videoPlayer} />}
              <TouchableOpacity onPress={() => setIsVideoModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <LoadingModal visible={isUpdating} />
      </KeyboardAvoidingView>
    </View>
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
    ...defaultTextFont,
    color: "blue",
    marginTop: 20,
  },
  doneButton: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 5, // Increase padding for better tap area
    zIndex: 10, // Ensures it appears above other elements
    borderColor: "#ddd",
  },
  doneText: {
    ...defaultTextFont,
    color: "blue",
    fontSize: 14,
    padding: 0,
    textAlign: "right",
    marginRight: 25,
  },
  toolbar: {
    position: "absolute", // Keep toolbar at the bottom of the screen
    bottom: 27, // Align toolbar with the bottom edge
    width: "100%", // Full-width toolbar
    justifyContent: "center", // Center items in the toolbar
    paddingHorizontal: 10,
    zIndex: 10, // Ensure it stays above other elements
    ...Platform.select({
      android: {
        height: 70,
      },
      ios: {
        height: 50,
      },
    }),
  },
});
