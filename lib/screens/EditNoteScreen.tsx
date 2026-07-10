import React, { useState, useEffect, useEffectEvent, useRef, useMemo } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import ToastMessage from "react-native-toast-message";
import { useAuthStore } from "../stores/authStore";
import type { Media, AudioType } from "../models/media_class";
import { useUpdateNote } from "../hooks/mutations/useUpdateNote";
import { useNoteLocation } from "../hooks/useNoteLocation";
import { useNoteEditor, useKeyboardVisible } from "../hooks/useNoteEditor";
import LoadingModal from "../components/LoadingModal";
import { NoteEditorHeader, NoteEditorActionRow, NoteEditorPanels, NoteEditorBody, NoteEditorToolbar } from "../components/NoteEditor";
import { useAddNoteContext } from "../context/AddNoteContext";
import { useAddNoteStore } from "../stores/addNoteStore";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

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
  const { keyboardVisible, keyboardHeight } = useKeyboardVisible();

  const [title, setTitle] = useState(note.title || "Untitled");
  const [time] = useState(new Date(note.time));
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [media, setMedia] = useState<Media[]>(note.media || []);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio || []);
  const [isPublished, setIsPublished] = useState(note.isPublished || false);
  const [ispublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const { location, isLocationOff, toggleLocation } = useNoteLocation({
    latitude: note.latitude || 0,
    longitude: note.longitude || 0,
  });
  const [isTagging, setIsTagging] = useState(false);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const updateNoteMutation = useUpdateNote();
  const toggleAddNoteState = useAddNoteStore((s) => s.toggleAddNoteState);
  const { editor, insertImageToEditor, addVideoToEditor, insertAudioToEditor, handleDonePress } = useNoteEditor(note.text || "");
  const { setPublishNote } = useAddNoteContext();

  const initialText = useRef(note.text || "");

  const onPublish = useEffectEvent(() => handlePublishPress());

  useEffect(() => {
    setPublishNote(() => onPublish);
  }, [setPublishNote]);

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
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
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
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
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
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="min-h-[140px] bg-accent">
            <NoteEditorHeader title={title} onChangeTitle={setTitle} onBack={handleSaveNote} rowClassName="bg-primary" />
            <NoteEditorActionRow
              onToggleMedia={() => setViewMedia(!viewMedia)}
              onToggleAudio={() => setViewAudio(!viewAudio)}
              onToggleLocation={toggleLocation}
              onToggleTags={() => setIsTagging(!isTagging)}
              locationOff={isLocationOff}
            />
          </View>

          <NoteEditorPanels
            viewMedia={viewMedia}
            viewAudio={viewAudio}
            isTagging={isTagging}
            media={media}
            setMedia={setMedia}
            audio={newAudio}
            setAudio={setNewAudio}
            tags={tags}
            setTags={setTags}
            insertImageToEditor={insertImageToEditor}
            addVideoToEditor={addVideoToEditor}
            insertAudioToEditor={insertAudioToEditor}
          />

          <NoteEditorBody editor={editor} />
        </ScrollView>

        <LoadingModal visible={updateNoteMutation.isPending} />
      </KeyboardAvoidingView>

      <NoteEditorToolbar editor={editor} keyboardVisible={keyboardVisible} keyboardHeight={keyboardHeight} onDone={handleDonePress} />
    </View>
  );
};

export default EditNoteScreen;
