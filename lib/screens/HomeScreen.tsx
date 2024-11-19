import React, { useState, useEffect, useMemo } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
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
import { useTheme } from "../components/ThemeProvider";
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";
import NoteDetailModal from "./mapPage/NoteDetailModal";
import ToastMessage from "react-native-toast-message";

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
  const { width } = Dimensions.get("window");
  const [initialItems, setInitialItems] = useState([
    { label: "My Entries", value: "my_entries" },
    { label: "Published Entries", value: "published_entries" },
  ]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialItems[0].value);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(
    undefined
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { theme } = useTheme();

  let textLength = 18;

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

  // Fetch notes, either all published or user-specific based on filter
  useEffect(() => {
    setRendering(true);
    fetchMessages();
  }, [updateCounter, published, value]);

  const fetchMessages = async () => {
    try {
      const userId = await user.getId();
      const data = await ApiService.fetchMessages(
        false,
        published,
        isPrivate ? userId : ""
      );
  
      setMessages(data);
  
      // Convert data and sort notes by date (latest first)
      const fetchedNotes = DataConversion.convertMediaTypes(data)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
      // Apply reverse logic if 'reversed' is true
      setNotes(reversed ? fetchedNotes.reverse() : fetchedNotes);
      setRendering(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      ToastMessage.show({
        type: "error",
        text1: "Error fetching messages",
        text2: error.message,
      });
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
      ToastMessage.show({
        type: "error",
        text1: "Error deleting note",
        text2: error.message,
      });
      return false;
    }
  };

  const handleFilters = (name: string) => {
    if (name === "published_entries") {
      setIsPrivate(false);
      setPublished(true);
    } else if (name === "my_entries") {
      setIsPrivate(true);
      setPublished(false);
    }
    refreshPage();
  };

  useEffect(() => {
    handleFilters(value);
  }, []);

  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const findNextUntitledNumber = (notes: Note[]) => {
    let maxNumber = 0;
    notes.forEach((note) => {
      const match = note.title.match(/^Untitled (\d+)$/);
      if (match) {
        const number = parseInt(match[1]);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    return maxNumber + 1;
  };

  const sideMenu = (data: any, rowMap: any) => {
    return (
      <View style={styles(theme, width).rowBack} key={data.index}>
        <TouchableOpacity>
          <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
            <Ionicons name="share" size={30} color={"green"} />
          </TouchableOpacity>
        </TouchableOpacity>
        <View
          style={[
            styles(theme, width).backRightBtn,
            styles(theme, width).backRightBtnRight,
          ]}
        >
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
                color={styles(theme, width).backColor.color}
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
    const filteredNotes = searchQuery
      ? notes.filter((note) => {
          const lowerCaseQuery = searchQuery.toLowerCase();
          const noteTime = new Date(note.time);
          const formattedTime = formatDate(noteTime);
          return (
            note.title.toLowerCase().includes(lowerCaseQuery) ||
            formattedTime.includes(lowerCaseQuery)
          );
        })
      : notes;

    return isPrivate ? (
      <SwipeListView
        data={filteredNotes}
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
        data={filteredNotes}
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
  
    // Ensure ImageURI is a valid string
    let ImageURI = "";
    let IsImage = false;
    
    if (ImageType === "image") {
      ImageURI = mediaItem.getUri();
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.getThumbnail();
      IsImage = true;
    }
  
    // Enforce `uri` as a string, especially for Android
    const resolvedImageURI = Platform.OS === "android" ? String(ImageURI || "") : ImageURI;
  
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={styles(theme, width).noteContainer}
        onPress={() => {
          if (!item.published) {
            navigation.navigate("EditNote", {
              note: item,
              onSave: (editedNote: Note) => {
                updateNote(editedNote);
                refreshPage();
              },
            });
          } else {
            const formattedNote = {
              ...item,
              time: formatToLocalDateString(new Date(item.time)),
              description: item.text,
              images: item.media.map((mediaItem: { uri: any }) => ({
                uri: mediaItem.uri,
              })),
            };
            setSelectedNote(formattedNote);
            setModalVisible(true);
          }
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {IsImage && resolvedImageURI ? (
            <View style={{ height: 100, width: 100 }}>
              <LoadingImage
                imageURI={resolvedImageURI}
                type={ImageType}
                isImage={true}
                useCustomDimensions={true}
                customWidth={100}
                customHeight={100}
              />
            </View>
          ) : (
            <View style={{ height: 100, width: 100 }}>
              <LoadingImage imageURI={""} type={ImageType} isImage={false} />
            </View>
          )}
  
          <View style={{ position: "absolute", left: 120 }}>
            <Text style={styles(theme, width).noteTitle}>
              {item.title.length > textLength
                ? item.title.slice(0, textLength) + "..."
                : item.title}
            </Text>
  
            <Text style={styles(theme, width).noteText}>{showTime}</Text>
          </View>
        </View>
        <View style={{ position: "absolute", right: 10 }}>
          {item.published ? (
            <Ionicons
              name="share"
              size={24}
              color={styles(theme, width).shareColor.color}
            />
          ) : (
            <Ionicons
              name="share-outline"
              size={24}
              color={styles(theme, width).highlightColor.color}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteTime = new Date(note.time);
      const formattedTime = formatDate(noteTime);

      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formattedTime.includes(searchQuery.toLowerCase())
      );
    });
  }, [notes, searchQuery]);

  return (
    <View style={styles(theme, width).container}>
      <View style={styles(theme, width).topView}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingBottom: 15,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles(theme, width).userPhoto,
              { backgroundColor: theme.black },
            ]}
            onPress={() => {
              navigation.navigate("AccountPage");
            }}
          >
            <Text style={styles(theme, width).pfpText}>{userInitials}</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/icon.png")}
            style={{
              width: width * 0.105,
              height: width * 0.105,
              marginEnd: width * 0.435,
            }}
          />
        </View>
      </View>

      <View style={styles(theme, width).dropdown}>
        <DropDownPicker
          open={open}
          value={value}
          items={items.filter((item) => item.value !== value)}
          setOpen={setOpen}
          setValue={(callback: (arg0: string) => any) => {
            const newValue = callback(value);
            setValue(newValue);
            handleFilters(newValue);
          }}
          setItems={setItems}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          style={{
            borderWidth: 0,
            backgroundColor: theme.homeColor,
          }}
          dropDownContainerStyle={{
            borderWidth: 0,
            backgroundColor: theme.homeColor,
          }}
          placeholder={`${items.find((item) => item.value === value)?.label ||
            "Select an option"} (${filteredNotes.length})`}
          placeholderStyle={{
            textAlign: "center",
            fontSize: 22,
            fontWeight: "bold",
            color: theme.black,
            paddingLeft: 28,
          }}
          textStyle={{
            textAlign: "center",
            fontSize: 22,
            fontWeight: "bold",
            color: theme.black,
          }}
          showArrowIcon={true}
        />
      </View>
      {isSearchVisible && (
      <TextInput
        testID="searchBar"
        placeholder="Search notes.."
        onChangeText={handleSearch}
        style={styles(theme, width).seachBar}
        placeholderTextColor={theme.gray}
      />
      <View style={styles(theme, width).horizontalLine} />
      <View style={styles(theme, width).scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList(notes)}
        <TouchableOpacity
          style={styles(theme, width).addButton}
          onPress={() => {
            const untitledNumber = findNextUntitledNumber(notes);
            navigation.navigate("AddNote", { untitledNumber, refreshPage });
          }}
        >
          <Ionicons
            name="add-outline"
            size={32}
            color={theme.primaryColor}
            style={{ fontFamily: "Ionicons_" }}
          />
        </TouchableOpacity>
      </View>

      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />
    </View>
  );
};

const styles = (theme, width) =>
  StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      flex: 1,
      backgroundColor: theme.homeColor,
    },
    pfpText: {
      fontWeight: "600",
      fontSize: 14,
      alignSelf: "center",
      color: theme.white,
    },
    shareColor: {
      color: "green",
    },
    highlightColor: {
      color: theme.text,
    },
    backColor: {
      color: "red",
    },
    userPhoto: {
      height: width * 0.095,
      width: width * 0.095,
      borderRadius: 50,
      alignContent: "center",
      justifyContent: "center",
      backgroundColor: theme.black,
      marginLeft: 8,
    },
    noteTitle: {
      fontSize: 22,
      fontWeight: "700",
      maxWidth: "100%",
      flexShrink: 1,
      color: theme.text,
    },
    noteText: {
      marginTop: 10,
      fontSize: 18,
      color: theme.text,
    },
    scrollerBackgroundColor: {
      backgroundColor: theme.homeGray,
      flex: 1,
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
      marginBottom: 0,
      marginTop: 10,
      backgroundColor: theme.homeColor,
    },
    dropdown: {
      width: "100%",
      alignItems: "center",
      zIndex: 1000,
      marginTop: -13,
    },
    horizontalLine: {
      borderBottomColor: theme.text,
      borderBottomWidth: 1.8,
      marginBottom: 0,
    },
    noteContainer: {
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.primaryColor,
      marginTop: 1,
      width: "100%",
      flexDirection: "row",
      height: 185,
      paddingLeft: width * 0.03,
      paddingRight: width * 0.03,
    },
    seachBar: {
      backgroundColor: theme.homeColor,
      borderRadius: 20,
      fontSize: 18,
      padding: 20,
      margin: 20,
      color: theme.text,
      borderWidth: 3,
    },
    rowBack: {
      width: "100%",
      height: 140,
      alignItems: "center",
      backgroundColor: theme.homeGray,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 1,
      padding: 10,
      alignSelf: "center",
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
      backgroundColor: theme.homeGray,
      width: "50%",
      right: 0,
    },
  });

export default HomeScreen;
