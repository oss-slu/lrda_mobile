import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  Keyboard
} from "react-native";
import { useCallback } from "react";
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
import NotesComponent from "../components/NotesComponent";
import Greeting from "../components/Greeting";
import { useAddNoteContext } from "../context/AddNoteContext";
import LottieView from 'lottie-react-native';
import { green } from "react-native-reanimated/lib/typescript/Colors";

const { width, height } = Dimensions.get("window");
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
  const [userName, setUserName] = useState('');
  const [initialItems, setInitialItems] = useState([
    { label: "My Entries", value: "my_entries" },
    { label: "Published Entries", value: "published_entries" },
  ]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialItems[0].value);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(
    undefined
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const { setNavigateToAddNote } = useAddNoteContext();
  const { theme, isDarkmode } = useTheme();
  const animation = useRef(new Animated.Value(0)).current; // Animation value
  const screenWidth = Dimensions.get("window").width; // Screen width for full reveal
  let textLength = 18;

  
  useEffect(() => {
    const navigateToAddNote = () => {
      const untitledNumber = findNextUntitledNumber(notes);
      console.log("in homescreen untitled numbe ", untitledNumber);
      navigation.navigate("AddNote", { untitledNumber, refreshPage });
  
    }
    setNavigateToAddNote(() => navigateToAddNote)
  }, [navigation, notes])



  useEffect(() => {
    (async () => {
      const name = await user.getName();
      setUserName(name);
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
        isPrivate ? userId : "",
      );

      // Filter out archived notes; assume notes without `isArchived` are not archived
      const unarchivedNotes = data.filter((note: Note) => !note.isArchived);

      setMessages(unarchivedNotes);

      // Convert data and sort notes by date (latest first)
      const fetchedNotes = DataConversion.convertMediaTypes(unarchivedNotes)
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



  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const handleArchiveNote = async (note: Note | undefined, user: User) => {
    if (note?.id) {
      try {
        const userId = await user.getId();
        const updatedNote = {
          ...note,
          isArchived: true,
          published: false,
          archivedAt: new Date().toISOString(),
        };

        const response = await ApiService.overwriteNote(updatedNote);
        if (response.ok) {
          ToastMessage.show({
            type: "success",
            text1: "Success",
            text2: "Note successfully archived.",
          });
          updateNote(updatedNote); // Update the note in local state
          return true;
        } else {
          throw new Error("Archiving failed");
        }
      } catch (error) {
        ToastMessage.show({
          type: "error",
          text1: "Error",
          text2: "Failed to archive note. System failure. Try again later.",
        });
        console.error("Error archiving note:", error);
        return false;
      }
    } else {
      ToastMessage.show({
        type: "error",
        text1: "Error",
        text2: "You must first save your note before archiving it.",
      });
      return false;
    }
  };




  const findNextUntitledNumber = (notes: Note[]): number => {
    return notes.reduce((maxNumber, note) => {
        const match = note.title.match(/^Untitled (\d+)$/);
        if (match) {
            const number = parseInt(match[1], 10);
            return Math.max(maxNumber, number);
        }
        return maxNumber;
    }, 0) + 1;
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

  const deleteNote = (id: string, rowMap: any) => {
    if (rowMap[id]) {
      rowMap[id].closeRow();
    }

    const noteToDelete = notes.find((note) => note.id === id);

    if (noteToDelete) {
      handleArchiveNote(noteToDelete, user); // Pass the correct arguments
    }

    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
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
        const formattedTime = formatToLocalDateString(noteTime);
        return (
          note.title.toLowerCase().includes(lowerCaseQuery) ||
          formattedTime.includes(lowerCaseQuery)
        );
      })
      : notes;

    return isPrivate ? (

      filteredNotes.length > 0 ? (<SwipeListView
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
      />)
        : (<View style={styles(theme, width).resultNotFound}>

          <LottieView
            source={require('../../assets/animations/noResultFound.json')}
            autoPlay
            loop
            style={styles(theme, width).lottie}
          />
          <Text style={styles(theme, width).resultNotFoundTxt}>No Results Found</Text>
        </View>
        )

    ) : (
      filteredNotes.length > 0 ? (<SwipeListView
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />) :
        (<View style={styles(theme, width).resultNotFound}>

          <LottieView
            source={require('../../assets/animations/noResultFound.json')}
            autoPlay
            loop
            style={styles(theme, width).lottie}
          />
          <Text style={styles(theme, width).resultNotFoundTxt}>No Results Found</Text>
        </View>
        )
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
        style={{backgroundColor: isDarkmode? 'black' : '#e6e6e6'}}
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
        <NotesComponent IsImage={IsImage} resolvedImageURI={resolvedImageURI} ImageType={ImageType} textLength={textLength} showTime={showTime} item={item} isDarkmode={isDarkmode}/>
      </TouchableOpacity>
    );
  };


  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSearchBar = () => {
    if (isSearchVisible) {
      // Hide the search container
      setSearchQuery('');
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      // Show the search container
      setIsSearchVisible(true);
      Animated.timing(animation, {
        toValue: screenWidth - 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const searchBarWidth = animation.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, screenWidth],
  });



  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteTime = formatToLocalDateString(new Date(note.time));
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        noteTime.includes(searchQuery)
      );
    });
  }, [notes, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor : isDarkmode? 'black' : '#e4e4e4'}}>
      <StatusBar translucent backgroundColor="transparent" />
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
            <View style={styles(theme, width).userAccountAndPageTitle}>
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
              <Text style={styles(theme, width).pageTitle}>Notes</Text>
            </View>

            <View style={styles(theme, width).userWishContainer}>
              <Greeting />
              <Text style={styles(theme, width).userName}>{userName}</Text>
            </View>
          </View>


        </View>

        <View style={[styles(theme, width).toolContainer, { marginHorizontal: 20, }]}>
          {
            !isSearchVisible && (<View>
              <View style={styles(theme, width).publishedOrPrivateContainer}>
                <Pressable onPress={() => {
                  setIsPrivate(false);
                  setPublished(true);
                }}>
                  <View style={[styles(theme, width).publishedTxtContainer, { backgroundColor: isPrivate ? 'transparent' : 'black' },]}>
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? 'black' : 'white' }]}>Published</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => {
                  setIsPrivate(true);
                  setPublished(false);
                }}>
                  <View style={[styles(theme, width).publishedTxtContainer, { backgroundColor: isPrivate ? 'black' : 'transparent' }]}>
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? 'white' : 'black' }]}>Private</Text>
                  </View>
                </Pressable>
              </View>
            </View>)
          }
          <View style={[styles(theme, width).searchParentContainer, { width: isSearchVisible ? '95%' : 40 }]}>

            {/* Search Container */}
            {isSearchVisible && (
              <Animated.View
                style={[
                  styles(theme, width).searchContainer,
                  {
                    width: searchBarWidth,
                  },
                  {
                    marginBottom: 23,
                  }
                ]}
              >
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={(e) => setSearchQuery(e)}
                  style={[styles(theme, width).searchInput]}
                  cursorColor='black'
                  autoFocus={true}
                />
              </Animated.View>
            )}
            {
              isSearchVisible ? (
                <View style={[styles(theme, width).seachIcon, {marginTop: -25}]}>
                  <TouchableOpacity onPress={toggleSearchBar}>
                    <Ionicons name='close' size={25} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles(theme, width).searchIcon}>
                  <TouchableOpacity onPress={toggleSearchBar}>
                    <Ionicons name='search' size={25} />
                  </TouchableOpacity>
                </View>
              )
            }
          </View>

        </View>
      </View>

      <View style={styles(theme, width).scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList(notes)}
      </View>

      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />
    </View>
  );
};

