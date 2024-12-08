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
import { useAddNoteContext } from "../context/AddNoteContext";
import Greeting from "../components/Greeting";
import NotesComponent from "../components/NotesComponent";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const user = User.getInstance();

const Library = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isFilterOpned, setIsFilterOpned] = useState(false)
  const [published, setPublished] = useState(true);
  const [reversed, setReversed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  const [globeIcon, setGlobeIcon] = useState("earth-outline");
  const { width } = Dimensions.get("window");
  const [initialItems, setInitialItems] = useState([
    { label: "My Entries", value: "my_entries" },
    { label: "Published Entries", value: "published_entries" },
  ]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(
    undefined
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('')
  const { theme } = useTheme();
  const { setNavigateToAddNote } = useAddNoteContext();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current; // Animation value
  const screenWidth = Dimensions.get("window").width; // Screen width for full reveal

  let textLength = 18;

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
  }, [updateCounter, published]);

  const fetchMessages = async () => {
    try {
      // Fetch all public notes (published and not archived)
      const data = await ApiService.fetchMessages(
        true,
        false,
        "someUserId"
      );
  
      console.log('inside fetch messages, ', data)
      // Filter out archived notes; assume notes without `isArchived` are not archived
      const publicNotes = data.filter((note: Note) => !note.isArchived && note.published);
  
      // Convert data and sort notes by date (latest first)
      const fetchedNotes = DataConversion.convertMediaTypes(publicNotes)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
      setNotes(reversed ? fetchedNotes.reverse() : fetchedNotes);
      setRendering(false);
    } catch (error) {
      console.error("Error fetching public notes:", error);
      ToastMessage.show({
        type: "error",
        text1: "Error fetching notes",
        text2: error.message,
      });
    }
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


  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

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

    return published && (
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
    )
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
        <NotesComponent IsImage={IsImage} resolvedImageURI={resolvedImageURI} ImageType={ImageType} textLength={textLength} showTime={showTime} item={item} />
       
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
            <Text style={styles(theme, width).pageTitle}>Library</Text>
          </View>

          <View style={styles(theme, width).userWishContainer}>
            <Greeting />
            <Text style={styles(theme, width).userName}>{userName}</Text>
          </View>
        </View>


      </View>

      <View style={[styles(theme, width).toolContainer, { marginHorizontal: 20 }]}>
        {
          !isSearchVisible && (<View>
            <TouchableOpacity>
              <MaterialIcons name='sort' size={30}/>
            </TouchableOpacity>
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
                autoFocus={true}
              />
            </Animated.View>
          )}
          {
            isSearchVisible ? (
              <View style={styles(theme, width).seachIcon}>
              <TouchableOpacity onPress={toggleSearchBar}>
                <Ionicons name='close' size={25} />
              </TouchableOpacity>
            </View>
            ) : (
              <View style={styles(theme, width).seachIcon}>
                <TouchableOpacity onPress={toggleSearchBar}>
                  <Ionicons name='search' size={25} />
                </TouchableOpacity>
              </View>
            )
          }
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
    dropdown: {
      width: "100%",
      alignItems: "center",
      zIndex: 1000,
      marginTop: -13,
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
      color: theme.text
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
      marginBottom: 10
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
      top: 10,
      bottom: 0,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      borderRadius: 25,
      overflow: "hidden", // Ensures the reveal is smooth

    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "black",
      paddingHorizontal: 10,
      width: "100%",

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
      width: '29%',

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
    }

  });

export default Library;