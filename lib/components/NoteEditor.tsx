import React from "react";
import { Dimensions, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { RichText, type EditorBridge } from "@10play/tentap-editor";
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
      <TouchableOpacity className="z-[99] h-[50px] w-[50px] items-center justify-center rounded-full bg-tertiary" onPress={onBack}>
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

interface NoteEditorBodyProps {
  editor: EditorBridge;
  testID?: string;
}

export function NoteEditorBody({ editor, testID }: NoteEditorBodyProps) {
  const { colors } = useTheme();
  return (
    <View className="ios:h-full android:flex-1 min-h-[300px] grow pb-[120px]" testID={testID}>
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
  );
}
