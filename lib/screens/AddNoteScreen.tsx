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
import { Note, AddNoteScreenProps } from "../../types";
import ToastMessage from 'react-native-toast-message';
import PhotoScroller from "../components/photoScroller";
import { getThumbnail } from "../utils/S3_proxy";
import { User } from "../models/user_class";
import { Ionicons } from "@expo/vector-icons";
import { Media, AudioType } from "../models/media_class";
import AudioContainer from "../components/audio";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import NotePageStyles from "../../styles/pages/NoteStyles";
import { useTheme } from "../components/ThemeProvider";
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';

const user = User.getInstance();

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [newMedia, setNewMedia] = useState<Media[]>([]);
  const [newAudio, setNewAudio] = useState<AudioType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isLocation, setIsLocation] = useState(false);
  const [isTime, setIsTime] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [keyboardOpen, setKeyboard] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [promptedMissingTitle, setPromptedMissingTitle] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { theme } = useTheme();

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: 'Start editing!',
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
    const timeout = setTimeout(() => {
      setInitialLoad(false);
    }, 1000); // Adjust delay as needed

    return () => {
      clearTimeout(timeout);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    checkLocationPermission();
  }, []);

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

  const handleShareButtonPress = () => {
    setIsPublished(!isPublished);  // Toggle the share status
    ToastMessage.show({
      type: 'success',
      text1: 'Note Published',
      visibilityTime: 3000 // 3 seconds
    });
  };

  const checkLocationPermission = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
  
      if (status !== 'granted') {
        // Location permission not granted, request it
        const requestResult = await Location.requestForegroundPermissionsAsync();
  
        if (requestResult.status === 'denied') {
          // Location permission denied after requesting, show alert and return false
          Alert.alert(
            "Location permission denied",
            "Please grant location permission to save the note.",
            [
              {
                text: "Delete Note",
                onPress: () => navigation.goBack(), // Delete the note and go back
                style: "destructive",
              },
              { text: "OK", onPress: () => console.log("OK Pressed") },
            ],
            { cancelable: false }
          );
          return false;
        }
  
        // Location permission not yet granted
        return false;
      }
  
      // Location permission already granted
      return true;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  const saveNote = async () => {
    if (titleText.trim() === "") {
      Alert.alert(
        "Empty Title",
        "Please enter a title to save the note or delete the note.",
        [
          { text: "Delete Note", onPress: () => navigation.goBack() },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ],
        { cancelable: false }
      );
      return;
    }
  
    const locationPermissionGranted = await checkLocationPermission();
    if (!locationPermissionGranted) {
      return; // Stop saving the note if location permission is not granted
    } else {
      try {
        const userID = await user.getId();
  
        // Grab user's current location
        const userLocation = await Location.getCurrentPositionAsync({});
        const latitude = userLocation.coords.latitude.toString();
        const longitude = userLocation.coords.longitude.toString();
  
        setTime(new Date()); // force a fresh time date grab on note save
  
        const newNote = {
          title: titleText,
          text: bodyText,
          media: newMedia,
          audio: newAudio,
          creator: userID,
          latitude: latitude,
          longitude: longitude,
          published: isPublished,
          tags: tags,
          time: time,
        };
        const response = await ApiService.writeNewNote(newNote);
  
        const obj = await response.json();
        const id = obj["@id"];
  
        route.params.refreshPage();
        navigation.goBack();
      } catch (error) {
        console.error("An error occurred while creating the note:", error);
      }
    }
  };

  
  

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={NotePageStyles().topContainer}>
  
          <View style={NotePageStyles().topButtonsContainer}>
            <TouchableOpacity style={NotePageStyles().topButtons} onPress={saveNote} testID="checklocationpermission">
              <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TextInput
              style={NotePageStyles().title}
              placeholder="Title Field Note"
              placeholderTextColor={NotePageStyles().title.color}
              onChangeText={(text) => setTitleText(text)}
              value={titleText}
            />
            {isPublished ? (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={() => setIsPublished(!isPublished)}
              >
                <Ionicons name="share" size={30} color={NotePageStyles().saveText.color} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={NotePageStyles().topButtons}
                onPress={handleShareButtonPress}
              >
                <Ionicons name="share-outline" size={30} color={NotePageStyles().saveText.color} />
              </TouchableOpacity>
            )}
          </View>
          <View style={NotePageStyles().keyContainer}>
            <TouchableOpacity
              onPress={() => {
                setViewMedia(!viewMedia);
                setViewAudio(false);
                setIsTagging(false);
                setIsLocation(false);
                setIsTime(false);
              }}
              data-testid="images-icon"
            >
              <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setViewMedia(false);
                setViewAudio(!viewAudio);
                setIsTagging(false);
                setIsLocation(false);
                setIsTime(false);
              }}
            >
              <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setViewMedia(false);
                setViewAudio(false);
                setIsTagging(false);
                setIsLocation(!isLocation);
                setIsTime(false);
              }}
            >
            <Ionicons name="location-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setViewMedia(false);
                setViewAudio(false);
                setIsTagging(false);
                setIsLocation(false);
                setIsTime(!isTime);
              }}
            >
              <Ionicons name="time-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setViewMedia(false);
                setViewAudio(false);
                setIsTagging(!isTagging);
                setIsLocation(false);
                setIsTime(false);
              }}
            >
              <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
            </TouchableOpacity>
        </View>
        <View style={NotePageStyles().container }>
          <PhotoScroller data-testid="photoScroller" active={viewMedia} newMedia={newMedia} setNewMedia={setNewMedia} />
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={location} setLocation={setLocation} />
          )}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>
          <View key="Tags Container">
            {tags.length > 0 && (
              <ScrollView
                horizontal={true}
                style={{ width: "100%", marginHorizontal: 10, paddingLeft: 5, marginBottom: 10 }}
              >
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        transform: [{ rotate: "45deg" }],
                        position: "absolute",
                        left: 2,
                        borderLeftWidth: 2,
                        borderBottomWidth: 2,
                        borderColor: NotePageStyles().title.color,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 5,
                          width: 5,
                          left: 2,
                          borderRadius: 10,
                          backgroundColor: NotePageStyles().title.color,
                          marginRight: 5,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        borderColor: NotePageStyles().title.color,
                        borderRightWidth: 2,
                        borderBottomWidth: 2,
                        borderTopWidth: 2,
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        flexDirection: "row",
                        marginLeft: 10,
                      }}
                    >
                      <Text style={{ textAlign: "center", color: NotePageStyles().title.color }}>{tag}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            </View>
  
        </View>
        
        <RichText 
          editor={editor} 
          onChange={(text: React.SetStateAction<string>) => setBodyText(text)}
        />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={NotePageStyles().keyboardAvoidingView}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

};

export default AddNoteScreen;

export function addVideoToEditor(mockVideoUri: string) {
  throw new Error('Function not implemented.');
}
