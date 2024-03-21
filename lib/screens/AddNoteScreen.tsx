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
  const richTextRef = useRef<RichEditor | null>(null);
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
          setBodyText(html); // Update the state with the latest content
        })
        .catch(error => {
          console.error('Error getting content from RichEditor:', error);
        });
    }
  };

  const addImageToEditor = (imageUri: string) => {
    const customStyle = `
      max-width: 50%;
      height: auto; /* Maintain aspect ratio */
      /* Additional CSS properties for sizing */
    `;
  
    // Include an extra line break character after the image tag
    const imgTag = `<img src="${imageUri}" style="${customStyle}" />&nbsp;<br><br>`;
  
    richTextRef.current?.insertHTML(imgTag);
  
    if (scrollViewRef.current && !initialLoad) {
      // Adjust this timeout and calculation as necessary
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  };

  const addVideoToEditor = async (videoUri: string) => {
    try {
      // Fetch the thumbnail URI
      const thumbnailUri = await getThumbnail(videoUri);
  
      const videoHtml = `
        <video width="320" height="240" controls poster="${thumbnailUri}" id="videoElement">
          <source src="${videoUri}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <p><a href="${videoUri}" target="_blank">${videoUri}</a></p> <!-- Make the URI clickable -->
        <script>
          document.getElementById('videoElement').addEventListener('play', function(e) {
            // Preventing the rich text editor from gaining focus when the video is played
            e.preventDefault();
            // Assuming you have a way to send a message to your React Native environment
            window.ReactNativeWebView.postMessage('videoPlayed');
          });
        </script>
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
  }

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
          // Location permission denied after requesting, request again
          const requestAgainResult = await Location.requestForegroundPermissionsAsync();
          status = requestAgainResult.status;
        }

        if (status !== 'granted') {
          // Location permission still not granted
          Alert.alert("Location permission denied", "Please grant location permission to save the note or remove the title to not save.");
          return false;
        }
      }

      // Location permission already granted or granted after request
      return true;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  const saveNote = async () => {
    const locationPermissionGranted = await checkLocationPermission();
    if (titleText === "") {
      if (!promptedMissingTitle) {
        setPromptedMissingTitle(true);
        Alert.alert(
          "Title is empty",
          "Please enter a title to save the note, or press back again to confirm not saving the note.",
        );
        return;
      } else {
        navigation.goBack();
        return;
      }
    }
    if (!locationPermissionGranted) {
      return; 
    }
    else {
      Alert.alert("Please wait", "Please wait while the note saves");
      
      try {
        const userLocation = await Location.getCurrentPositionAsync({});
        const userID = await user.getId();
        let latitude, longitude;
        
        if (Platform.OS === 'ios') {
          latitude = location?.latitude.toString();
          longitude = location?.longitude.toString();
        } else if (Platform.OS === 'android') {
          latitude = userLocation.coords.latitude.toString();
          longitude = userLocation.coords.longitude.toString();
        }
        
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
          <PhotoScroller data-testid="photoScroller" active={viewMedia} newMedia={newMedia} setNewMedia={setNewMedia} insertImageToEditor={addImageToEditor} addVideoToEditor={addVideoToEditor}/>
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={location} setLocation={setLocation} />
          )}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>
          <View>
            <RichToolbar data-testid="RichBar"
              style={NotePageStyles().container}
              editor={richTextRef}
              actions={[
                actions.keyboard,
                actions.undo,
                actions.redo,
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.insertBulletsList,
                actions.blockquote,
                actions.indent,
                actions.outdent,
              ]}
              iconTint={NotePageStyles().saveText.color}
              selectedIconTint="#2095F2"
            />
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
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
        >
          <View style={[NotePageStyles().editorContainer, { flex: 1 }]}>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              ref={scrollViewRef}
              contentContainerStyle={{ paddingBottom: keyboardOpen ? keyboardHeight : 20 }}
            >
              <RichEditor data-testid="RichEditor"
                ref={(r) => (richTextRef.current = r)}
                style={[NotePageStyles().editor, {flex: 1, minHeight: 650 }]}
                editorStyle={{
                  contentCSSText: `
                    position: absolute; 
                    top: 0; right: 0; bottom: 0; left: 0;
                  `,
                  backgroundColor: theme.primaryColor,
                  color: theme.text,
                }}
                autoCorrect={true}
                placeholder="Write your note here"
                onChange={(text) => setBodyText(text)}
                initialContentHTML={bodyText}
                onCursorPosition={handleCursorPosition}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>


      </SafeAreaView>
  );

};

export default AddNoteScreen;

export function addVideoToEditor(mockVideoUri: string) {
  throw new Error('Function not implemented.');
}
