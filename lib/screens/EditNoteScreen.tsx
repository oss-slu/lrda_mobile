import React, { useState, useCallback, useEffect, useEffectEvent, useRef, useMemo } from "react";
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Alert, Text, Dimensions } from "react-native";
import ToastMessage from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Constants from "expo-constants";
import PhotoScroller from "../components/photoScroller";
import { useAuthStore } from "../stores/authStore";
import AudioContainer from "../components/audio";
import type { Media, AudioType } from "../models/media_class";
import { useUpdateNote } from "../hooks/mutations/useUpdateNote";
import TagWindow from "../components/tagging";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useAddNoteStore } from "../stores/addNoteStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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

const EditNoteScreen = () => {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const navigation = useNavigation();
  const { noteData } = useLocalSearchParams<{ noteData: string }>();
  const note = useMemo(() => {
    try {
      return JSON.parse(noteData || "{}");
    } catch {
      return {};
    }
  }, [noteData]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [title, setTitle] = useState(note.title || "Untitled");
  const [time] = useState(new Date(note.time));
  const [tags, setTags] = useState(note.tags || []);
  const [media, setMedia] = useState<Media[]>(note.media || []);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio || []);
  const [isPublished, setIsPublished] = useState(note.isPublished || false);
  const [ispublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [location, setLocation] = useState({
    latitude: note.latitude || 0,
    longitude: note.longitude || 0,
  });
  const [isTagging, setIsTagging] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const { colors } = useTheme();
  const updateNoteMutation = useUpdateNote();
  const toggleAddNoteState = useAddNoteStore((s) => s.toggleAddNoteState);
  const editor = useEditorBridge({
    initialContent: note.text || "",
    avoidIosKeyboard: true,
  });
  const { setPublishNote } = useAddNoteContext();

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleDonePress = () => {
    if (editor?.blur) editor.blur();
    Keyboard.dismiss();
  };

  const initialText = useRef(note.text || "");

  const onPublish = useEffectEvent(() => handlePublishPress());

  useEffect(() => {
    setPublishNote(() => onPublish);
  }, [setPublishNote]);

  const scrollViewRef = useRef(null);

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

  const setLocationToZero = () => {
    setLocation({ latitude: 0, longitude: 0 });
  };

  const fetchCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
      } catch {
        Alert.alert("Error", "Failed to retrieve location.");
      }
    } else {
      setLocationToZero();
    }
  }, []);

  const toggleLocation = () => {
    if (location.latitude === 0 && location.longitude === 0) {
      fetchCurrentLocation();
    } else {
      setLocationToZero();
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

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

  const displayErrorInEditor = async (errorMessage: string) => {
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
    const latestContent = await editor.getHTML();
    initialText.current = latestContent;

    const titleIsEmpty = !title.trim();
    const bodyIsEmpty = latestContent.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0;

    if (!titleIsEmpty || !bodyIsEmpty || tags.length !== 0 || media.length !== 0 || newAudio.length !== 0) {
      setIsPublished(true);

      try {
        const editedNote = {
          id: note.id,
          title,
          text: latestContent,
          creatorId: authUser?.id,
          media,
          latitude: location.latitude,
          longitude: location.longitude,
          audio: newAudio,
          isPublished: true,
          time,
          tags,
        };

        await updateNoteMutation.mutateAsync(editedNote);
        setIsPublishBtnClicked(true);

        ToastMessage.show({
          type: "success",
          text1: "Note Published",
          visibilityTime: 3000,
        });

        router.back();
      } catch (error) {
        console.error("Error publishing note:", error);
      } finally {
        toggleAddNoteState();
      }
    }
  };

  const handleSaveNote = async () => {
    try {
      const textContent = await editor.getHTML();
      const editedNote = {
        id: note.id,
        title,
        text: textContent,
        creatorId: authUser?.id,
        media,
        latitude: location.latitude,
        longitude: location.longitude,
        audio: newAudio,
        isPublished,
        time,
        tags,
      };
      await updateNoteMutation.mutateAsync(editedNote);
    } catch (error) {
      console.error("Error updating the note:", error);
    } finally {
      toggleAddNoteState();
      setIsPublishBtnClicked(true);
      router.back();
    }
  };

  const onBlur = useEffectEvent(async () => {
    if (!ispublishBtnClicked) {
      try {
        const textContent = await editor.getHTML();

        const updatedNote = {
          ...note,
          title,
          text: textContent,
          media,
          audio: newAudio,
          tags,
          isPublished,
          latitude: location.latitude,
          longitude: location.longitude,
          time: new Date(),
        };

        await updateNoteMutation.mutateAsync(updatedNote);
      } catch (e) {
        console.warn("Auto-save failed:", e);
      } finally {
        toggleAddNoteState();
      }
    }
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setTimeout(onBlur, 300);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View className="flex-1" testID="EditNoteScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        className="flex-1"
      >
        <KeyboardAwareScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="min-h-[140px] bg-accent">
            <View
              className="flex-row items-center justify-between bg-primary px-[5px] text-center"
              style={{ paddingTop: Constants.statusBarHeight, height: height * 0.15 }}
            >
              <TouchableOpacity
                className="z-[99] h-[50px] w-[50px] items-center justify-center rounded-full bg-tertiary"
                onPress={handleSaveNote}
              >
                <Ionicons name="arrow-back-outline" size={30} color="var(--color-foreground)" />
              </TouchableOpacity>
              <TextInput
                className="mr-[5%] h-[45px] w-4/5 rounded-[18px] border border-foreground px-[10px] text-center text-[20px] text-foreground"
                placeholder="Title Field Note"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View className="w-full flex-row items-center justify-between bg-primary px-10 py-[5px]">
              <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
                <Ionicons name="images-outline" size={30} color="var(--color-foreground)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
                <Ionicons name="mic-outline" size={30} color="var(--color-foreground)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleLocation}>
                <Ionicons
                  name="location-outline"
                  size={30}
                  color={location.latitude === 0 && location.longitude === 0 ? "red" : "var(--color-foreground)"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
                <Ionicons name="pricetag-outline" size={30} color="var(--color-foreground)" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-1 w-full bg-tertiary">
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

          <View className="ios:h-full android:flex-1 min-h-[300px] grow pb-[120px]">
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

          {Platform.OS === "ios" && (
            <View className="absolute bottom-[27px] z-10 h-[50px] w-full justify-center px-[10px]" testID="Toolbar">
              <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
            </View>
          )}
          {keyboardVisible && (
            <View className="absolute right-4 z-10" style={{ bottom: 7 }} testID="doneButton">
              <TouchableOpacity onPress={handleDonePress}>
                <Text className="text-right text-[14px] text-blue-500">Done</Text>
              </TouchableOpacity>
            </View>
          )}
          {Platform.OS === "android" && (
            <View className="absolute bottom-[27px] z-10 h-[50px] w-full justify-center px-[10px]" testID="Toolbar">
              <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
            </View>
          )}
        </KeyboardAwareScrollView>

        <LoadingModal visible={updateNoteMutation.isPending} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditNoteScreen;
