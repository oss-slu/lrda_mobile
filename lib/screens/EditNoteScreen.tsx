import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { getThumbnail } from "../utils/S3_proxy";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType } from "../models/media_class";
import { EditNoteScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor"; // Correct editor import
import NotePageStyles from "../../styles/pages/NoteStyles";
import ToastMessage from "react-native-toast-message";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";
import * as Location from "expo-location";

const user = User.getInstance();

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({
  route,
  navigation,
}) => {
  const { note, onSave } = route.params;
  const [title, setTitle] = useState(note.title);
  const [time, setTime] = useState(note.time);
  const [tags, setTags] = useState(note.tags);
  const [media, setMedia] = useState<Media[]>(note.media);
  const [newAudio, setNewAudio] = useState<AudioType[]>(note.audio);
  const [isPublished, setIsPublished] = useState(note.published);
  const [creator, setCreator] = useState(note.creator);
  const [owner, setOwner] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [keyboardOpen, setKeyboard] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLocation, setIsLocation] = useState(false);
  let [isLocationShown, setIsLocationShown] = useState(
    note.latitude === "0" && note.longitude === "0"
  );
  let [isLocationIconPressed, setIsLocationIconPressed] = useState(
    note.latitude === "0" && note.longitude === "0"
  );
  const { height, width } = Dimensions.get("window");
  const { theme } = useTheme();
  const [isTime, setIsTime] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  let [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    note.latitude && note.longitude
      ? {
          latitude: parseFloat(note.latitude),
          longitude: parseFloat(note.longitude),
        }
      : null
  );

  // Rich text editor setup
  const editor = useEditorBridge({
    initialContent: note.text || "", // Set initial content from the note
    autofocus: false, // Prevent autofocus to avoid conflicts
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboard(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboard(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const checkOwner = async () => {
      setOwner(creator === (await user.getId()));
    };
    checkOwner();
  }, [creator]);

  const handleScroll = (position) => {
    if (keyboardOpen && scrollViewRef.current) {
      const viewportHeight = height - keyboardHeight;
      const cursorRelativePosition = position.relativeY;
      const spaceBelowCursor = viewportHeight - cursorRelativePosition;

      if (spaceBelowCursor < keyboardHeight) {
        scrollViewRef.current.scrollTo({
          y: position.absoluteY - spaceBelowCursor + keyboardHeight,
          animated: true,
        });
      }
    }
  };

  const [latitude, setLatitude] = useState(
    location?.latitude?.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    location?.longitude?.toString() || ""
  );

  const photoScrollerRef = useRef<{ goBig(index: number): void } | null>(null);

  const callGoBig = (index: number) => {
    if (photoScrollerRef.current) {
      photoScrollerRef.current.goBig(index);
    }
  };

  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return null;
      }
      return await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  const handleShareButtonPress = () => {
    setIsPublished(!isPublished); // Toggle the share status
    ToastMessage.show({
      type: "success",
      text1: "Note Published",
      visibilityTime: 3000, // 3 seconds
    });
  };

  const addImageToEditor = (imageUri: string) => {
    const imgTag = `<img src="${imageUri}" style="max-width: 100%; height: auto;" />`;
    editor.commands.setContent(editor.getHTML() + imgTag); // Adding image to the editor content
  };

  const addVideoToEditor = async (videoUri: string) => {
    try {
      const thumbnailUri = await getThumbnail(videoUri);
      const videoTag = `
        <video width="320" height="240" controls poster="${thumbnailUri}">
          <source src="${videoUri}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
      editor.commands.setContent(editor.getHTML() + videoTag); // Adding video to the editor content
    } catch (error) {
      console.error("Error adding video: ", error);
    }
  };

  const toggleLocationVisibility = async () => {
    if (isLocationShown) {
      setLocation({
        latitude: 0,
        longitude: 0,
      });
      setLatitude("0");
      setLongitude("0");
    } else {
      try {
        let userLocation = await getLocation();

        if (
          userLocation?.coords?.latitude !== undefined &&
          userLocation?.coords?.longitude !== undefined
        ) {
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });

          setLatitude(userLocation.coords.latitude.toString());
          setLongitude(userLocation.coords.longitude.toString());
        } else {
          console.log("Location data is not available.");
        }
      } catch (error) {
        console.error("Error setting location:", error);
      }
    }
    setIsLocationShown((prev) => !prev);
    setIsLocationIconPressed((prev) => !prev);
  };

  const handleSaveNote = async () => {
    setIsUpdating(true);

    try {
      let userLocation = await getLocation();
      const finalLatitude = !isLocationShown
        ? userLocation?.coords.latitude.toString() || ""
        : "0";
      const finalLongitude = !isLocationShown
        ? userLocation?.coords.longitude.toString() || ""
        : "0";

      const editedNote: Note = {
        id: note.id,
        title: title,
        text: editor.getHTML(), // Getting the latest content from the editor
        creator: (await user.getId()) || "",
        media,
        latitude: finalLatitude,
        longitude: finalLongitude,
        audio: newAudio,
        published: isPublished,
        time: time,
        tags: tags,
      };

      await ApiService.overwriteNote(editedNote);

      onSave(editedNote);

      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={NotePageStyles().topContainer}>
        <View style={NotePageStyles().topButtonsContainer}>
          <TouchableOpacity
            style={NotePageStyles().topButtons}
            onPress={owner ? handleSaveNote : () => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back-outline"
              size={30}
              color={NotePageStyles().title.color}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Title Field Note"
            style={NotePageStyles().title}
            value={title}
            onChangeText={setTitle}
          />
          {owner && (
            isPublished ? (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={() => setIsPublished(!isPublished)}
              >
                <Ionicons name="share" size={30} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={handleShareButtonPress}
              >
                <Ionicons
                  name="share-outline"
                  size={30}
                  color={NotePageStyles().title.color}
                />
              </TouchableOpacity>
            )
          )}
        </View>
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
          <TouchableOpacity onPress={() => toggleLocationVisibility()}>
            <Ionicons
              name="location-outline"
              size={30}
              color={isLocationIconPressed ? "red" : NotePageStyles().saveText.color}
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
        <View style={{ backgroundColor: NotePageStyles().container.backgroundColor }}>
          <PhotoScroller
            ref={photoScrollerRef}
            active={viewMedia}
            newMedia={media}
            setNewMedia={setMedia}
            insertImageToEditor={addImageToEditor}
            addVideoToEditor={addVideoToEditor}
          />
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={location} setLocation={setLocation} />
          )}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>

        {/* RichText Editor and Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.editorContainer]}>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              ref={scrollViewRef}
            >
              <RichText
                editor={editor}
                placeholder="Write your note here"
                style={{
                  minHeight: 400, // Ensure the editor has enough space to display
                  backgroundColor: theme.primaryColor,
                  color: theme.text,
                  padding: 10,
                }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Toolbar for text formatting */}
        <View style={NotePageStyles().toolBar}>
          <Toolbar
            editor={editor}
            style={NotePageStyles().container}
            actions={[
              "bold",
              "italic",
              "underline",
              "bullet_list",
              "blockquote",
              "indent",
              "outdent",
              "close_keyboard",
            ]}
          />
        </View>

        <LoadingModal visible={isUpdating} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
    minHeight: 400, // Ensures that the editor has a visible area
  },
});

export default EditNoteScreen;
