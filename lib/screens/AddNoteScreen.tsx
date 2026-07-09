import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import { View, TouchableOpacity, Platform, KeyboardAvoidingView, Modal, Text, StatusBar } from "react-native";
import ToastMessage from "react-native-toast-message";

import { DEFAULT_TOOLBAR_ITEMS, Toolbar } from "@10play/tentap-editor";
import LoadingModal from "../components/LoadingModal";
import { NoteEditorHeader, NoteEditorActionRow, NoteEditorPanels, NoteEditorBody } from "../components/NoteEditor";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VideoView, useVideoPlayer } from "expo-video";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import type { AudioType, Media } from "../models/media_class";
import { useCreateNote } from "../hooks/mutations/useCreateNote";
import { useNoteLocation } from "../hooks/useNoteLocation";
import { useNoteEditor, useKeyboardVisible, isBodyEmpty } from "../hooks/useNoteEditor";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useAddNoteContext } from "../context/AddNoteContext";
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
  const [isVideoModalVisible, setIsVideoModalVisible] = useState<boolean>(false);
  const [videoUri] = useState<string | null>(null);
  const videoPlayer = useVideoPlayer(videoUri);
  const { location, isLocationOff, toggleLocation } = useNoteLocation();
  const keyboardVisible = useKeyboardVisible();
  const { setPublishNote } = useAddNoteContext();
  const bodyTextRef = useRef(bodyText);
  const tagsRef = useRef(tags);
  const mediaRef = useRef(newMedia);
  const audioRef = useRef(newAudio);
  const titleTxtRef = useRef(titleText);
  const isPublishedRef = useRef(isPublished);

  const createNoteMutation = useCreateNote();
  const { toggleAddNoteState } = useAddNoteStore();

  const { editor, insertImageToEditor, addVideoToEditor, insertAudioToEditor, handleDonePress } = useNoteEditor(bodyText || "");

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

  const onBlur = useEffectEvent(async () => {
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
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setTimeout(onBlur, 300);
    });

    return unsubscribe;
  }, [navigation]);

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const onPublish = useEffectEvent(() => handleShareButtonPress());

  useEffect(() => {
    setPublishNote(() => onPublish);
  }, [setPublishNote]);

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

    try {
      await createNoteMutation.mutateAsync(noteData);
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error("Error saving the note:", error);
    } finally {
      toggleAddNoteState();
    }
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
                <NoteEditorHeader
                  title={titleText}
                  onChangeTitle={setTitleText}
                  onBack={() => saveNote(false)}
                  onTitleFocus={() => {
                    if (editor?.blur) {
                      editor.blur();
                    }
                  }}
                />
                <NoteEditorActionRow
                  onToggleMedia={() => setViewMedia(!viewMedia)}
                  onToggleAudio={() => setViewAudio(!viewAudio)}
                  onToggleLocation={toggleLocation}
                  onToggleTags={() => setIsTagging(!isTagging)}
                  locationOff={isLocationOff}
                />
              </View>
            </Tooltip>

            <NoteEditorPanels
              viewMedia={viewMedia}
              viewAudio={viewAudio}
              isTagging={isTagging}
              media={newMedia}
              setMedia={setNewMedia}
              audio={newAudio}
              setAudio={setNewAudio}
              tags={tags}
              setTags={setTags}
              insertImageToEditor={insertImageToEditor}
              addVideoToEditor={addVideoToEditor}
              insertAudioToEditor={insertAudioToEditor}
            />
            <NoteEditorBody editor={editor} testID="TenTapEditor" />

            <View className="ios:h-[50px] android:h-[70px] absolute bottom-[27px] z-10 w-full justify-center px-[10px]" testID="RichEditor">
              <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
            </View>
            {Platform.OS === "ios" && <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />}
          </View>
          {keyboardVisible && (
            <View className="absolute bottom-0 z-10 w-full border-[#ddd] bg-white py-[5px]" testID="doneButton">
              <TouchableOpacity onPress={handleDonePress}>
                <Text className="mr-[25px] p-0 text-right font-inter text-[14px] text-blue-500">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAwareScrollView>
        <Modal animationType="slide" transparent={true} visible={isVideoModalVisible} onRequestClose={() => setIsVideoModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-[90%] items-center rounded-[10px] bg-white p-5">
              {videoUri && <VideoView player={videoPlayer} nativeControls contentFit="contain" style={{ width: "100%", height: 200 }} />}
              <TouchableOpacity onPress={() => setIsVideoModalVisible(false)}>
                <Text className="mt-5 font-inter text-blue-500">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <LoadingModal visible={createNoteMutation.isPending} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddNoteScreen;
