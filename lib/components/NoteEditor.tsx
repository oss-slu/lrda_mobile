import React from "react";
import { Dimensions, Platform, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { DEFAULT_TOOLBAR_ITEMS, RichText, Toolbar, type EditorBridge } from "@10play/tentap-editor";
import PhotoScroller from "./photoScroller";
import AudioContainer from "./audio";
import TagWindow from "./tagging";
import { useTheme } from "./ThemeProvider";
import type { AudioType, Media } from "../models/media_class";

const { height } = Dimensions.get("window");

interface NoteEditorHeaderProps {
  title: string;
  onChangeTitle: (title: string) => void;
  onBack: () => void;
  onTitleFocus?: () => void;
  /** Background of the header row; differs between the add and edit screens. */
  rowClassName?: string;
}

export function NoteEditorHeader({ title, onChangeTitle, onBack, onTitleFocus, rowClassName = "bg-accent" }: NoteEditorHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-[5px] text-center ${rowClassName}`}
      style={{ paddingTop: Constants.statusBarHeight, height: height * 0.15 }}
    >
      <TouchableOpacity
        testID="note-back-button"
        className="z-[99] h-[50px] w-[50px] items-center justify-center rounded-full bg-tertiary"
        onPress={onBack}
      >
        <Ionicons name="arrow-back-outline" size={30} color="var(--color-foreground)" />
      </TouchableOpacity>
      <TextInput
        className="mr-[5%] h-[45px] w-4/5 rounded-[18px] border border-foreground px-[10px] text-center text-[20px] text-foreground"
        placeholder="Title Field Note"
        placeholderTextColor="var(--color-foreground)"
        onChangeText={onChangeTitle}
        value={title}
        onFocus={onTitleFocus}
      />
    </View>
  );
}

interface NoteEditorActionRowProps {
  onToggleMedia: () => void;
  onToggleAudio: () => void;
  onToggleLocation: () => void;
  onToggleTags: () => void;
  locationOff: boolean;
}

export function NoteEditorActionRow({
  onToggleMedia,
  onToggleAudio,
  onToggleLocation,
  onToggleTags,
  locationOff,
}: NoteEditorActionRowProps) {
  return (
    <View className="w-full flex-row items-center justify-between bg-primary px-10 py-[5px]">
      <TouchableOpacity onPress={onToggleMedia} testID="imageButton">
        <Ionicons name="images-outline" size={30} color="var(--color-foreground)" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleAudio}>
        <Ionicons name="mic-outline" size={30} color="var(--color-foreground)" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleLocation} testID="checklocationpermission">
        <Ionicons name="location-outline" size={30} color={locationOff ? "red" : "var(--color-foreground)"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleTags}>
        <Ionicons name="pricetag-outline" size={30} color="var(--color-foreground)" />
      </TouchableOpacity>
    </View>
  );
}

interface NoteEditorPanelsProps {
  viewMedia: boolean;
  viewAudio: boolean;
  isTagging: boolean;
  media: Media[];
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
  audio: AudioType[];
  setAudio: React.Dispatch<React.SetStateAction<AudioType[]>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  insertImageToEditor: (imageUri: string) => Promise<void>;
  addVideoToEditor: (videoUri: string) => Promise<void>;
  insertAudioToEditor: (audioUri: string) => Promise<void>;
}

export function NoteEditorPanels({
  viewMedia,
  viewAudio,
  isTagging,
  media,
  setMedia,
  audio,
  setAudio,
  tags,
  setTags,
  insertImageToEditor,
  addVideoToEditor,
  insertAudioToEditor,
}: NoteEditorPanelsProps) {
  return (
    <View className="mb-1 w-full bg-tertiary">
      <PhotoScroller
        active={viewMedia}
        newMedia={media}
        setNewMedia={setMedia}
        insertImageToEditor={insertImageToEditor}
        addVideoToEditor={addVideoToEditor}
      />
      {viewAudio && <AudioContainer newAudio={audio} setNewAudio={setAudio} insertAudioToEditor={insertAudioToEditor} />}
      {isTagging && <TagWindow tags={tags} setTags={setTags} />}
    </View>
  );
}

interface NoteEditorToolbarProps {
  editor: EditorBridge;
  keyboardVisible: boolean;
  keyboardHeight: number;
  /** Dismiss the keyboard (the chevron-down button). */
  onDone: () => void;
}

/**
 * Formatting toolbar pinned flush above the keyboard, with a keyboard-dismiss
 * button on the right. Rendered as a sibling of the KeyboardAvoidingView so
 * `bottom: keyboardHeight` is measured from the screen edge.
 */
export function NoteEditorToolbar({ editor, keyboardVisible, keyboardHeight, onDone }: NoteEditorToolbarProps) {
  return (
    <View
      className="absolute left-0 z-20 h-[50px] w-full flex-row items-center overflow-hidden rounded-t-[18px] bg-white"
      style={{
        bottom: keyboardVisible ? (Platform.OS === "android" ? keyboardHeight + 20 : keyboardHeight) : 0,
        display: keyboardVisible ? "flex" : "none",
      }}
      pointerEvents={keyboardVisible ? "auto" : "none"}
      testID="Toolbar"
    >
      {/* 105% height nudges the Toolbar up to clip its built-in top border,
          which cannot be styled directly. */}
      <View className="h-[105%] flex-1 justify-center">
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </View>
      <TouchableOpacity testID="doneButton" onPress={onDone} className="z-30 h-full items-center justify-center px-3">
        <Ionicons name="chevron-down" size={28} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

interface NoteEditorBodyProps {
  editor: EditorBridge;
  testID?: string;
}

export function NoteEditorBody({ editor, testID }: NoteEditorBodyProps) {
  const { colors } = useTheme();
  return (
    <View className="min-h-[300px] flex-1" testID={testID}>
      <RichText
        editor={editor}
        style={{
          flex: 1,
          width: "100%",
          minHeight: 200,
          padding: 10,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}
