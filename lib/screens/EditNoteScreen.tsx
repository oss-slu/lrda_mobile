import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Keyboard,
  ScrollView,
  useWindowDimensions,
  Text,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { TouchableOpacity } from "react-native-gesture-handler";
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
import Constants from "expo-constants";
import { ResizeMode, Video } from "expo-av";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import LoadingImage from "../components/loadingImage";
import NotePageStyles from "../../styles/pages/NoteStyles";

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
  const [isLocation, setIsLocation] = useState(false);
  const richTextRef = useRef<RichEditor | null>(null);
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
  const { height, width } = useWindowDimensions();

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

  const handleScroll = (positionY: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: positionY + (media[0] ? 100 : -100),
        animated: true,
      });
    }
  };

  const photoScrollerRef = React.useRef<{ goBig(index: number): void } | null>(
    null
  );

  const callGoBig = (index: number) => {
    if (photoScrollerRef.current) {
      photoScrollerRef.current.goBig(index);
    }
  };

  const addImageToEditor = (imageUri: string) => {
    richTextRef.current?.insertImage(imageUri);
  };
  

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
    <View>
      <View style={NotePageStyles().topContainer}>
        <TouchableOpacity
          style={NotePageStyles().topButtons}
          onPress={owner ? handleSaveNote : () => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="Title Field Note"
          style={NotePageStyles().title}
          value={title}
          onChangeText={setTitle}
        />
        {owner ? (
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
              onPress={() => setIsPublished(!isPublished)}
            >
              <Ionicons name="share-outline" size={30} color="white" />
            </TouchableOpacity>
          )
        ) : (
          <View />
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
      <View style={{ backgroundColor: NotePageStyles().container.backgroundColor }}>
        <PhotoScroller
          ref={photoScrollerRef}
          active={viewMedia}
          newMedia={media}
          setNewMedia={setMedia}
          insertImageToEditor={addImageToEditor}
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
        selectedIconTint={"#2095F2"}
      />

      <View style={NotePageStyles().container}>
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
          {media[0] && (
            <View style={{ height: 280, marginLeft: 3 }}>
              {media[0].getType() === "image" ? (
                <TouchableOpacity onPress={() => callGoBig(0)}>
                  <LoadingImage
                    imageURI={media[0].getUri()}
                    type={"photo"}
                    isImage={true}
                    height={280}
                    width={width - 6}
                  />
                </TouchableOpacity>
              ) : (
                <Video
                  source={{ uri: media[0].getUri() }}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={true}
                  useNativeControls={true}
                  isLooping={true}
                  style={NotePageStyles().video}
                />
              )}
            </View>
          )}

          <View
            style={[
              { paddingBottom: keyboardOpen ? 50 : 150 },
              { minHeight: 900 },
            ]}
          >
            <RichEditor
              ref={(r) => (richTextRef.current = r)}
              style={NotePageStyles().input}
              editorStyle={{
                contentCSSText: `
                  position: absolute; 
                  top: 0; right: 0; bottom: 0; left: 0;
                `,
              }}
              autoCorrect={true}
              placeholder="Write your note here"
              onChange={(text) => setText(text)}
              initialContentHTML={text}
              //at first glance I believe changes need to be made here.
              onCursorPosition={(position) => {
                handleScroll(position);
              }}
            />
            <View style={{ height: keyboardOpen ? 400 : 90 }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default EditNoteScreen;