const styles = (theme, width, color, isDarkmode) =>
  StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      height: height * 0.18,
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
      color: theme.text,
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
      color: theme.text
    },
    backRightBtnRight: {
      backgroundColor: theme.homeGray,
      width: "50%",
      right: 0,
      color: theme.text
    },
    userWishContainer: {
      marginRight: 10
    },
    userName: {
      fontWeight: '500'
    },
    toolContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    publishedOrPrivateContainer: {
      backgroundColor: '#e7e7e7',
      height: 30,
      width: 120,
      borderRadius: 20,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    publishedTxtContainer: {
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderRadius: 20,
    },
    publishedTxt: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    searchContainer: {
      right: 0,
      bottom: 0,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      height: 36,
      borderRadius: 25,
      overflow: "hidden", // Ensures the reveal is smooth
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "black",
      paddingHorizontal: 10,
      paddingVertical: 0, 
      width: "100%",
    },
    searchIcon: {
      marginBottom: 10,
    },
    searchParentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userAccountAndPageTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '27%',

    },
    pageTitle: {
      fontSize: 18,
      fontWeight: '500'

    },
    lottie: {
      width: 100,
      height: 200,
    },
    resultNotFound: {

      justifyContent: 'center',
      alignItems: 'center'
    },
    resultNotFoundTxt: {
      fontSize: 15,
      fontWeight: '400',
    },

  });

export default HomeScreen;






