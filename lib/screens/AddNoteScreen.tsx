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
  StatusBar,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import ToastMessage from "react-native-toast-message";
import AudioContainer from "../components/audio";
import Constants from "expo-constants";

import PhotoScroller from "../components/photoScroller";
import TagWindow from "../components/tagging";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Video, ResizeMode } from "expo-av";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import type { AudioType, Media } from "../models/media_class";
import { createNote } from "../utils/api_calls";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useAddNoteContext } from "../context/AddNoteContext";
import TooltipContent from "../onboarding/TooltipComponent";
import Tooltip from "react-native-walkthrough-tooltip";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

const customImageCSS = `
  .ProseMirror img {
    max-width: 200px !important;
    max-height: 200px !important;
    object-fit: cover !important;
    display: inline-block;
  }
`;

const { height } = Dimensions.get("window");

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
  const [locationButtonColor, setLocationButtonColor] = useState<string>("#000");
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
  const isPublishedRef = useRef(isPublished);

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
    isPublishedRef.current = isPublished;
  }, [isPublished]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setTimeout(async () => {
        if (!isPublishedRef.current) {
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

  const { colors } = useTheme();
  const titleTextRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  useEffect(() => {
    setPublishNote(() => handleShareButtonPress);
  }, [titleText]);

  useEffect(() => {
    if (editor) {
      const combinedCSS = `
        ${customImageCSS}
        body {
          color: ${colors.foreground};
        }
      `;
      editor.injectCSS(combinedCSS);
    }
  }, [editor, colors.foreground]);

  const isBodyEmpty = (htmlString: string) => {
    const textOnly = htmlString.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return textOnly.length === 0;
  };

  useEffect(() => {
    const showKeyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideKeyboardListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

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

  const displayErrorInEditor = async (errorMessage: string) => {
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
      displayErrorInEditor(`Error inserting image: ${error instanceof Error ? error.message : String(error)}`);
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
      displayErrorInEditor(`Error adding video: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const insertAudioToEditor = async (audioUri: string) => {
    try {
      const currentContent = await editor.getHTML();
      const audioLink = `${currentContent}<a href="${audioUri}">${audioUri}</a><br>`;
      editor.setContent(audioLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding audio:", error);
      displayErrorInEditor(`Error adding audio: ${error instanceof Error ? error.message : String(error)}`);
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
    const finalLocation = location ?? { latitude: 0, longitude: 0 };
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
    editor.blur();
    Keyboard.dismiss();
  };

  const syncEditorContent = async () => {
    const latestContent = await editor.getHTML();
    setBodyText(latestContent);
    bodyTextRef.current = latestContent;
  };

  const [userTutorial, setUserTutorial] = useState<boolean>(false);
  const [mediaTip, setMediaTip] = useState<boolean>(true);

  useEffect(() => {
    getHasDoneTutorial("AddNote").then((result: boolean) => {
      setUserTutorial(result);
    });
  }, []);

  return (
    <View className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1">
            <Tooltip
              topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
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
              <View className="min-h-[140px]">
                <View
                  className="flex-row items-center justify-between bg-accent px-[5px] text-center"
                  style={{ paddingTop: Constants.statusBarHeight, height: height * 0.15 }}
                >
                  <TouchableOpacity className="z-[99] h-[50px] w-[50px] items-center justify-center rounded-full bg-tertiary" onPress={() => saveNote(false)}>
                    <Ionicons name="arrow-back-outline" size={30} color="var(--color-foreground)" />
                  </TouchableOpacity>
                  <TextInput
                    className="mr-[5%] h-[45px] w-4/5 rounded-[18px] border border-foreground px-[10px] text-center text-[20px] text-foreground"
                    placeholder="Title Field Note"
                    placeholderTextColor="var(--color-foreground)"
                    onChangeText={setTitleText}
                    value={titleText}
                    onFocus={() => {
                      if (editor?.blur) {
                        editor.blur();
                      }
                    }}
                  />
                </View>
                <View className="w-full flex-row items-center justify-between bg-primary px-10 py-[5px]">
                  <TouchableOpacity onPress={() => setViewMedia(!viewMedia)} testID="imageButton">
                    <Ionicons name="images-outline" size={30} color="var(--color-foreground)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                    <Ionicons name="mic-outline" size={30} color="var(--color-foreground)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleLocation} testID="checklocationpermission">
                    <Ionicons name="location-outline" size={30} color={locationButtonColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
                    <Ionicons name="pricetag-outline" size={30} color="var(--color-foreground)" />
                  </TouchableOpacity>
                </View>
              </View>
            </Tooltip>

            <View className="mb-1 w-full bg-tertiary">
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
            <View className="min-h-[300px] grow pb-[120px] ios:h-full android:flex-1" testID="TenTapEditor">
              <RichText
                editor={editor}
                style={{
                  flex: 1,
                  width: "100%",
                  minHeight: 200,
                  paddingBottom: 120,
                  padding: 10,
                  marginBottom: 4,
                  backgroundColor: colors.primary,
                }}
              />
            </View>

            <View className="absolute bottom-[27px] z-10 w-full justify-center px-[10px] ios:h-[50px] android:h-[70px]" testID="RichEditor">
              <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
            </View>
            {Platform.OS === "ios" && <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />}
          </View>
          {keyboardVisible && (
            <View className="absolute bottom-0 w-full border-[#ddd] bg-white py-[5px] z-10" testID="doneButton">
              <TouchableOpacity onPress={handleDonePress}>
                <Text className="font-inter mr-[25px] p-0 text-right text-[14px] text-blue-500">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAwareScrollView>
        <Modal animationType="slide" transparent={true} visible={isVideoModalVisible} onRequestClose={() => setIsVideoModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-[90%] items-center rounded-[10px] bg-white p-5">
              {videoUri && <Video source={{ uri: videoUri }} useNativeControls resizeMode={ResizeMode.CONTAIN} style={{ width: "100%", height: 200 }} />}
              <TouchableOpacity onPress={() => setIsVideoModalVisible(false)}>
                <Text className="font-inter mt-5 text-blue-500">Close</Text>
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
