import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Text,
} from "react-native";
import { Note, AddNoteScreenProps } from "../../types";
import PhotoScroller from "../components/photoScroller";
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
import { NotePageStyles } from "../../styles/pages/NoteStyles";

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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboard(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboard(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleScroll = (positionY: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: positionY - 100, animated: true });
    }
  };

  const addImageToEditor = (imageUri: string) => {
    richTextRef.current?.insertImage(imageUri);
  };

  const saveNote = async () => {
    if (titleText === "") {
      navigation.goBack();
    } else if (bodyText !== "" && titleText === "") {
      Alert.alert("A title is necessary to save");
    } else {
      try {
        const userID = await user.getId();
        const newNote = {
          title: titleText,
          text: bodyText,
          media: newMedia,
          audio: newAudio,
          creator: userID,
          latitude: location?.latitude.toString() || "",
          longitude: location?.longitude.toString() || "",
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
    <View>
      <View style={NotePageStyles.topContainer}>
        <TouchableOpacity style={NotePageStyles.topButtons} onPress={saveNote}>
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TextInput
          style={NotePageStyles.title}
          placeholder="Title Field Note"
          onChangeText={(text) => setTitleText(text)}
          value={titleText}
        />

        {isPublished ? (
          <TouchableOpacity
            style={NotePageStyles.topButtons}
            onPress={() => setIsPublished(!isPublished)}
          >
            <Ionicons name="share" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={NotePageStyles.topButtons}
            onPress={() => setIsPublished(!isPublished)}
          >
            <Ionicons name="share-outline" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={NotePageStyles.keyContainer}>
        <TouchableOpacity
          onPress={() => {
            setViewMedia(!viewMedia);
            setViewAudio(false);
            setIsTagging(false);
            setIsLocation(false);
            setIsTime(false);
          }}
        >
          <Ionicons name="images-outline" size={30} color="black" />
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
          <Ionicons name="mic-outline" size={30} color="black" />
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
          <Ionicons name="location-outline" size={30} color="black" />
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
          <Ionicons name="time-outline" size={30} color="black" />
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
          <Ionicons name="pricetag-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: "white" }}>
        <PhotoScroller active={viewMedia} newMedia={newMedia} setNewMedia={setNewMedia} insertImageToEditor={addImageToEditor} />
        {viewAudio && (
          <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
        )}
        {isTagging && <TagWindow tags={tags} setTags={setTags} />}
        {isLocation && (
          <LocationWindow location={location} setLocation={setLocation} />
        )}
        {isTime && <TimeWindow time={time} setTime={setTime} />}
      </View>
      <RichToolbar
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
        iconTint={"#000"}
        selectedIconTint={"#2095F2"}
      />
      <View style={NotePageStyles.container}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          style={{ overflow: "hidden", paddingTop: 10, paddingBottom: 100 }}
          ref={scrollViewRef}
        >
          <View key="Tags Container">
            <ScrollView
              horizontal={true}
              style={{ width: "100%", marginHorizontal: 10, paddingLeft: 5, marginBottom: 10, }}
            >
              {tags &&
                tags.map((tag, index) => (
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
                        borderColor: "black",
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
                          backgroundColor: "black",
                          marginRight: 5,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        borderColor: "black",
                        borderRightWidth: 2,
                        borderBottomWidth: 2,
                        borderTopWidth: 2,
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        flexDirection: "row",
                        marginLeft: 10,
                      }}
                    >
                      <Text style={{ textAlign: "center" }}>{tag}</Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
          <View
            style={[
              { paddingBottom: keyboardOpen ? 50 : 150 },
              { minHeight: 900 },
            ]}
          >
            <RichEditor
              ref={(r) => (richTextRef.current = r)}
              style={NotePageStyles.input}
              autoCorrect={true}
              placeholder="Write your note here"
              onChange={(text) => setBodyText(text)}
              initialContentHTML={bodyText}
              onCursorPosition={(position) => {
                handleScroll(position);
              }}
            />
            <View style={{ height: keyboardOpen ? 590 : 270 }} />
          </View>
        </ScrollView>
      </View>
    </View>
    
  );
};

export default AddNoteScreen;
