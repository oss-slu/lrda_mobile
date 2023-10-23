import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
import { ThemeProvider, useTheme } from '../components/ThemeProvider';
import Constants from "expo-constants";

const user = User.getInstance();

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isPrivate, setIsPrivate] = useState(true);
  const [published, setPublished] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  
  const { theme } = useTheme();

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

  const styles = StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      flex: 1,
      backgroundColor: theme.primaryColor,
    },
    pfpText: {
      fontWeight: "600",
      fontSize: 20,
      alignSelf: "center",
      color: theme.primaryColor,
    },
    shareColor: {
      color: theme.text,
    },
    highlightColor: {
      color: theme.text,
    },
    backColor: {
      color: 'red',
    },
    userPhoto: {
      height: 50,
      width: 50,
      borderRadius: 50,
      alignContent: "center",
      justifyContent: "center",
      backgroundColor: theme.text,
    },
    noteTitle: {
      fontSize: 20,
      fontWeight: "600",
      maxWidth: "100%",
      flexShrink: 1,
      color: theme.text,
    },
    noteText: {
      marginTop: 10,
      fontSize: 18,
      color: theme.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: theme.text,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    topView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5,
    },
    noteContainer: {
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.secondaryColor,
      borderRadius: 20,
      marginBottom: 10,
      width: "98%",
      padding: 10,
      flexDirection: "row",
      height: 120,
    },
    filtersContainer: {
      minHeight: 30,
      alignSelf: "center",
      borderRadius: 20,
      paddingHorizontal: 5,
      maxHeight: 30,
      marginBottom: 17,
      zIndex: 10,
    },
    filters: {
      justifyContent: "center",
      borderColor: theme.tertiaryColor,
      borderWidth: 2,
      borderRadius: 30,
      marginRight: 10,
      paddingHorizontal: 10,
      zIndex: 10,
    },
    filtersSelected: {
      justifyContent: "center",
      backgroundColor: theme.logout,
      fontSize: 22,
      borderRadius: 30,
      marginRight: 10,
      paddingHorizontal: 10,
    },
    selectedFont: {
      fontSize: 17,
      color: theme.logoutText,
      fontWeight: "700",
    },
    filterFont: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    title: {
      fontSize: 40,
      fontWeight: "bold",
      lineHeight: 80,
      color: theme.text,
      marginLeft: 5,
      marginBottom: "-1%",
    },
    backRightBtn: {
      alignItems: "flex-end",
      bottom: 0,
      justifyContent: "center",
      position: "absolute",
      top: 0,
      width: 75,
      paddingRight: 17,
    },
    backRightBtnRight: {
      backgroundColor: theme.primaryColor,
      width: "52%",
      right: 0,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    },
    rowBack: {
      alignItems: "center",
      backgroundColor: theme.primaryColor,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingLeft: 15,
      margin: 5,
      marginBottom: 15,
      borderRadius: 20,
    },
  });

  const sideMenu = (data: any, rowMap: any) => {
    return (
      <View style={styles.rowBack} key={data.index}>
        <TouchableOpacity>
          <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
            <Ionicons name="share" size={30} color={'green'} />
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
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
              <Ionicons
                name="trash-outline"
                size={24}
                color={styles.backColor.color}
              />
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
        style={styles.noteContainer}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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

          <View style={{ position: "absolute", left: 120 }}>
            <Text style={styles.noteTitle}>
              {item.title.length > textLength
                ? item.title.slice(0, textLength) + "..."
                : item.title}
            </Text>

            <Text style={styles.noteText}>{showTime}</Text>
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
            <Ionicons
              name="share"
              size={24}
              color={styles.shareColor.color}
            />
          ) : (
            <Ionicons
              name="share-outline"
              size={24}
              color={styles.highlightColor.color}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topView}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={[
              styles.userPhoto,
              { backgroundColor: styles.highlightColor.color },
            ]}
            onPress={() => {
              navigation.navigate("AccountPage");
            }}
          >
            <Text style={styles.pfpText}>{userInitials}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Field Notes</Text>
          <View style={styles.userPhoto} />
        </View>
      </View>
      <ScrollView
        style={styles.filtersContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TouchableOpacity
          onPress={() => handleFilters("private")}
          style={isPrivate ? styles.filtersSelected : styles.filters}
        >
          <Text
            style={isPrivate ? styles.selectedFont : styles.filterFont}
          >
            {rendering
              ? "Private"
              : isPrivate
              ? `Private (${notes.length})`
              : "Private"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilters("published")}
          style={published ? styles.filtersSelected : styles.filters}
        >
          <Text
            style={published ? styles.selectedFont : styles.filterFont}
          >
            {rendering
              ? "Published"
              : published
              ? `Published (${notes.length})`
              : "Published"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReverseOrder}
          style={styles.filters}
        >
          <Text style={styles.filterFont}>Sort by Time</Text>
        </TouchableOpacity>
      </ScrollView>
      {rendering ? <NoteSkeleton /> : renderList(notes)}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddNote", { refreshPage })}
      >
        <Ionicons name="add-outline" size={26} color={theme.primaryColor} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
