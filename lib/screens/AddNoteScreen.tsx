import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Text,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
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
import {
  RichEditor,
  RichToolbar,
  actions
} from "react-native-pell-rich-editor";
import NotePageStyles from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";

const user = User.getInstance();

const AddNoteScreen = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState("");
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(true);
  const [untitledNumber, setUntitledNumber] = useState("0");
  const [bodyText, setBodyText] = useState("");
  const [newMedia, setNewMedia] = useState([]);
  const [newAudio, setNewAudio] = useState([]);
  const [tags, setTags] = useState([]);
  const [time, setTime] = useState(new Date());
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isLocation, setIsLocation] = useState(false);
  const [isTime, setIsTime] = useState(false);
  const richTextRef = useRef(null);
  const [isPublished, setIsPublished] = useState(false);
  const [keyboardOpen, setKeyboard] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLocationIconPressed, setIsLocationIconPressed] = useState(false);
  let [location, setLocation] = useState(null);
  const { theme } = useTheme();

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
    const timeout = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    const { untitledNumber } = route.params;
    if (untitledNumber) {
      setUntitledNumber(untitledNumber.toString());
    }
  }, [route.params]);

  const grabLocation = async () => {
    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    } catch (error) {
      console.error("Error grabbing location:", error);
    }
  };

  const handleCursorPosition = (position) => {
    if (scrollViewRef.current && keyboardOpen) {
      const editorBottomY = position.absoluteY + position.height;
      const keyboardTopY = Dimensions.get('window').height - keyboardHeight;

      if (editorBottomY > keyboardTopY) {
        scrollViewRef.current.scrollTo({
          y: editorBottomY - keyboardTopY,
          animated: true,
        });
      }
    }
  };

  const updateBodyText = () => {
    if (richTextRef.current) {
      richTextRef.current.getContentHtml()
        .then(html => {
          setBodyText(html);
        })
        .catch(error => {
          console.error('Error getting content from RichEditor:', error);
        });
    }
  };

  const addImageToEditor = (imageUri) => {
    const imgTag = `<img src="${imageUri}" style="max-width: 50%; height: auto;" />&nbsp;<br><br>`;
    richTextRef.current?.insertHTML(imgTag);

    if (scrollViewRef.current && !initialLoad) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  };

  const addVideoToEditor = async (videoUri) => {
    try {
      const thumbnailUri = await getThumbnail(videoUri);
      const videoHtml = `
        <video width="320" height="240" controls poster="${thumbnailUri}">
          <source src="${videoUri}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <p><a href="${videoUri}" target="_blank">${videoUri}</a></p>
      `;
      richTextRef.current?.insertHTML(videoHtml);

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 500);
    } catch (error) {
      console.error("Error adding video with thumbnail: ", error);
    }
  };

  const handleShareButtonPress = () => {
    setIsPublished(!isPublished);
    ToastMessage.show({
      type: 'success',
      text1: 'Note Published',
      visibilityTime: 3000
    });
  };

  const toggleLocationVisibility = async () => {
    if (isLocationIconPressed) {
      setLocation({ latitude: 0, longitude: 0 });
      setIsLocationIconPressed(false);
    } else {
      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        if (userLocation) {
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });
        }
        setIsLocationIconPressed(true);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    }
  };

  const checkLocationPermission = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const requestResult = await Location.requestForegroundPermissionsAsync();
        if (requestResult.status === 'denied') {
          Alert.alert(
            "Location permission denied",
            "Please grant location permission to save the note.",
            [
              {
                text: "Delete Note",
                onPress: () => navigation.goBack(),
                style: "destructive",
              },
              { text: "OK" }
            ],
            { cancelable: false }
          );
          return false;
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  const saveNote = async () => {
    const locationPermissionGranted = await checkLocationPermission();
    if (!locationPermissionGranted) return;

    setIsSaveButtonEnabled(false);
    let finalTitle = titleText.trim() || `Untitled ${untitledNumber}`;
    if (!finalTitle) {
      Alert.alert("Empty Title", "Please enter a title to save the note or delete the note.");
      setIsSaveButtonEnabled(true);
      return;
    }

    setIsUpdating(true);
    try {
      const userID = await user.getId();
      const userLocation = await Location.getCurrentPositionAsync({});
      const latitudeToSave = location?.latitude?.toString() || userLocation.coords.latitude.toString();
      const longitudeToSave = location?.longitude?.toString() || userLocation.coords.longitude.toString();

      const newNote = {
        title: finalTitle,
        text: bodyText,
        media: newMedia,
        audio: newAudio,
        creator: userID,
        latitude: latitudeToSave,
        longitude: longitudeToSave,
        published: isPublished,
        tags,
        time: new Date(),
      };

      const response = await ApiService.writeNewNote(newNote);
      const obj = await response.json();
      route.params.refreshPage();
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    } finally {
      setIsUpdating(false);
      setIsSaveButtonEnabled(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={NotePageStyles().topContainer}>
        <View style={NotePageStyles().topButtonsContainer}>
          <TouchableOpacity style={NotePageStyles().topButtons} disabled={!isSaveButtonEnabled} onPress={saveNote} testID="checklocationpermission">
            <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TextInput
           testID="tag-input"
            style={NotePageStyles().title}
            placeholder="Title Field Note"
            placeholderTextColor={NotePageStyles().title.color}
            onChangeText={setTitleText}
            value={titleText}
          />
          <TouchableOpacity style={NotePageStyles().topButtons} onPress={handleShareButtonPress}>
            <Ionicons name={isPublished ? "share" : "share-outline"} size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
        </View>
        <View style={NotePageStyles().keyContainer}>
          <TouchableOpacity onPress={() => { setViewMedia(!viewMedia); setViewAudio(false); }} testID="images-icon">
            <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setViewMedia(false); setViewAudio(!viewAudio); }}>
            <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLocationVisibility}>
            <Ionicons name="location-outline" size={30} color={isLocationIconPressed ? "red" : NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsTime(!isTime); }}>
            <Ionicons name="time-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsTagging(!isTagging); }}>
            <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
        </View>
        <View style={NotePageStyles().container}>
          <PhotoScroller active={viewMedia} newMedia={newMedia} setNewMedia={setNewMedia} insertImageToEditor={addImageToEditor} addVideoToEditor={addVideoToEditor} />
          {viewAudio && <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && <LocationWindow location={location} setLocation={setLocation} />}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>
        <RichToolbar
          editor={richTextRef}
          actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList, actions.blockquote, actions.indent, actions.outdent]}
          iconTint={NotePageStyles().saveText.color}
          selectedIconTint="#2095F2"
          style={NotePageStyles().container}
        />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}>
        <View style={[NotePageStyles().editorContainer, { flex: 1 }]}>
          <ScrollView ref={scrollViewRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: keyboardOpen ? keyboardHeight : 20 }}>
            <RichEditor
              ref={richTextRef}
              style={[NotePageStyles().editor, { flex: 1, minHeight: 650 }]}
              editorStyle={{ backgroundColor: theme.primaryColor, color: theme.text }}
              placeholder="Write your note here"
              onChange={(text) => setBodyText(text)}
              initialContentHTML={bodyText}
              onCursorPosition={handleCursorPosition}
              testID="RichEditor"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <LoadingModal visible={isUpdating} />
    </SafeAreaView>
  );
};

export default AddNoteScreen;
