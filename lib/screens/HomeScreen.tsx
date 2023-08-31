import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { Note } from "../../types";
import { HomeScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";
import { SwipeListView } from "react-native-swipe-list-view";
import NoteSkeleton from "../components/noteSkeleton";
import LoadingImage from "../components/loadingImage";
import { formatToLocalDateString } from "../components/time";
import { HomeStyles } from "../../styles/pages/HomeStyles";
import { lightTheme, darkTheme } from "../../styles/colors";

const user = User.getInstance();
const globalTheme = lightTheme;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isPrivate, setIsPrivate] = useState(true);
  const [published, setPublished] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  let textLength = 16;

  useEffect(() => {
    (async () => {
      const name = await user.getName();
      if (name) {
        const initials = name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("");
        setUserInitials(initials);
      }
    })();
  }, []);

  const refreshPage = () => {
    setUpdateCounter(updateCounter + 1);
  };

  useEffect(() => {
    setRendering(true);
    if (route.params?.note) {
      setNotes([...notes, route.params.note]);
    }
    fetchMessages();
  }, [route.params, updateCounter]);

  const fetchMessages = async () => {
    try {
      const userId = await user.getId();
      const data = await ApiService.fetchMessages(
        false,
        published,
        userId || ""
      );
      setMessages(data);

      const fetchedNotes = DataConversion.convertMediaTypes(data);

      if (Platform.OS === "web") {
        textLength = 50;
        setNotes(reversed ? fetchedNotes.reverse() : fetchedNotes);
      } else {
        setNotes(reversed ? fetchedNotes : fetchedNotes.reverse());
      }
      setRendering(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes?.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
    refreshPage();
  };

  const deleteNoteFromAPI = async (id: string) => {
    try {
      const userId = await user.getId();
      const success = await ApiService.deleteNoteFromAPI(id, userId || "");
      if (success) {
        return true;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  };

  const handleFilters = (name: string) => {
    if (name == "published") {
      setIsPrivate(false);
      setPublished(true);
      refreshPage();
    } else if (name == "private") {
      setIsPrivate(true);
      setPublished(false);
      refreshPage();
    }
  };

  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const sideMenu = (data: any, rowMap: any) => {
    return (
      <View style={HomeStyles.rowBack} key={data.index}>
        <TouchableOpacity>
          <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
            <Ionicons name="share" size={30} color="black" />
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={[HomeStyles.backRightBtn, HomeStyles.backRightBtnRight]}>
          {isPrivate ? (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: 20,
              }}
              onPress={() => deleteNote(data.item.id, rowMap)}
            >
              <Ionicons name="trash-outline" size={24} color="#111111" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const deleteNote = (data: any, rowMap: any) => {
    if (rowMap[data]) {
      rowMap[data].closeRow();
    }
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== data));
    deleteNoteFromAPI(data);
  };

  async function publishNote(data: any, rowMap: any) {
    if (rowMap[data]) {
      rowMap[data].closeRow();
    }
    const foundNote = notes.find((note) => note.id === data);
    const editedNote: Note = {
      id: foundNote?.id || "",
      title: foundNote?.title || "",
      text: foundNote?.text || "",
      creator: foundNote?.creator || "",
      media: foundNote?.media || [],
      latitude: foundNote?.latitude || "",
      longitude: foundNote?.longitude || "",
      audio: foundNote?.audio || [],
      published: !foundNote?.published || false,
      time: foundNote?.time || new Date(),
      tags: foundNote?.tags || [],
    };
    await ApiService.overwriteNote(editedNote);
    refreshPage();
  }

  const renderList = (notes: Note[]) => {
    return isPrivate ? (
      <SwipeListView
        data={notes}
        renderItem={renderItem}
        renderHiddenItem={sideMenu}
        leftActivationValue={160}
        rightActivationValue={-160}
        leftOpenValue={75}
        rightOpenValue={-75}
        stopLeftSwipe={175}
        stopRightSwipe={-175}
        keyExtractor={(item) => item.id}
        onRightAction={(data, rowMap) => deleteNote(data, rowMap)}
        onLeftAction={(data, rowMap) => publishNote(data, rowMap)}
      />
    ) : (
      <SwipeListView
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    );
  };

  const renderItem = (data: any) => {
    const item = data.item;
    const tempTime = new Date(item.time);
    const showTime = formatToLocalDateString(tempTime);
    const mediaItem = item.media[0];
    const ImageType = mediaItem?.getType();
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.getUri();
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.getThumbnail();
      IsImage = true;
    }
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={HomeStyles.noteContainer}
        onPress={() =>
          navigation.navigate("EditNote", {
            note: item,
            onSave: (editedNote: Note) => {
              updateNote(editedNote);
              refreshPage();
            },
          })
        }
      >
        <View style={{ flexDirection: "row", alignItems: 'center' }}>
          {IsImage ? (
            <View style={{ height: 100, width: 100 }}>
              <LoadingImage
                imageURI={ImageURI}
                type={ImageType}
                isImage={true}
              />
            </View>
          ) : (
            <View style={{ height: 100, width: 100 }}>
              <LoadingImage imageURI={""} type={ImageType} isImage={false} />
            </View>
          )}

          <View
            style={{ position: "absolute", left: 120 }}
          >
            <Text style={HomeStyles.noteTitle}>
              {item.title.length > textLength
                ? item.title.slice(0, textLength) + "..."
                : item.title}
            </Text>

            <Text style={HomeStyles.noteText}>{showTime}</Text>
          </View>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: 10,
          }}
        >
          {item.published ? (
            <Ionicons name="share" size={24} color={globalTheme.highlightSecondary} />
          ) : (
            <Ionicons name="share-outline" size={24} color="#111111" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={HomeStyles.container}>
      <View style={HomeStyles.topView}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between', width: '100%'}}>
          <TouchableOpacity style={[HomeStyles.userPhoto, {backgroundColor: "#F4DFCD"}]} onPress={() => {navigation.navigate("AccountPage")}}>
            <Text
              style={{ fontWeight: "600", fontSize: 20, alignSelf: "center" }}
            >
              {userInitials}
            </Text>
          </TouchableOpacity>
          <Text style={HomeStyles.title}>Field Notes</Text>
          <View style={HomeStyles.userPhoto} />
        </View>
      </View>
      <ScrollView
        style={HomeStyles.filtersContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TouchableOpacity
          onPress={() => handleFilters("private")}
          style={isPrivate ? HomeStyles.filtersSelected : HomeStyles.filters}
        >
          <Text style={isPrivate ? HomeStyles.selectedFont : HomeStyles.filterFont}>
            {rendering
              ? "Private"
              : isPrivate
              ? `Private (${notes.length})`
              : "Private"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilters("published")}
          style={published ? HomeStyles.filtersSelected : HomeStyles.filters}
        >
          <Text style={published ? HomeStyles.selectedFont : HomeStyles.filterFont}>
            {rendering
              ? "Published"
              : published
              ? `Published (${notes.length})`
              : "Published"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReverseOrder} style={HomeStyles.filters}>
          <Text style={HomeStyles.filterFont}>Sort by Time</Text>
        </TouchableOpacity>
      </ScrollView>
      {rendering ? <NoteSkeleton /> : renderList(notes)}
      <TouchableOpacity
        style={HomeStyles.addButton}
        onPress={() => navigation.navigate("AddNote", { refreshPage })}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
