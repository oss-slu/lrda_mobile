import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
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
import DropDownPicker from 'react-native-dropdown-picker';
import NoteDetailModal from "./mapPage/NoteDetailModal";

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
  const { width, height } = Dimensions.get("window");
  const [initialItems, setInitialItems] = useState([
    {label: 'My Entries', value: 'my_entries'},
    {label: 'Published Entires', value: 'published_entries'},
    // {label: 'Liked Entries', value: 'liked_entries'},
  ]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialItems[0].value);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);

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
    if (name == "published_entries") {
      setIsPrivate(false);
      setPublished(true);
      refreshPage();
    } else if (name == "my_entries") {
      setIsPrivate(true);
      setPublished(false);
      refreshPage();
    }
    else if (name == "liked_entries") {
      // implement liked feature
    }
  };

  useEffect(() => {
    handleFilters(value); // Call on initial render with the default value
  }, []);

  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const findNextUntitledNumber = (notes : Note[]) => {
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
  

  const styles = StyleSheet.create({
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
      color: 'green',
    },
    highlightColor: {
      color: theme.text,
    },
    backColor: {
      color: 'red',
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
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
      marginTop: -12,
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
      //borderRadius: 20,
      marginTop: 1,
      width: "100%",
      //padding: 10,
      flexDirection: "row",
      height: 140,
      paddingLeft: width * 0.03,
      paddingRight: width * 0.03,
    },
    filtersContainer: {
      minHeight: 30,
      alignSelf: "center",
      borderRadius: 20,
      paddingHorizontal: 5,
      maxHeight: 30,
      marginBottom: 10,
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
      fontSize: 33,
      fontWeight: "bold",
      lineHeight: 80,
      color: theme.text,
      marginLeft: 5,
      marginBottom: "-1%",
      marginRight: 55,
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
      // borderTopRightRadius: 20,
      // borderBottomRightRadius: 20,
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
            console.log(item);
            const formattedNote = {
              ...item,
              time: formatToLocalDateString(new Date(item.time)),
              description: item.text,
              images: 
                item.media.map((mediaItem: { uri: any; }) => ({ uri: mediaItem.uri }))
            };
            console.log(formattedNote.description);
            setSelectedNote(formattedNote);
            setModalVisible(true);
          }
        }}
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
            paddingBottom: 15,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.userPhoto,
              { backgroundColor: theme.black },
            ]}
            onPress={() => {
              navigation.navigate("AccountPage");
            }}
          >
            <Text style={styles.pfpText}>{userInitials}</Text>
          </TouchableOpacity>
          <Image source={require('../../assets/icon.png')} style={{width: width * 0.105, height: width * 0.105, marginEnd: width * 0.435}} />
        </View>
      </View>
      <View style={styles.dropdown}>
        <DropDownPicker
          open={open}
          value={value}
          items={items.filter(item => item.value !== value)}
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
          placeholder={`${items.find(item => item.value === value)?.label || 'Select an option'} (${notes.length})`}
          placeholderStyle={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.black,
            paddingLeft: 28,
          }}
          textStyle={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.black,
          }}
          showArrowIcon={true}
        /> 
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList(notes)}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            const untitledNumber = findNextUntitledNumber(notes);
            navigation.navigate("AddNote", { untitledNumber, refreshPage });
          }}
        >
          <Ionicons name="add-outline" size={32} color={theme.primaryColor} style={{ fontFamily: 'Ionicons_' }} />
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

export default HomeScreen;
