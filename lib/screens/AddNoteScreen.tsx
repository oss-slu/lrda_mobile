import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import { View, TouchableOpacity, Platform, KeyboardAvoidingView, Modal, ScrollView, Text, StatusBar } from "react-native";
import ToastMessage from "react-native-toast-message";

import { DEFAULT_TOOLBAR_ITEMS, Toolbar } from "@10play/tentap-editor";
import LoadingModal from "../components/LoadingModal";
import { NoteEditorHeader, NoteEditorActionRow, NoteEditorPanels, NoteEditorBody } from "../components/NoteEditor";
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

  const hasNoteContent = () =>
    titleTxtRef.current.length !== 0 ||
    !isBodyEmpty(bodyTextRef.current) ||
    tagsRef.current.length !== 0 ||
    mediaRef.current.length !== 0 ||
    audioRef.current.length !== 0;

  // Single exit path: leaving the screen (back button or tab switch) fires this
  // blur handler, which saves only when the note has content — otherwise the
  // draft is discarded so backing out doesn't accumulate empty "Untitled" notes.
  const onBlur = useEffectEvent(async () => {
    if (!isPublishedRef.current) {
      bodyTextRef.current = await editor.getHTML();

      if (hasNoteContent()) {
        await saveNote(false, false);
      } else {
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

  const onPublish = useEffectEvent(() => handleShareButtonPress());

  useEffect(() => {
    setPublishNote(() => onPublish);
  }, [setPublishNote]);

  const handleShareButtonPress = async () => {
    await syncEditorContent();

    if (hasNoteContent()) {
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

  const saveNote = async (published: boolean, navigateBack: boolean = true) => {
    const noteData = await prepareNoteData(published);

    try {
      await createNoteMutation.mutateAsync(noteData);
      if (navigateBack && router.canGoBack()) {
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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
                  onBack={() => router.back()}
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
        </ScrollView>
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
