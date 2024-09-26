import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import NotePageStyles from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";

const user = User.getInstance();

const AddNoteScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState<string>("");
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState<boolean>(true);
  const [untitledNumber, setUntitledNumber] = useState<string>("0");
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const editor = useEditorBridge({ initialContent: bodyText || "", autofocus: true });
  const { theme } = useTheme();
  const titleTextRef = useRef<TextInput>(null);

  // Add a guard check before calling editor.commands.focus()
  useEffect(() => {
    if (editor?.commands?.focus) {
      const timeout = setTimeout(() => {
        editor.commands.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [editor]);

  // Toggle Location Visibility Logic
  const toggleLocationVisibility = async () => {
    if (isLocation) {
      // Hide location by resetting values
      setLocation({ latitude: 0, longitude: 0 });
      setIsLocation(false);
    } else {
      try {
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
      }
    }
  };

  const addImageToEditor = (imageUri: string) => {
    const imgTag = `<img src="${imageUri}" style="max-width: 100%; height: auto;" />`;
    editor.commands.setContent(editor.getHTML() + imgTag);
  };

  const addVideoToEditor = async (videoUri: string) => {
    try {
      const thumbnailUri = await getThumbnail(videoUri);
      const videoTag = `
        <video width="320" height="240" controls poster="${thumbnailUri}">
          <source src="${videoUri}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
      editor.commands.setContent(editor.getHTML() + videoTag);
    } catch (error) {
      console.error("Error adding video: ", error);
    }
  };

  const insertAudioToEditor = (audioUri: string) => {
    const audioTag = `<audio controls src="${audioUri}"></audio>`;
    editor.commands.setContent(editor.getHTML() + audioTag);
  };

  const handleShareButtonPress = () => {
    setIsPublished(!isPublished);
    ToastMessage.show({
      type: 'success',
      text1: isPublished ? 'Note Unpublished' : 'Note Published',
      visibilityTime: 3000,
    });
  };

  const saveNoteAsDraft = async () => {
    const draftNote = {
      title: "Draft - " + (titleText.trim() || `Untitled ${untitledNumber}`),
      text: editor.getHTML(),
      media: newMedia,
      audio: newAudio,
      tags,
      time: new Date(),
      published: false,
    };
    try {
      await ApiService.writeNewNote(draftNote);
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const saveNote = async () => {
    setIsSaveButtonEnabled(false);
    try {
      const newNote = {
        title: titleText || `Untitled ${untitledNumber}`,
        text: editor.getHTML(),
        media: newMedia,
        audio: newAudio,
        published: isPublished,
      };

      const response = await ApiService.writeNewNote(newNote);
      const obj = await response.json();
      route.params.refreshPage();
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    } finally {
      setIsSaveButtonEnabled(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Top Section with Buttons and Title */}
      <View style={NotePageStyles().topContainer}>
        <View style={NotePageStyles().topButtonsContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={NotePageStyles().topButtons}
            onPress={async () => {
              const editorContent = await editor.getHTML();

              if (titleText.trim() === "" && editorContent.trim() === "") {
                Alert.alert(
                  "Empty Note",
                  "Would you like to delete the note or save it as a draft?",
                  [
                    {
                      text: "Delete",
                      onPress: () => navigation.goBack(),
                      style: "destructive",
                    },
                    {
                      text: "Save as Draft",
                      onPress: async () => {
                        await saveNoteAsDraft();
                        navigation.goBack();
                      },
                    },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              } else {
                await saveNote();
                navigation.goBack();
              }
            }}
          >
            <Ionicons
              name="arrow-back-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>

          {/* Title Input */}
          <TextInput
            ref={titleTextRef}
            style={NotePageStyles().title}
            placeholder="Title Field Note"
            placeholderTextColor={NotePageStyles().title.color}
            onChangeText={setTitleText}
            value={titleText}
          />

          {/* Share Button */}
          <TouchableOpacity
            style={NotePageStyles().topButtons}
            onPress={handleShareButtonPress}
          >
            <Ionicons
              name={isPublished ? "share" : "share-outline"}
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
        </View>

        {/* Toolbar Icons */}
        <View style={NotePageStyles().keyContainer}>
          <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
            <Ionicons
              name="images-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
            <Ionicons
              name="mic-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLocationVisibility}>
            <Ionicons
              name="location-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsTime(!isTime)}>
            <Ionicons
              name="time-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
            <Ionicons
              name="pricetag-outline"
              size={30}
              color={NotePageStyles().saveText.color}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Display Media, Audio, Tags, Location, Time */}
      <View style={NotePageStyles().container}>
        <PhotoScroller
          active={viewMedia}
          newMedia={newMedia}
          setNewMedia={setNewMedia}
          insertImageToEditor={addImageToEditor}
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

      {/* Rich Text Editor and Toolbar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 60 }} // Enough space for toolbar
          keyboardShouldPersistTaps="handled"
        >
          <RichText
            editor={editor}
            placeholder="Write something..."
            style={[NotePageStyles().editor, { flex: 1, minHeight: 200 }]}
          />
        </ScrollView>

        {/* Toolbar placed at the bottom */}
        <Toolbar
          editor={editor}
          style={NotePageStyles().container}
          actions={['bold', 'italic', 'underline', 'bullet_list', 'blockquote', 'indent', 'outdent']}
        />
      </KeyboardAvoidingView>

      <LoadingModal visible={isUpdating} />
    </SafeAreaView>
  );
};

export default AddNoteScreen;

             
