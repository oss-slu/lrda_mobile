import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Keyboard,
  ScrollView,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
  Alert
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
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import NotePageStyles from "../../styles/pages/NoteStyles";
import ToastMessage from 'react-native-toast-message';
import { useTheme } from "../components/ThemeProvider";
import LoadingModal from "../components/LoadingModal";

const user = User.getInstance();

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({
  route,
  navigation,
  insertImageToEditor,
}) => {
  const { note, onSave } = route.params;
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
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
  const richTextRef = useRef<RichEditor | null>(null);
  const [isTime, setIsTime] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [location, setLocation] = useState<{
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
  const { height, width } = useWindowDimensions();
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
      const viewportHeight = Dimensions.get('window').height - keyboardHeight;
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

  const photoScrollerRef = useRef<{ goBig(index: number): void } | null>(
    null
  );

  const callGoBig = (index: number) => {
    if (photoScrollerRef.current) {
      photoScrollerRef.current.goBig(index);
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

  const updateBodyText = () => {
    if (richTextRef.current) {
      richTextRef.current.getContentHtml()
        .then(html => {
          setText(html); // Update the state with the latest content
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
  
    // Add a delay before updating the text state
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 500); // Adjust the delay as needed
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
  
  const handleSaveNote = async () => {
    setIsUpdating(true);
  
    try {
      const editedNote = {
        id: note.id,
        title: title,
        text: text,
        creator: (await user.getId()) || "",
        media: media,
        latitude: location?.latitude.toString() || "",
        longitude: location?.longitude.toString() || "",
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
            <Ionicons name="arrow-back-outline" size={30} color={NotePageStyles().title.color} />
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
                <Ionicons name="share-outline" size={30} color={NotePageStyles().title.color} />
              </TouchableOpacity>
            )
          )}
        </View>
        <View style={NotePageStyles().keyContainer}>
          <TouchableOpacity onPress={() => setViewMedia(!viewMedia)}>
            <Ionicons name="images-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewAudio(!viewAudio)}>
            <Ionicons name="mic-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLocation(!isLocation)}>
            <Ionicons name="location-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsTime(!isTime)}>
            <Ionicons name="time-outline" size={30} color={NotePageStyles().saveText.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsTagging(!isTagging)}>
            <Ionicons name="pricetag-outline" size={30} color={NotePageStyles().saveText.color} />
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
        <View>
          <RichToolbar
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
      >
        <View style={[NotePageStyles().editorContainer, { flex: 1 }]}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            ref={scrollViewRef}
          >
            <RichEditor
              ref={(r) => (richTextRef.current = r)}
              style={[NotePageStyles().editor, {flex: 1, minHeight: 650 }]}
              editorStyle={
              {
                contentCSSText: `
                  position: absolute; 
                  top: 0; right: 0; bottom: 0; left: 0;
                `,
                backgroundColor: theme.primaryColor,
                color: theme.text,
              }}
              autoCorrect={true}
              placeholder="Write your note here"
              onChange={(text) => setText(text)}
              initialContentHTML={text}
              onCursorPosition={handleScroll}
              disabled={!owner}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <LoadingModal visible={isUpdating} />
    </SafeAreaView>
  );
};

export default EditNoteScreen;