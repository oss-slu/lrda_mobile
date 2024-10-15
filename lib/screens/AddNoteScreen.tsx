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
  Keyboard,
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
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const editor = useEditorBridge({ initialContent: bodyText || "", autofocus: true });
  const { theme } = useTheme();
  const titleTextRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editor?.commands?.focus) {
      const timeout = setTimeout(() => {
        editor.commands.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [editor]);

  const toggleLocationVisibility = async () => {
    if (isLocation) {
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

  const handleShareButtonPress = async () => {
    setIsPublished(!isPublished);
    ToastMessage.show({
      type: 'success',
      text1: isPublished ? 'Note Unpublished' : 'Note Published',
      visibilityTime: 3000,
    });

    await saveNote(); // Save the note when the user shares it
  };

  const saveNote = async () => {
    setIsUpdating(true);  // Show loading indicator during save

    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const finalLocation = userLocation ? userLocation.coords : { latitude: 0, longitude: 0 };

      const newNote = {
        title: titleText || "Untitled",
        text: editor.getHTML(),
        media: newMedia,
        audio: newAudio,
        tags,
        time,
        latitude: finalLocation.latitude.toString(),
        longitude: finalLocation.longitude.toString(),
        published: isPublished,
      };

      await ApiService.writeNewNote(newNote);
      route.params.refreshPage();  // Refresh the parent page if needed
      navigation.goBack();  // Navigate back after saving the note
    } catch (error) {
      console.error("Error saving the note:", error);
    } finally {
      setIsUpdating(false);  // Hide loading indicator after save
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Top Section with Buttons and Title */}
        <View style={NotePageStyles().topContainer}>
          <View style={NotePageStyles().topButtonsContainer}>
            {/* Back Button now triggers saveNote */}
            <TouchableOpacity
              style={NotePageStyles().topButtons}
              onPress={async () => await saveNote()} // Save note on back press
            >
              <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>

            <TextInput
              ref={titleTextRef}
              style={NotePageStyles().title}
              placeholder="Title Field Note"
              placeholderTextColor={NotePageStyles().title.color}
              onChangeText={setTitleText}
              value={titleText}
            />

            <TouchableOpacity
              style={NotePageStyles().topButtons}
              onPress={handleShareButtonPress} // Save note when shared
            >
              <Ionicons
                name={isPublished ? "share" : "share-outline"}
                size={30}
                color={NotePageStyles().saveText.color}
              />
            </TouchableOpacity>
          </View>

          <View style={NotePageStyles().keyContainer}>
            <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
              <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
              <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleLocationVisibility}>
              <Ionicons name="location-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsTime(!isTime)}>
              <Ionicons name="time-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
              <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Media, Audio, Tags, Location, Time Components */}
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={NotePageStyles().richTextContainer}>
            <RichText
              editor={editor}
              placeholder="Write something..."
              style={[NotePageStyles().editor, { backgroundColor: Platform.OS === "android" ? "white" : undefined }]}
            />
          </View>

          <View style={NotePageStyles().toolBar}>
            <Toolbar
              editor={editor}
              style={NotePageStyles().container}
              actions={['bold', 'italic', 'underline', 'bullet_list', 'blockquote', 'indent', 'outdent', 'close_keyboard']}
            />
          </View>
        </KeyboardAvoidingView>

        <LoadingModal visible={isUpdating} />
      </View>
    </SafeAreaView>
  );
};

export default AddNoteScreen;
