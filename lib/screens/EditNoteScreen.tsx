// EditNoteScreen.tsx
import React, { useState, useEffect } from "react";
import { View, TextInput, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../types";
import PhotoScroller from "../components/photoScroller";
import { User } from "../models/user_class";
import AudioContainer from "../components/audio";
import { Media, AudioType, VideoType } from "../models/media_class";
import { EditNoteScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import TagWindow from "../components/tagging";
import LocationWindow from "../components/location";
import TimeWindow from "../components/time";
import { getThumbnail } from "../utils/S3_proxy";
import Constants from "expo-constants";
import { ResizeMode, Video } from "expo-av";

const user = User.getInstance();

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({
  route,
  navigation,
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
  const [viewMedia, setViewMedia] = useState(false);
  const [viewAudio, setViewAudio] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [isLocation, setIsLocation] = useState(false);
  const [isTime, setIsTime] = useState(false);
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

  useEffect(() => {
    const checkOwner = async () => {
      if (creator === (await user.getId())) {
        setOwner(true);
      } else {
        setOwner(false);
      }
    };

    checkOwner();
  }, [creator]);

  const handleSaveNote = async () => {
    try {
      const editedNote: Note = {
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

      const response = await ApiService.overwriteNote(editedNote);

      onSave(editedNote);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating the note:", error);
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.topButtons}
          onPress={owner ? handleSaveNote : () => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="Title Field Note"
          style={styles.title}
          value={title}
          onChangeText={setTitle}
        />
        {owner ? (
          isPublished ? (
            <TouchableOpacity
              style={styles.topButtons}
              onPress={() => setIsPublished(!isPublished)}
            >
              <Ionicons name="earth" size={30} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.topButtons}
              onPress={() => setIsPublished(!isPublished)}
            >
              <Ionicons name="earth-outline" size={30} color="white" />
            </TouchableOpacity>
          )
        ) : (
          <View />
        )}
      </View>
      <View>
        <View style={styles.keyContainer}>
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
          {viewMedia && (
            <PhotoScroller newMedia={media} setNewMedia={setMedia} />
          )}
          {viewAudio && (
            <AudioContainer newAudio={newAudio} setNewAudio={setNewAudio} />
          )}
          {isTagging && <TagWindow tags={tags} setTags={setTags} />}
          {isLocation && (
            <LocationWindow location={location} setLocation={setLocation} />
          )}
          {isTime && <TimeWindow time={time} setTime={setTime} />}
        </View>
      </View>
      <View style={styles.container}>
        {media[0] && (
          <View style={{ height: 280 }}>
            {media[0].getType() === "image" ? (
              <Image
                source={{
                  uri: media[0].getUri(),
                }}
                resizeMode="contain"
                style={{ height: "100%", width: "100%" }}
              />
            ) : (
              <Video
              source={{ uri: media[0].getUri() }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              useNativeControls={true}
              isLooping={true}
              style={styles.video}
              />
            )}
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline={true}
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingTop: Constants.statusBarHeight,
    flexDirection: "row",
    backgroundColor: "#F4DFCD",
    alignItems: "center",
    textAlign: "center",
  },
  topText: {
    maxWidth: "100%",
    fontWeight: "700",
    fontSize: 32,
  },
  topButtons: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: "1%",
    backgroundColor: "white",
    height: "100%",
  },
  title: {
    width: "70%",
    alignSelf: "center",
    height: 45,
    borderColor: "#111111",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    textAlign: "center",
    fontSize: 30,
  },
  input: {
    borderColor: "#111111",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    minHeight: 300,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  toggles: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    zIndex: 99,
  },
  keyContainer: {
    height: 60,
    paddingVertical: 5,
    width: "100%",
    backgroundColor: "#F4DFCD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  video: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignSelf: "center",
  },
  saveButton: {
    backgroundColor: "#C7EBB3",
    paddingHorizontal: 120,
    padding: 10,
    alignItems: "center",
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: "center",
  },
  saveText: {
    color: "#111111",
    fontWeight: "bold",
    fontSize: 12,
  },
  inputContainer: {
    flexGrow: 1,
    backgroundColor: "white",
  },
});

export default EditNoteScreen;
